import './style.css'
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import MilSymbol from 'milsymbol';

const sourceId = 'entity-source';
const layerId = 'entity-layer';


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

function loadMilSymbolIcon(imageId, sidc, map) {
    const lib = MilSymbol;
    if (lib && lib.Symbol) {
      const size = Math.max(40, 40);
      const symbol = new lib.Symbol(sidc, {size});
      console.log(symbol)
      const svgString = symbol.asSVG();

      // Create an Image element to load the SVG
      const img = new Image();
      img.onload = () => {
          // Add the image to the map style
          map.addImage(imageId, img);
      };
      // The src must be a data URL to load the SVG string
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
    }
}

map.on('load', () => {
  map.addSource(sourceId, {
    type: 'geojson',
    data: 'http://localhost:8081/geoserver/ows?service=WFS&version=1.1.0&request=GetFeature&typename=testing_the_waters:spain_osm_postcode_points&outputformat=application/json&srsName=EPSG:4326&maxfeatures=5000&BBOX=-0.935,41.5407,-0.6889,41.6541,EPSG:4326',
  });

  loadMilSymbolIcon('default-milsymbol-icon', '10031000001211000000', map);

  map.addLayer({
    id: layerId,
    type: 'symbol',
    source: sourceId,
    layout: {
      'icon-image': 'default-milsymbol-icon', // Use the loaded icon image ID
      'icon-allow-overlap': true,
      'icon-size': 0.5 // Adjust size as needed
    }
  });
});