import { router } from './router.js';

// Cache DOM elements
const elements = {
    loginForm: document.getElementById('loginForm'),
    registerForm: document.getElementById('registerForm'),
    showRegisterLink: document.getElementById('showRegister'),
    showLoginLink: document.getElementById('showLogin'),
    loginSection: document.getElementById('login'),
    registerSection: document.getElementById('register'),
    eventsSection: document.getElementById('events'),
    eventList: document.getElementById('eventList'),
    logoutButton: document.getElementById('logoutButton'),
    registerForEventModal: document.getElementById('registerForEventModal'),
    registerForEventForm: document.getElementById('registerForEventForm'),
    createEventModal: document.getElementById('createEventModal'),
    createEventForm: document.getElementById('createEventForm'),
    editEventModal: document.getElementById('editEventModal'),
    editEventForm: document.getElementById('editEventForm'),
    errorMessages: {
        login: document.getElementById('errorMessage'),
        register: document.getElementById('registerErrorMessage'),
        events: document.getElementById('eventsErrorMessage'),
        registerForEvent: document.getElementById('registerForEventErrorMessage'),
        createEvent: document.getElementById('createEventErrorMessage'),
        editEvent: document.getElementById('editEventErrorMessage')
    }
};

let currentEventId = null;

// Route handlers
function showLogin() {
    elements.loginSection.style.display = 'block';
    elements.registerSection.style.display = 'none';
    elements.eventsSection.style.display = 'none';
}

function showRegister() {
    elements.loginSection.style.display = 'none';
    elements.registerSection.style.display = 'block';
    elements.eventsSection.style.display = 'none';
}

function showEvents() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        elements.loginSection.style.display = 'none';
        elements.registerSection.style.display = 'none';
        elements.eventsSection.style.display = 'block';
        loadEvents(user.role);
    } else {
        router.navigate('/');
    }
}

// Define routes
router.addRoute('/', showLogin);
router.addRoute('/register', showRegister);
router.addRoute('/events', showEvents);

// Event listeners
elements.showRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    router.navigate('/register');
});

elements.showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    router.navigate('/');
});

elements.logoutButton.addEventListener('click', () => {
    localStorage.removeItem('user');
    router.navigate('/');
});

elements.loginForm.addEventListener('submit', handleLogin);
elements.registerForm.addEventListener('submit', handleRegister);
elements.createEventForm.addEventListener('submit', handleCreateEvent);
elements.editEventForm.addEventListener('submit', handleEditEvent);
elements.registerForEventForm.addEventListener('submit', handleRegisterForEvent);

// Functions to handle form submissions
async function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const response = await fetch('http://localhost:3000/users');
    const users = await response.json();
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        router.navigate('/events');
    } else {
        elements.errorMessages.login.textContent = 'Incorrect username or password';
    }
}

async function handleRegister(event) {
    event.preventDefault();
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
        elements.errorMessages.register.textContent = 'User registered successfully';
        router.navigate('/');
    } else {
        elements.errorMessages.register.textContent = 'Error registering user';
    }
}

async function loadEvents(role) {
    const response = await fetch('http://localhost:3000/events');
    const events = await response.json();
    elements.eventList.innerHTML = '';
    if (role === 'admin') {
        const createEventButton = document.createElement('button');
        createEventButton.textContent = 'Create Event';
        createEventButton.addEventListener('click', showCreateEventModal);
        elements.eventList.appendChild(createEventButton);
    }
    events.forEach(event => {
        const li = createEventElement(event, role);
        elements.eventList.appendChild(li);
    });
}

function createEventElement(event, role) {
    const li = document.createElement('li');
    li.textContent = `${event.name} - ${event.description} - Available slots: ${event.quota}`;

    if (role === 'admin') {
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.addEventListener('click', () => showEditEventModal(event.id, event.name, event.quota));
        li.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => deleteEvent(event.id));
        li.appendChild(deleteButton);
    } else {
        const registerButton = document.createElement('button');
        registerButton.textContent = 'Register';
        registerButton.addEventListener('click', () => showRegisterForEventModal(event.id));
        li.appendChild(registerButton);
    }

    return li;
}

function showCreateEventModal() {
    elements.createEventModal.style.display = 'block';
}

async function handleCreateEvent(event) {
    event.preventDefault();
    const eventName = document.getElementById('eventName').value;
    const eventDescription = document.getElementById('eventDescription').value;
    const eventQuota = document.getElementById('eventQuota').value;
    const response = await fetch('http://localhost:3000/events', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: eventName, description: eventDescription, quota: eventQuota }),
    });
    if (response.ok) {
        elements.errorMessages.createEvent.textContent = 'Event created successfully';
        elements.createEventModal.style.display = 'none';
        elements.createEventForm.reset();
        loadEvents(JSON.parse(localStorage.getItem('user')).role);
    } else {
        elements.errorMessages.createEvent.textContent = 'Error creating event';
    }
}

async function deleteEvent(eventId) {
    const confirmDelete = confirm('Are you sure you want to delete this event?');
    if (confirmDelete) {
        const response = await fetch(`http://localhost:3000/events/${eventId}`, {
            method: 'DELETE',
        });
        if (response.ok) {
            elements.errorMessages.events.textContent = 'Event deleted successfully';
            loadEvents(JSON.parse(localStorage.getItem('user')).role);
        } else {
            elements.errorMessages.events.textContent = 'Error deleting event';
        }
    }
}

function showRegisterForEventModal(eventId) {
    currentEventId = eventId;
    elements.registerForEventModal.style.display = 'block';
}

async function handleRegisterForEvent(event) {
    event.preventDefault();
    const userName = document.getElementById('userName').value;
    const userAge = document.getElementById('userAge').value;
    const user = JSON.parse(localStorage.getItem('user'));
    const response = await fetch('http://localhost:3000/registrations', {
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
    if (response.ok) {
        elements.errorMessages.registerForEvent.textContent = 'Registration successful';
        elements.registerForEventModal.style.display = 'none';
        elements.registerForEventForm.reset();
        loadEvents(JSON.parse(localStorage.getItem('user')).role);
    } else {
        elements.errorMessages.registerForEvent.textContent = 'Error registering for event';
    }
}

function showEditEventModal(eventId, eventName, quota) {
    currentEventId = eventId;
    document.getElementById('editEventName').value = eventName;
    document.getElementById('editEventQuota').value = quota;
    elements.editEventModal.style.display = 'block';
}

async function handleEditEvent(event) {
    event.preventDefault();
    const eventName = document.getElementById('editEventName').value;
    const eventQuota = document.getElementById('editEventQuota').value;
    const response = await fetch(`http://localhost:3000/events/${currentEventId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: eventName, quota: eventQuota }),
    });
    if (response.ok) {
        elements.errorMessages.editEvent.textContent = 'Event updated successfully';
        elements.editEventModal.style.display = 'none';
        elements.editEventForm.reset();
        loadEvents(JSON.parse(localStorage.getItem('user')).role);
    } else {
        elements.errorMessages.editEvent.textContent = 'Error updating event';
    }
}

// Initial route handling
router.handleRouteChange();
