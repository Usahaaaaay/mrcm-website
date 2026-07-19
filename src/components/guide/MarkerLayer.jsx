import { memo, useCallback, useMemo, useState } from 'react'
import L from 'leaflet'
import { Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import { createCategoryDivIcon, createClusterDivIcon, createUserLocationDivIcon, createSelectionRingIcon } from './mapIcons'
import DestinationPopup from './DestinationPopup'

/**
 * Extracted so `position`/`eventHandlers` can be memoized per-destination
 * with `useMemo`/`useCallback` (not possible inline inside a parent's
 * `.map()` — hooks can't run in a loop). Without this, `<Marker
 * position={[lat,lng]} eventHandlers={{click:...}}>` creates a brand-new
 * array/object every time MarkerLayer re-renders (e.g. on every zoomend/
 * moveend-driven `viewTick` bump), even when nothing about this specific
 * destination changed. That was confirmed to cause react-leaflet to tear
 * down and recreate the marker's underlying Leaflet layer on unrelated
 * re-renders — which closes any popup bound to it as a natural consequence
 * of the layer being removed (verified via a stack trace: React's own
 * reconciliation calling react-leaflet's `removeLayer`, not any app code).
 * Stable references here mean react-leaflet sees "nothing changed" and
 * leaves the underlying marker/popup alone.
 */
const DestinationMarker = memo(function DestinationMarker({ destination, lat, lng, onSelect }) {
  // Memoized on the raw numbers, not an array literal passed down from the
  // parent — an array prop would itself be a new reference every parent
  // render, defeating the purpose.
  const position = useMemo(() => [lat, lng], [lat, lng])
  const icon = useMemo(() => createCategoryDivIcon(destination.categories[0]), [destination.categories])
  // Leaflet markers don't bubble clicks to the map by default
  // (bubblingMouseEvents: false), but stopping propagation explicitly here
  // makes "a marker click can never be reinterpreted as a map/cluster click"
  // an invariant of this handler rather than an implicit default — selecting
  // a destination must always win, unconditionally.
  const eventHandlers = useMemo(
    () => ({
      click: (event) => {
        L.DomEvent.stopPropagation(event)
        onSelect(destination.id)
      },
    }),
    [destination.id, onSelect]
  )

  return (
    <Marker position={position} icon={icon} eventHandlers={eventHandlers}>
      {/* autoPan disabled: FlyToSelected (GuideMap.jsx) already brings this
          destination into view (only when it isn't already visible — see
          that file) the instant it's selected. closeOnClick disabled:
          Leaflet's Popup registers a map-level `preclick` handler that
          closes it by default (meant for "click elsewhere on the map to
          dismiss"); selecting a destination is the only supported way to
          close this popup, so that trigger is unneeded here. */}
      <Popup minWidth={220} autoPan={false} closeOnClick={false}>
        <DestinationPopup destination={destination} />
      </Popup>
    </Marker>
  )
})

/** Same reasoning as DestinationMarker — stable position/eventHandlers so an
 *  unrelated re-render (e.g. another cluster's click) doesn't tear down and
 *  recreate this one. Cluster bubbles have no popup, so this is purely a
 *  performance/consistency improvement rather than fixing a visible bug. */
const ClusterMarker = memo(function ClusterMarker({ cluster, onSelect }) {
  const position = useMemo(() => cluster.centroid, [cluster.centroid])
  const icon = useMemo(() => createClusterDivIcon(cluster.count), [cluster.count])
  const eventHandlers = useMemo(
    () => ({
      click: (event) => {
        L.DomEvent.stopPropagation(event)
        onSelect(cluster)
      },
    }),
    [cluster, onSelect]
  )

  return <Marker position={position} icon={icon} eventHandlers={eventHandlers} />
})

// On-screen pixel radius (at the current zoom) within which two destinations
// are grouped into one cluster bubble — tuned to roughly a marker's own
// diameter plus a little breathing room, not a fixed geographic distance, so
// clustering behaves consistently at every zoom level.
const CLUSTER_PIXEL_RADIUS = 44

// The highest zoom flyToBounds will ever animate to. Real destinations can
// sit close enough together (neighbouring shopfronts, one building with
// several businesses) that they're still within CLUSTER_PIXEL_RADIUS of each
// other even at this zoom — no amount of further zooming will ever separate
// them. Rather than flying the view in with no visible result (which looks
// exactly like "the cluster doesn't respond to clicks"), such a cluster is
// "spiderfied" instead: fanned out into individually visible/clickable
// markers around its centroid, without changing the zoom at all.
const MAX_FLY_ZOOM = 18
const SPIDERFY_RADIUS_PX = 42

const average = (values) => values.reduce((sum, v) => sum + v, 0) / values.length

/** Groups destinations that are within CLUSTER_PIXEL_RADIUS screen pixels of
 *  each other at the map's current zoom/pan. Greedy single-link grouping: pick
 *  an unclustered point as a seed, absorb every remaining point within radius
 *  of that seed. O(n^2) worst case, trivial at this dataset's size (~70). */
function clusterDestinations(destinations, map) {
  const points = destinations.map((destination) => ({
    destination,
    point: map.latLngToContainerPoint([destination.latitude, destination.longitude]),
  }))

  const used = new Array(points.length).fill(false)
  const groups = []

  for (let i = 0; i < points.length; i++) {
    if (used[i]) continue
    const group = [points[i]]
    used[i] = true
    for (let j = i + 1; j < points.length; j++) {
      if (used[j]) continue
      if (points[i].point.distanceTo(points[j].point) <= CLUSTER_PIXEL_RADIUS) {
        group.push(points[j])
        used[j] = true
      }
    }
    groups.push(group)
  }

  return groups
}

const EMPTY_SET = new Set()

/**
 * Rendered as a child of <MapContainer> (same pattern as FlyToSelected/
 * MapResizeHandler in GuideMap.jsx — call useMap() directly, no ref-forwarding
 * needed). Groups of one destination render exactly as before (identical
 * <Marker>/<Popup> JSX), groups of more than one render as a single cluster
 * bubble that flies/zooms into its bounds on click — or, if its members are
 * too close together to ever separate by zooming (see MAX_FLY_ZOOM),
 * spiderfies into a small fan of individually clickable markers instead.
 *
 * Spiderfy state (`spiderfy`) is deliberately independent from the live
 * `clusters` computation below, not derived from it: it's a frozen snapshot
 * (which member ids were fanned out, and around which centroid) taken once
 * when a cluster is clicked. If it were instead re-derived every render by
 * looking up "the cluster with this id" in the freshly recomputed `clusters`
 * array, selecting one of its members would break that lookup immediately —
 * clustering always excludes the selected destination (so its popup/ring
 * never gets swallowed into a bubble), which changes that group's membership
 * and therefore its id (`members.map(id).join('|')`) the instant a selection
 * happens, on the very same render, before any zoom/pan even occurs. That
 * was the actual mechanism behind "the spiderfy collapses the moment you
 * click one of its markers" — not a timing/race issue, but an identity
 * mismatch. A frozen snapshot has no such dependency on live membership, so
 * selecting a member can never invalidate it — only the explicit exit
 * conditions below (real zoom change, real pan away, background click,
 * another cluster opened) can.
 */
const MarkerLayer = ({ destinations, selectedId, onSelectLocation, userLocation }) => {
  const map = useMap()
  const [viewTick, setViewTick] = useState(0)
  const [spiderfy, setSpiderfy] = useState(null) // { memberIds: Set<string>, centroid: [lat,lng], zoomAtOpen: number } | null

  useMapEvents({
    zoomend: () => {
      setViewTick((tick) => tick + 1)
      // Exit condition: a real zoom level change. A programmatic flyTo that
      // merely pans (or that FlyToSelected now skips entirely when the
      // target is already visible — see GuideMap.jsx) won't fire this with a
      // different zoom, so this only fires for a genuine zoom change.
      setSpiderfy((current) => (current && map.getZoom() !== current.zoomAtOpen ? null : current))
    },
    moveend: () => {
      setViewTick((tick) => tick + 1)
      // Exit condition: a significant pan — the spiderfy's anchor point has
      // left the viewport entirely, so its fanned members no longer make
      // sense to keep showing.
      setSpiderfy((current) => (current && !map.getBounds().contains(current.centroid) ? null : current))
    },
    // Exit condition: clicking empty map. Markers/clusters call
    // stopPropagation in their own click handlers above, and Leaflet markers
    // don't bubble clicks to the map by default (bubblingMouseEvents: false)
    // — so this only ever fires for a genuine background click. Leaflet's
    // Popup independently calls L.DomEvent.disableClickPropagation on its own
    // content, so clicks inside an open popup (e.g. reading it, clicking a
    // link) don't reach this handler either; the `closest` check below is
    // just a defensive backstop for that same guarantee.
    click: (event) => {
      if (event.originalEvent?.target?.closest?.('.leaflet-popup')) return
      onSelectLocation(null)
      setSpiderfy(null)
    },
  })

  const { singles, clusters, selected } = useMemo(() => {
    // The selected destination is never clustered away — if it got swallowed
    // into a cluster bubble after a zoom-out, its open popup would disappear,
    // which is exactly the regression this must avoid. Members of an open
    // spiderfy are also excluded here: they're rendered individually via
    // `spiderfiedMembers` below, and must not simultaneously be regrouped
    // into a cluster bubble by this computation while that's open.
    const selected = destinations.find((destination) => destination.id === selectedId) ?? null
    const spiderfiedIds = spiderfy?.memberIds ?? EMPTY_SET
    const clusterable = destinations.filter((destination) => destination.id !== selectedId && !spiderfiedIds.has(destination.id))

    const groups = clusterDestinations(clusterable, map)

    const clusters = groups
      .filter((group) => group.length > 1)
      .map((group) => ({
        id: group
          .map((entry) => entry.destination.id)
          .sort()
          .join('|'),
        count: group.length,
        members: group.map((entry) => entry.destination),
        centroid: [average(group.map((entry) => entry.destination.latitude)), average(group.map((entry) => entry.destination.longitude))],
        bounds: L.latLngBounds(group.map((entry) => [entry.destination.latitude, entry.destination.longitude])),
      }))

    // Built by filtering `destinations` in its own original order — NOT by
    // concatenating "solo groups" + "the selected one" as two separate
    // spreads (`[...groups..., ...(selected ? [selected] : [])]`). That
    // earlier version moved the selected destination's position within the
    // array every time selection changed (it always landed last), which —
    // despite every marker having a stable `key` — was confirmed (via a
    // captured stack trace: react-leaflet's own reconciliation calling
    // `removeLayer` on the marker, closing its just-opened popup as a
    // consequence) to cause react-leaflet to tear down and recreate that
    // marker's underlying Leaflet layer. Filtering in place means a
    // destination's index only ever changes because an *earlier* item's
    // membership changed, not because it personally got selected.
    const soloIds = new Set(groups.filter((group) => group.length === 1).map((group) => group[0].destination.id))
    if (selected) soloIds.add(selected.id)
    const singles = destinations.filter((destination) => soloIds.has(destination.id))

    return { singles, clusters, selected }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destinations, selectedId, viewTick, map, spiderfy])

  const handleClusterClick = useCallback(
    (cluster) => {
      // getBoundsZoom tells us the zoom Leaflet would actually use to fit this
      // cluster's bounds in the viewport. If that's at or beyond MAX_FLY_ZOOM,
      // flying there wouldn't zoom in any further than the cap allows — the
      // members are close enough together that no amount of zooming will ever
      // visibly separate them, so flying would look like nothing happened (this
      // is the exact "cluster doesn't respond to clicks" bug). Spiderfy instead.
      // Note: >= , not > — a required zoom exactly equal to the cap still means
      // "we can't zoom in further to help," not "we're just barely fine."
      const requiredZoom = map.getBoundsZoom(cluster.bounds, false, L.point(64, 64))
      if (requiredZoom >= MAX_FLY_ZOOM) {
        setSpiderfy({
          memberIds: new Set(cluster.members.map((destination) => destination.id)),
          centroid: cluster.centroid,
          zoomAtOpen: map.getZoom(),
        })
      } else {
        setSpiderfy(null) // opening a different, zoomable cluster supersedes any existing spiderfy
        map.flyToBounds(cluster.bounds, { padding: [64, 64], maxZoom: MAX_FLY_ZOOM, duration: 0.5 })
      }
    },
    [map]
  )

  // Fan a spiderfied cluster's members into a small ring of distinct screen
  // positions around its (frozen) centroid, converted back to real lat/lng at
  // the current view. Each member's angular slot is based on its index within
  // the *original, full* member list (captured once in `spiderfy.memberIds`,
  // whose insertion order Set preserves) rather than the shrinking list of
  // "members not yet selected" — so the remaining fanned markers hold their
  // position instead of reflowing to fill the gap every time one is selected.
  const spiderfiedMembers = useMemo(() => {
    if (!spiderfy) return []
    const orderedIds = [...spiderfy.memberIds]
    const center = map.latLngToContainerPoint(spiderfy.centroid)
    return orderedIds
      .map((id, index) => {
        if (id === selectedId) return null // rendered via the normal selected/single path instead
        const destination = destinations.find((entry) => entry.id === id)
        if (!destination) return null
        const angle = (2 * Math.PI * index) / orderedIds.length
        const point = L.point(center.x + SPIDERFY_RADIUS_PX * Math.cos(angle), center.y + SPIDERFY_RADIUS_PX * Math.sin(angle))
        const latLng = map.containerPointToLatLng(point)
        return { destination, position: [latLng.lat, latLng.lng] }
      })
      .filter(Boolean)
  }, [spiderfy, selectedId, destinations, map])

  return (
    <>
      {/* Rendered first (and pushed behind via zIndexOffset) so it never
          intercepts clicks meant for the actual marker/popup above it. */}
      {selected ? (
        <Marker
          position={[selected.latitude, selected.longitude]}
          icon={createSelectionRingIcon()}
          interactive={false}
          zIndexOffset={-1000}
        />
      ) : null}

      {singles.map((destination) => (
        <DestinationMarker
          key={destination.id}
          destination={destination}
          lat={destination.latitude}
          lng={destination.longitude}
          onSelect={onSelectLocation}
        />
      ))}

      {clusters.map((cluster) => (
        <ClusterMarker key={cluster.id} cluster={cluster} onSelect={handleClusterClick} />
      ))}

      {spiderfiedMembers.map(({ destination, position }) => (
        <DestinationMarker
          key={destination.id}
          destination={destination}
          lat={position[0]}
          lng={position[1]}
          onSelect={onSelectLocation}
        />
      ))}

      {userLocation ? (
        <Marker position={[userLocation.lat, userLocation.lng]} icon={createUserLocationDivIcon()} interactive={false} />
      ) : null}
    </>
  )
}

export default MarkerLayer
