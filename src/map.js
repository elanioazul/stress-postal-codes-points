import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import MilSymbol from 'milsymbol';
import { MapboxOverlay } from '@deck.gl/mapbox';
import { ScatterplotLayer, GeoJsonLayer, IconLayer } from '@deck.gl/layers';

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
        center: [-3.695526, 40.417678],
        zoom: 8
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

    // --- Icon Generation Logic ---
    const ICON_SIZE = 40;
    const DEFAULT_SIDC = '10031000001211000000';

    function loadMilSymbolIcon(sidc) {
        const symbol = new MilSymbol.Symbol(sidc, { size: ICON_SIZE });
        return symbol.asSVG();
    }

    function svgToDataURL(svg) {
        return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    }

    // 1. Pre-calculate the Icon Atlas URL and Mapping
    const DEFAULT_ICON_ID = 'default-milsymbol-icon';
    const defaultIconUrl = svgToDataURL(loadMilSymbolIcon(DEFAULT_SIDC));

    const ICON_MAPPING = {
        [DEFAULT_ICON_ID]: {
            x: 0,
            y: 0,
            width: 62,//aunque MilSymbol lo generamos con 40, aqui hay que acomodarlo
            height: 42,//aunque MilSymbol lo generamos con 40, aqui hay que acomodarlo
        }
    };

    map.on('load', () => {
        const geoJsonDataUrl = `http://localhost:8081/geoserver/ows?service=WFS&version=1.1.0&request=GetFeature&typename=testing_the_waters:spain_osm_postcode_points&outputformat=application/json&srsName=EPSG:4326&maxfeatures=4000&BBOX=-4.2033,40.1982,-3.1486,40.754,EPSG:4326`;

        const iconLayer = new IconLayer({
            id: 'milsymbol-icon-layer',
            data: geoJsonDataUrl,
            dataTransform: data => data.features,

            // Icon Atlas and Mapping
            iconAtlas: defaultIconUrl,
            iconMapping: ICON_MAPPING,

            // Accessors
            getPosition: d => d.geometry.coordinates, // Extracts [lng, lat] from GeoJSON Feature
            getIcon: d => DEFAULT_ICON_ID, // Returns the pre-defined icon key
            getSize: 30,

            // Styling and Sizing
            sizeScale: 1,
            sizeUnits: 'pixels',
            sizeBasis: 'width',//la dimenson para la escalacion 

            pickable: true,
            onClick: feat => {
                console.log(feat.object)
            },
        });

        const overlay = new MapboxOverlay({ layers: [iconLayer], interleaved: false });
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