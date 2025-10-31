export class Router {

    constructor(paths) {
        this.paths = paths;
        this.initRouter();
    }

    /**
     * Permite inicializar el router
     *
     * @return {void}.
     */
    initRouter() {
        const {
            location: {
                pathname = "/"
            }
        } = window;
        const URI = pathname === "/" ? "home" : pathname.replace("/", "");
        this.load(URI);
    }

    /**
         * Permite iniciar la carga de paginas.
         *
         * @param {string} page - The key for the route (e.g., 'home', 'visor').
         * @param {boolean} push - Flag to indicate if we should push a new history state.
         * @return {void}.
         */
    async load(page = "home", push = true) { // <--- MUST be async now
        const { paths } = this;
        console.log(paths);

        const routeData = paths[page] || paths.error;
        const { path, template, showMap, showContent } = routeData;

        const $CONTENT = document.querySelector("#content");
        const $MAP = document.querySelector("#map");

        if (!$CONTENT || !$MAP) {
            console.error('Missing required elements (#content or #map) in the DOM.');
            return;
        }

        // 1. **CLEANUP** - Always try to destroy the map when loading any new route
        // This is necessary to free resources when navigating from /visor to /
        // We use a dynamic import here just to access the destroyMap function.
        const { destroyMap } = await import('./map.js');
        destroyMap();

        // 2. Update the DOM visibility
        $CONTENT.innerHTML = template;
        $CONTENT.style.display = showContent ? 'block' : 'none';
        $MAP.style.display = showMap ? 'block' : 'none';

        // 3. **LAZY LOAD MAP** - Only initialize the map if required by the route
        if (showMap) {
            // This dynamic import is the key! It only fetches and runs map.js 
            // logic when 'showMap' is true.
            const { initMap } = await import('./map.js');
            initMap();
        }

        // 4. Update the browser history
        if (push) {
            window.history.pushState({}, "Genial", path);
        }
    }

}