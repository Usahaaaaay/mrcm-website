// Base URL of the Express backend (server/). Falls back to the local dev
// server's default port so the app works out of the box even if VITE_API_URL
// hasn't been set yet — production (Netlify) always sets VITE_API_URL
// explicitly to the deployed Render URL, so this fallback never applies there.
const DEFAULT_DEV_API_URL = 'http://localhost:5050'

export const API_BASE_URL = import.meta.env.VITE_API_URL || DEFAULT_DEV_API_URL
