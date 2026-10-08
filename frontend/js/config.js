/**
 * HealthPulse — Health Intelligence Platform
 * File: js/config.js
 * Description: Centralized frontend configuration for OpenStreetMap and application settings.
 * 
 * OPENSTREETMAP CONFIGURATION:
 * Powered directly by OpenStreetMap (OSM) via Leaflet.js.
 * No API keys or external authentication required.
 */

const HEALTHPULSE_CONFIG = {
  // Map Provider: OpenStreetMap (No API key required)
  MAP_PROVIDER: "OpenStreetMap",
  OSM_TILE_URL: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  OSM_ATTRIBUTION: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',

  // Default Map Center & Zoom (Metropolitan Surveillance Cluster)
  DEFAULT_MAP_CENTER: [40.72, -74.00],
  DEFAULT_MAP_ZOOM: 10,

  // Fixed deterministic geographic surveillance coordinates for HealthPulse demonstration regions
  REGION_COORDINATES: {
    "Gotham": [40.78, -74.02],
    "Metropolis": [40.68, -74.04],
    "Star City": [40.85, -74.15],
    "Central City": [40.62, -73.96],
    "Coast City": [40.58, -73.85]
  }
};

const CODEASTRA_CONFIG = HEALTHPULSE_CONFIG;


