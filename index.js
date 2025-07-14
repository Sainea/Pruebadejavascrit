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

    // Verificar si hay un usuario en localStorage al cargar la página
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        loginSection.style.display = 'none';
        loadEvents(user.role);
    } else {
        eventsSection.style.display = 'none';
        loginSection.style.display = 'block';
    }

    showRegister.addEventListener('click', (e) => {
        e.preventDefault();
        loginSection.style.display = 'none';
        registerSection.style.display = 'block';
    });

    showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        registerSection.style.display = 'none';
        loginSection.style.display = 'block';
    });

    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('user');
        eventsSection.style.display = 'none';
        loginSection.style.display = 'block';
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
            loginSection.style.display = 'none';
            loadEvents(user.role);
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
            registerSection.style.display = 'none';
            loginSection.style.display = 'block';
        } else {
            alert('Error al registrar el usuario');
        }
    });

    async function loadEvents(role) {
        const response = await fetch('http://localhost:3000/events');
        const events = await response.json();
        eventList.innerHTML = '';

        events.forEach(event => {
            const li = document.createElement('li');
            li.textContent = `${event.name} - ${event.description}`;

            if (role === 'admin') {
                const editButton = document.createElement('button');
                editButton.textContent = 'Editar';
                editButton.addEventListener('click', () => editEvent(event.id));
                li.appendChild(editButton);
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
});
