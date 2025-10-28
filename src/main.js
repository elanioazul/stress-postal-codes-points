import './style.css'
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import MilSymbol from 'milsymbol';
import * as flatgeobuf from 'flatgeobuf';

const sourceId = 'my-fgb-source';
const layerId = 'my-fgb-layer';
const wfsUrl = "http://localhost:8081/geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&typename=testing_the_waters:spain_osm_postcode_points&outputFormat=application/flatgeobuf&srsName=EPSG:4326&maxfeatures=4000&BBOX=-0.935,41.5407,-0.6889,41.6541,EPSG:4326";

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
  center: [-0.87408304, 41.64605186],
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

async function loadFlatGeobufData() {
  try {
    const response = await fetch(wfsUrl);
    console.log(response);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    let geoJsonData = { type: "FeatureCollection", features: [] };
    for await(const feat of flatgeobuf.geojson.deserialize(response.body)) {
      geoJsonData.features.push(feat)
    }

    // C. Add the source using the GeoJSON object
    map.addSource(sourceId, {
      type: 'geojson',
      data: geoJsonData // Pass the parsed GeoJSON object
    });

    map.addLayer({
      id: layerId,
      type: 'circle',
      source: sourceId,
      paint: {
        "circle-radius": 1.5,
        "circle-color": "rgba(0, 150, 255, 0.7)"
      }
    });

  } catch (error) {
    console.error('Error loading FlatGeobuf data:', error);
  }
}



loadFlatGeobufData();
map.on('load', () => {



});