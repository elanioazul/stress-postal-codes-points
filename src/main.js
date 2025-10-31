import './style.css'


import { Router } from "./router.js";
import { PATHS } from "./routes.js";

// Instantiate the router with the paths
const router = new Router(PATHS); 

// --- Router Event Listener ---
// The popstate event fires when the active history entry changes.
// This handles:
// 1. Initial page load (though initRouter already handles this)
// 2. Browser back/forward button clicks
// 3. Programmatic changes via pushState (which is inside your router.load)
window.addEventListener("popstate", () => {
    // Get the current path from the URL
    const { pathname = "/" } = window.location;

    // Convert the pathname to the key used in your PATHS object
    // "/" becomes "home"
    // "/visor" becomes "visor"
    const URI = pathname === "/" ? "home" : pathname.replace("/", "");
    
    // Use the router to load the correct page based on the new URI
    // Note: The load method *also* calls history.pushState, which is okay here
    // but you might want to modify your Router's load method slightly
    // to avoid an extra history entry when navigating via popstate.
// Tell the router *NOT* to push a new history state, as popstate means 
    // the history state has already been changed by the browser.
    router.load(URI, false);
});

// For easier debugging or future navigation
window.router = router;

