// Research (Phase 3 — Authentic Mountain Skyline):
//
// Real ranges visible from the Lake Tekapo township/lakefront, and how each
// one is represented below. World convention established in Phase 1/2: the
// town sits at +Z ("south"), the lake stretches away toward -Z ("north"),
// +X is "east", -X is "west" — matching LAKE_SHORELINE's bay indentation
// being on the +X ("east") shore.
//
// - Two Thumb Range (east, angle ~28-150) — the closest, most prominent
//   range as seen from the town/lakefront: a rocky, tussock-brown ridgeline
//   running roughly north-south along the east side of the basin. No
//   permanent snow at the elevation visible from the valley floor. Given a
//   distinctive close double-peak near its middle (a stylized nod to the
//   range's name, not a survey-accurate reproduction of the actual named
//   summit).
// - Ben Ohau Range (west/southwest, angle ~210-300) — a lower, more rolling
//   near-layer range on the opposite side of the basin. Same treatment as
//   Two Thumb (rock/tussock tones, no snow) but lower on average — it reads
//   as a secondary range, not the skyline's main event.
// - Southern Alps, visible section (far layer, angle ~300-45, wrapping
//   through north) — the tallest, snow-capped peaks, set well back and
//   higher for atmospheric depth (lighter, hazier color). Deliberately left
//   as a gap in the near layer so this range is unobstructed looking north
//   across the lake, which is the single most recognizable "that's Tekapo"
//   view: open water leading the eye to distant snow peaks.
// - Godley Valley / Macaulay Valley (the low saddle at angle 0/340 in the
//   far range) — these two valleys join at the lake's northern head and
//   read, from the town, as a distinct low gap in an otherwise continuous
//   distant ridgeline. Represented as a dip to roughly a third of the
//   flanking peaks' height rather than as separate geometry, since the
//   valleys themselves aren't part of the skyline silhouette — their
//   visual signature IS the gap.
//
// Per the brief, this favors the minimum number of ridgelines that read as
// "Tekapo" over a survey-accurate reproduction: three named ranges plus one
// low, unnamed filler arc behind the town (south, angle 150-210) so the
// player is never able to see past the mountain ring in any direction
// without needing a fourth named range for an area they rarely look toward.

// Angle is degrees clockwise from north (-Z), matching the world's existing
// "town at +Z / lake toward -Z" convention: 0 = north (deep lake/valley),
// 90 = east (Two Thumb side), 180 = south (behind town), 270 = west (Ben
// Ohau side). Height is world units at that point on the ridgeline; straight
// segments between consecutive points, same convention as LAKE_SHORELINE.
// Adjacent ranges that should connect seamlessly share an identical
// {angle, height} endpoint (e.g. Two Thumb's start matches the filler arc's
// end) so the merged ring has no visible seam.
//
// Height calibration note: the follow-camera (CameraController.jsx) sits
// pitched ~17.4Β° below horizontal at all times (it has no independent
// look-up control) with a 50Β° vertical FOV — leaving only ~7.6Β° of true
// elevation angle above the camera's forward direction before geometry
// clips off the top of frame. Heights below are picked so even the tallest
// peaks stay inside that budget at their layer's distance (near ~64 units
// from camera, far ~109), rather than the taller values a real 2000-2500m
// range would suggest — verified by screenshot at the town/spawn viewpoint.

// Shared per-layer radii. Ranges on the same layer must use the same
// `distance` (peak radius) so their ridgelines connect into one continuous
// arc/ring — kept here as named constants rather than repeated magic
// numbers in each range entry.
export const LAYER_PEAK_RADIUS = { near: 85, far: 130 }

// Where the base of each layer's ridge wall sits, radially. Deliberately
// inset from the peak radius (a "flared skirt", peaks further out than
// bases) so the wall's foot is always safely grounded on real terrain:
// NEAR_BASE (58) sits inside the terrain's on-axis edge (WORLD_HALF_SIZE =
// 60) and outside the tree/player scatter bound (PLAYABLE_BOUNDS = 56), so
// nothing pokes through the mountain base and no gap of bare void opens up
// beneath it. FAR_BASE (59) sits just inside that same terrain edge so the
// far layer is also fully grounded across the north gap, where it's the
// only mountain geometry present.
export const LAYER_BASE_RADIUS = { near: 58, far: 59 }

// How far below y=0 the ridge wall's base sits — an extra margin (on top of
// the radial inset above) so a floating-point seam against the terrain
// surface is never visible even where the terrain itself isn't perfectly
// flat (the foothill layer adds gentle relief near the world edge).
export const RIDGE_BASE_DEPTH = -4

export const MOUNTAIN_RANGES = [
  {
    id: 'two-thumb-range',
    layer: 'near',
    distance: LAYER_PEAK_RADIUS.near,
    baseColor: '#7d7264',
    snowCap: null,
    ridge: [
      { angle: 28, height: 2 }, // rises out of the northern gap
      { angle: 40, height: 6 },
      { angle: 55, height: 9 }, // major peak
      { angle: 62, height: 8 }, // second close peak — the range's namesake "two thumb" silhouette
      { angle: 70, height: 5 }, // saddle
      { angle: 85, height: 7 }, // secondary peak
      { angle: 100, height: 4 },
      { angle: 118, height: 6 },
      { angle: 135, height: 3 },
      { angle: 150, height: 2 }, // tapers toward the southern filler arc
    ],
  },
  {
    id: 'southern-filler-hills',
    layer: 'near',
    distance: LAYER_PEAK_RADIUS.near,
    baseColor: '#7d7264',
    snowCap: null,
    ridge: [
      { angle: 150, height: 2 }, // matches Two Thumb's last point exactly
      { angle: 165, height: 2 },
      { angle: 180, height: 2 }, // due south, directly behind the town
      { angle: 195, height: 2 },
      { angle: 210, height: 2 }, // matches Ben Ohau's first point exactly
    ],
  },
  {
    id: 'ben-ohau-range',
    layer: 'near',
    distance: LAYER_PEAK_RADIUS.near,
    baseColor: '#8a8172',
    snowCap: null,
    ridge: [
      { angle: 210, height: 2 },
      { angle: 225, height: 4 },
      { angle: 240, height: 7 }, // major peak
      { angle: 255, height: 4 }, // saddle
      { angle: 270, height: 5 }, // secondary peak
      { angle: 285, height: 4 },
      { angle: 300, height: 2 }, // descends into the northern gap
    ],
  },
  {
    id: 'southern-alps-far',
    layer: 'far',
    distance: LAYER_PEAK_RADIUS.far,
    baseColor: '#9fb0c2',
    // Segments whose peak height is at or above minHeight get their tip
    // (from minHeight up to the peak) colored as snow instead of rock.
    snowCap: { color: '#f4f7fa', minHeight: 12 },
    ridge: [
      { angle: 300, height: 4 }, // rises out of the Ben Ohau gap
      { angle: 315, height: 12 },
      { angle: 328, height: 15 }, // major peak, toward the main divide
      { angle: 340, height: 10 }, // Macaulay Valley saddle
      { angle: 350, height: 14 },
      { angle: 0, height: 6 }, // Godley Valley gap — due north, the lake's head
      { angle: 10, height: 13 },
      { angle: 22, height: 16 }, // major peak
      { angle: 35, height: 9 },
      { angle: 45, height: 4 }, // descends toward the Two Thumb gap
    ],
  },
]
