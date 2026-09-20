/**
 * Shape of a row in the `studio_items` table (see
 * supabase/migrations/0009_studio_content.sql). Little Lantern Studios' Apps
 * and Projects share this one table, distinguished by `kind`.
 * Documented here (JSDoc only — the project is plain JS/JSX, not TypeScript)
 * so editors can still surface field names/types via intellisense.
 *
 * @typedef {Object} StudioItem
 * @property {string} id
 * @property {'app'|'project'} kind
 * @property {string} title
 * @property {string} slug
 * @property {string|null} tagline
 * @property {string|null} description
 * @property {object|null} content
 * @property {'Live'|'In Progress'|'Planned'|'Archived'} status
 * @property {string[]} tech_stack
 * @property {string|null} demo_url
 * @property {string|null} app_store_url
 * @property {string|null} github_url
 * @property {string|null} cover_media_id
 * @property {boolean} visible
 * @property {number} sort_order
 * @property {string} created_at
 * @property {string} updated_at
 */

export const STUDIO_ITEM_KINDS = /** @type {const} */ (['app', 'project'])

export const STUDIO_ITEM_STATUSES = /** @type {const} */ (['Live', 'In Progress', 'Planned', 'Archived'])

export {}
