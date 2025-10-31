import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

let mapInstance = null; // Store the map instance globally in the module

/**
 * Initializes the map if it hasn't been already.
 */
export function initMap() {
    if (mapInstance) {
        console.log("Map already initialized. Skipping.");
        return mapInstance;
    }

    console.log("--- Initializing MapLibre GL Map ---");

    // CRUCIAL: The map logic is now here and will only execute when this function is called.
    const style = {
        "version": 8,
        "glyphs": 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf', // openmaptiles/fonts  endpoint
        "sources": {
            "osm": {
                "type": "raster",
                "tiles": ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"],
                "tileSize": 256,
                "attribution": "&copy; OpenStreetMap Contributors",
                "maxzoom": 19
            }
        },
        "layers": [
            {
                "id": "osm",
                "type": "raster",
                "source": "osm" // This must match the source key above
            }
        ]
    };

    const map = new maplibregl.Map({
        container: 'map',
        style: 'https://demotiles.maplibre.org/style.json' /*style*/,
        center: [-3.97300533, 40.79907993,],
        zoom: 5
    });

    map.addControl(new maplibregl.NavigationControl({
        visualizePitch: true,
        visualizeRoll: true,
        showZoom: true,
        showCompass: true
    }));

    map.on('zoomend', () => {
        console.log('Current zoom level:', map.getZoom());
    })

    mapInstance = map;
    return mapInstance;
}

/**
 * Destroys the map instance to free up resources when navigating away.
 */
export function destroyMap() {
    if (mapInstance) {
        console.log("--- Destroying MapLibre GL Map ---");
        mapInstance.remove();
        mapInstance = null;
    }
}