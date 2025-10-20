
export class SVGRenderer {
  constructor(container, map) {
    this.container = container;
    this.map = map;
    this.entities = new Map();

    // nada

    this.setupSVGLayer();
    this.setupMapEvents();
  }

  setupSVGLayer() {
    this.svgLayer = document.createElement('div');
    this.svgLayer.style.position = 'absolute';
    this.svgLayer.style.top = '0';
    this.svgLayer.style.left = '0';
    this.svgLayer.style.width = '100%';
    this.svgLayer.style.height = '100%';
    this.svgLayer.style.pointerEvents = 'none';
    this.svgLayer.style.zIndex = '20';
    this.container.appendChild(this.svgLayer);
  }

  setupMapEvents() {
    this.map.on('move', () => this.updateAllPositions());
    this.map.on('zoom', () => this.updateAllPositions());
    this.map.on('rotate', () => this.updateAllPositions());
    this.map.on('pitch', () => this.updateAllPositions());
  }

  projectLngLat(lng, lat) {
    return this.map.project([lng, lat]);
  }

  updateAllPositions() {
    this.entities.forEach((entity) => {
      const { element, lngLatPosition } = entity;
      const pixelPos = this.projectLngLat(lngLatPosition.lng, lngLatPosition.lat);
      element.style.left = (pixelPos.x - entity.width / 2) + 'px';
      element.style.top = (pixelPos.y - entity.height / 2) + 'px';
    });
  }

  onAddEntity(eid, data) {
    const existing = this.entities.get(eid);
    if (existing) {
      if (this.svgLayer.contains(existing.element)) {
        this.svgLayer.removeChild(existing.element);
      }
      this.entities.delete(eid);
    }

    const iconElement = this.createIconElement(data);

    this.svgLayer.appendChild(iconElement);

    this.entities.set(eid, {
      element: iconElement,
      lngLatPosition: { lng: data.position.lng, lat: data.position.lat },
      width: data.width,
      height: data.height,
    });
  }

  onUpdateEntity(eid, data) {
    const entity = this.entities.get(eid);
    if (!entity) return;

    const { element } = entity;
    entity.lngLatPosition = { lng: data.position.lng, lat: data.position.lat };

    const pixelPos = this.projectLngLat(data.position.lng, data.position.lat);
    element.style.left = (pixelPos.x - entity.width / 2) + 'px';
    element.style.top = (pixelPos.y - entity.height / 2) + 'px';
    element.style.display = data.visible ? 'block' : 'none';
    element.style.opacity = data.opacity;
  }

  createIconElement(data) {
    const el = document.createElement('div');
    el.style.position = 'absolute';
    el.style.width = data.width + 'px';
    el.style.height = data.height + 'px';
    el.style.pointerEvents = 'auto';
    el.style.cursor = 'pointer';
    const px = this.projectLngLat(data.position.lng, data.position.lat);
    el.style.left = (px.x - data.width / 2) + 'px';
    el.style.top = (px.y - data.height / 2) + 'px';
    el.style.opacity = data.opacity;
    el.style.display = data.visible ? 'block' : 'none';

    const lib = window.ms || window.milsymbol || window.MilSymbol || window.Milsymbol;
    const sidc = data.sidc;
    if (lib && lib.Symbol) {
        const size = Math.max(data.width, data.height);
        const sym = new lib.Symbol(sidc, { size });
        el.innerHTML = sym.asSVG();
        const svg = el.querySelector('svg');
        if (svg) {
          svg.style.width = '100%';
          svg.style.height = '100%';
          svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        }
      
    } 

    return el;
  }
}


