import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapboxOverlay } from '@deck.gl/mapbox';
import { ScatterplotLayer, GeoJsonLayer } from '@deck.gl/layers';

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
        style: style,
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

    map.on('load', () => {
        const geoJsonDataUrl = `http://localhost:8081/geoserver/ows?service=WFS&version=1.1.0&request=GetFeature&typename=testing_the_waters:spain_osm_postcode_points&outputformat=application/json&srsName=EPSG:4326`;

        //ESTO SERÍA PARA SI LAS FEATURES HAY QUE MONTARLAS O LEERLAS DE ALGUN LADO
        // const scatter = ScatterplotLayer({
        //   id: "postal-codes",
        //   data: features,
        //   getPosition: d => d.geometry.coordinates,
        //   getFillColor: [0, 150, 255],
        //   getRadius: 1,
        //   radiusUnits: "pixels",
        //   pickable: false
        // });
        const scatter = new GeoJsonLayer({
            id: "geojson-points",
            data: geoJsonDataUrl, // Deck.gl fetches and parses this GeoJSON FeatureCollection
            pointType: "circle",
            getPointRadius: 1,
            getFillColor: [0, 150, 255],
            pointRadiusUnits: "pixels",
            pointRadiusMinPixels: 1,
            pickable: false
        });
        const overlay = new MapboxOverlay({ layers: [scatter], interleaved: false });
        map.addControl(overlay);
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