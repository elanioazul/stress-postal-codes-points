export const PATHS = {
    home: {
        path: "/",
        template: `
            <h1>🏠 Home</h1>
            <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ipsum harum aliquam reiciendis dignissimos? Perferendis consequuntur vitae fugiat fuga neque ipsum?</p>
        `,
        showMap: false,
        showContent: true // ✅ Show content on home
    },
    visor: {
        path: "/visor",
        template: `
            `,
        showMap: true, // ✅ Show map on visor
        showContent: false // ❌ Hide content on visor
    },
    error: {
        path: "/error",
        template: `
            <h1>❌ 404 - Page Not Found</h1>
            <p>The page you are looking for does not exist.</p>
        `,
        showMap: false,
        showContent: true
    }
}