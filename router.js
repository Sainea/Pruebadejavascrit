class Router {
    constructor() {
        this.routes = [];
        this.currentRoute = null;
        window.addEventListener('hashchange', () => this.handleRouteChange());
    }

    addRoute(path, handler) {
        this.routes.push({ path, handler });
    }

    handleRouteChange() {
        const path = window.location.hash.substring(1) || '/';
        const route = this.routes.find(r => r.path === path);

        if (route) {
            if (this.currentRoute && this.currentRoute.handler === route.handler) {
                return;
            }
            this.currentRoute = route;
            route.handler();
        } else {
            this.handleNotFound();
        }
    }

    handleNotFound() {
        console.log('Route not found');
    }

    navigate(path) {
        window.location.hash = path;
    }
}

const router = new Router();

export { router };
