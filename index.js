document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');
    const loginSection = document.getElementById('login');
    const registerSection = document.getElementById('register');
    const eventsSection = document.getElementById('events');
    const eventList = document.getElementById('eventList');
    const logoutButton = document.getElementById('logoutButton');
    const registerForEventModal = document.getElementById('registerForEventModal');
    const registerForEventForm = document.getElementById('registerForEventForm');
    let currentEventId = null;

    // Router setup
    class Router {
        constructor() {
            this.routes = [];
            window.addEventListener('hashchange', () => this.handleRouteChange());
        }

        addRoute(path, handler) {
            this.routes.push({ path, handler });
        }

        handleRouteChange() {
            const path = window.location.hash.substring(1) || '/';
            const route = this.routes.find(r => r.path === path);
            if (route) {
                route.handler();
            } else {
                console.log('Route not found');
            }
        }

        navigate(path) {
            window.location.hash = path;
        }
    }

    const router = new Router();

    // Define your routes
    router.addRoute('/', () => {
        document.getElementById('login').style.display = 'block';
        document.getElementById('register').style.display = 'none';
        document.getElementById('events').style.display = 'none';
    });

    router.addRoute('/register', () => {
        document.getElementById('login').style.display = 'none';
        document.getElementById('register').style.display = 'block';
        document.getElementById('events').style.display = 'none';
    });

    router.addRoute('/events', () => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            document.getElementById('login').style.display = 'none';
            document.getElementById('register').style.display = 'none';
            document.getElementById('events').style.display = 'block';
            loadEvents(user.role);
        } else {
            router.navigate('/');
        }
    });

    // Verificar si hay un usuario en localStorage al cargar la página
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        loginSection.style.display = 'none';
        router.navigate('/events');
    } else {
        eventsSection.style.display = 'none';
        loginSection.style.display = 'block';
    }

    showRegister.addEventListener('click', (e) => {
        e.preventDefault();
        router.navigate('/register');
    });

    showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        router.navigate('/');
    });

    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('user');
        router.navigate('/');
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const response = await fetch('http://localhost:3000/users');
        const users = await response.json();
        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
            router.navigate('/events');
        } else {
            alert('Usuario o contraseña incorrectos');
        }
    });

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newUsername = document.getElementById('newUsername').value;
        const newPassword = document.getElementById('newPassword').value;
        const role = 'visitor';
        const response = await fetch('http://localhost:3000/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: newUsername, password: newPassword, role }),
        });
        if (response.ok) {
            alert('Usuario registrado con éxito');
            router.navigate('/');
        } else {
            alert('Error al registrar el usuario');
        }
    });

    async function loadEvents(role) {
        const response = await fetch('http://localhost:3000/events');
        const events = await response.json();
        eventList.innerHTML = '';
        if (role === 'admin') {
            const createEventButton = document.createElement('button');
            createEventButton.textContent = 'Crear Evento';
            createEventButton.addEventListener('click', createEvent);
            eventList.appendChild(createEventButton);
        }
        events.forEach(event => {
            const li = document.createElement('li');
            li.textContent = `${event.name} - ${event.description}`;
            if (role === 'admin') {
                const editButton = document.createElement('button');
                editButton.textContent = 'Editar';
                editButton.addEventListener('click', () => editEvent(event.id));
                li.appendChild(editButton);
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Eliminar';
                deleteButton.addEventListener('click', () => deleteEvent(event.id));
                li.appendChild(deleteButton);
            } else {
                const registerButton = document.createElement('button');
                registerButton.textContent = 'Registrarse';
                registerButton.addEventListener('click', () => showRegisterForEventModal(event.id));
                li.appendChild(registerButton);
            }
            eventList.appendChild(li);
        });
        eventsSection.style.display = 'block';
    }

    async function createEvent() {
        const eventName = prompt('Nombre del nuevo evento:');
        if (eventName) {
            const eventDescription = prompt('Descripción del nuevo evento:');
            if (eventDescription) {
                const response = await fetch('http://localhost:3000/events', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name: eventName, description: eventDescription }),
                });
                if (response.ok) {
                    alert('Evento creado con éxito');
                    loadEvents(JSON.parse(localStorage.getItem('user')).role);
                } else {
                    alert('Error al crear el evento');
                }
            }
        }
    }

    async function deleteEvent(eventId) {
        const confirmDelete = confirm('¿Estás seguro de que deseas eliminar este evento?');
        if (confirmDelete) {
            const response = await fetch(`http://localhost:3000/events/${eventId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                alert('Evento eliminado con éxito');
                loadEvents(JSON.parse(localStorage.getItem('user')).role);
            } else {
                alert('Error al eliminar el evento');
            }
        }
    }

    function showRegisterForEventModal(eventId) {
        currentEventId = eventId;
        registerForEventModal.style.display = 'block';
    }

    registerForEventForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userName = document.getElementById('userName').value;
        const userAge = document.getElementById('userAge').value;
        const user = JSON.parse(localStorage.getItem('user'));
        await fetch('http://localhost:3000/registrations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: user.id,
                eventId: currentEventId,
                userName,
                userAge
            }),
        });
        alert('Registro exitoso');
        registerForEventModal.style.display = 'none';
        registerForEventForm.reset();
    });

    async function editEvent(eventId) {
        const eventName = prompt('Nuevo nombre del evento:');
        if (eventName) {
            await fetch(`http://localhost:3000/events/${eventId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: eventName }),
            });
            loadEvents(JSON.parse(localStorage.getItem('user')).role);
        }
    }

    // Initial route handling
    router.handleRouteChange();
});
