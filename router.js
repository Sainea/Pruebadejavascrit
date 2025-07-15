class Router {
constructor() {
    this.routes = [];
    window.addEventListener("hashchange", () => this.handleRouteChange());
}

addRoute(path, handler) {
    this.routes.push({ path, handler });
}

handleRouteChange() {
    const path = window.location.hash.substring(1) || "/";
    const route = this.routes.find((r) => r.path === path);
    if (route) {
    route.handler();
    } else {
      // Handle 404 - Route not found
    console.log("Route not found");
    }
}

navigate(path) {
    window.location.hash = path;
}
}

const router = new Router();

// Define your routes
router.addRoute("/", () => {
    document.getElementById("login").style.display = "block";
    document.getElementById("register").style.display = "none";
    document.getElementById("events").style.display = "none";
});

router.addRoute("/register", () => {
    document.getElementById("login").style.display = "none";
    document.getElementById("register").style.display = "block";
    document.getElementById("events").style.display = "none";
});

router.addRoute("/events", () => {
const user = JSON.parse(localStorage.getItem("user"));
if (user) {
    document.getElementById("login").style.display = "none";
    document.getElementById("register").style.display = "none";
    document.getElementById("events").style.display = "block";
    loadEvents(user.role);
} else {
    router.navigate("/");
}
});

// Initial route handling
router.handleRouteChange();
