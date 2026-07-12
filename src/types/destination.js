/**
 * Shape of a destination as returned by src/services/destinationService.js
 * (already flattened from the `destinations` + `destination_categories` +
 * `destination_experiences` tables — see supabase/migrations/0006_destinations.sql).
 * Documented here (JSDoc only — the project is plain JS/JSX, not TypeScript)
 * so editors can still surface field names/types via intellisense.
 *
 * @typedef {Object} DestinationExperience
 * @property {string} id
 * @property {string} name
 * @property {string|null} category - value from LOCATION_CATEGORIES, drives the icon shown
 * @property {string|null} description
 * @property {number} sort_order
 *
 * @typedef {Object} Destination
 * @property {string} id
 * @property {string} name
 * @property {string[]} categories - every category value this destination belongs to
 * @property {DestinationExperience[]} experiences - every named experience offered here
 * @property {string|null} description
 * @property {string|null} address
 * @property {number} latitude
 * @property {number} longitude
 * @property {string|null} image_url
 * @property {boolean} visible
 * @property {string} created_at
 * @property {string} updated_at
 */

export {}
