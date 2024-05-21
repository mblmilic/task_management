$(document).ready(function() {
    fetchTasks();
    fetchClients();

    $('#registrationForm').on('submit', function(event) {
        event.preventDefault();
        const user = {
            username: $('#regUsername').val(),
            email: $('#regEmail').val(),
            password: $('#regPassword').val()
        };
        registerUser(user);
    });

    $('#loginForm').on('submit', function(event) {
        event.preventDefault();
        const user = {
            email: $('#loginEmail').val(),
            password: $('#loginPassword').val()
        };
        loginUser(user);
    });

    $('#taskForm').on('submit', function(event) {
        event.preventDefault();
        const task = {
            title: $('#title').val(),
            description: $('#description').val(),
            due_date: $('#due_date').val(),
            status: $('#status').val(),
            priority: $('#priority').val(),
            client_id: $('#client').val()
        };
        const taskId = $('#taskId').val();
        if (taskId) {
            updateTask(taskId, task);
        } else {
            addTask(task);
        }
        $('#taskModal').modal('hide');
        $('#taskForm')[0].reset();
        $('#taskId').val('');
    });

    $('#clientForm').on('submit', function(event) {
        event.preventDefault();
        const client = {
            name: $('#clientName').val(),
            email: $('#clientEmail').val()
        };
        addClient(client);
        $('#clientModal').modal('hide');
        $('#clientForm')[0].reset();
    });
});

function registerUser(user) {
    $.ajax({
        url: '/register',
        method: 'POST',
        data: user,
        success: function(data) {
            console.log('User registered:', data);
        },
        error: function(err) {
            console.error('Error registering user:', err);
        }
    });
}

function loginUser(user) {
    $.ajax({
        url: '/login',
        method: 'POST',
        data: user,
        success: function(data) {
            console.log('User logged in:', data);
            localStorage.setItem('token', data.token);
        },
        error: function(err) {
            console.error('Error logging in:', err);
        }
    });
}

function fetchTasks() {
    const token = localStorage.getItem('token');
    $.ajax({
        url: '/tasks',
        method: 'GET',
        headers: {
            'Authorization': token
        },
        success: function(data) {
            renderTaskList(data);
        }
    });
}

function fetchClients() {
    const token = localStorage.getItem('token');
    $.ajax({
        url: '/clients',
        method: 'GET',
        headers: {
            'Authorization': token
        },
        success: function(data) {
            let clientOptions = '<option value="">Select Client</option>';
            data.forEach(client => {
                clientOptions += `<option value="${client.id}">${client.name}</option>`;
            });
            $('#client').html(clientOptions);
        }
    });
}

function addTask(task) {
    const token = localStorage.getItem('token');
    $.ajax({
        url: '/tasks',
        method: 'POST',
        headers: {
            'Authorization': token
        },
        data: task,
        success: function(data) {
            fetchTasks();
        }
    });
}

function updateTask(id, task) {
    const token = localStorage.getItem('token');
    $.ajax({
        url: `/tasks/${id}`,
        method: 'PUT',
        headers: {
            'Authorization': token
        },
        data: task,
        success: function(data) {
            fetchTasks();
        }
    });
}

function deleteTask(id) {
    const token = localStorage.getItem('token');
    $.ajax({
        url: `/tasks/${id}`,
        method: 'DELETE',
        headers: {
            'Authorization': token
        },
        success: function(data) {
            fetchTasks();
        }
    });
}

function editTask(id) {
    const token = localStorage.getItem('token');
    $.ajax({
        url: `/tasks/${id}`,
        method: 'GET',
        headers: {
            'Authorization': token
        },
        success: function(task) {
            $('#taskId').val(task.id);
            $('#title').val(task.title);
            $('#description').val(task.description);
            $('#due_date').val(task.due_date);
            $('#status').val(task.status);
            $('#priority').val(task.priority);
            $('#client').val(task.client_id);
            $('#taskModal').modal('show');
        }
    });
}

function showTaskForm() {
    $('#taskModal').modal('show');
}

function showClientForm() {
    $('#clientModal').modal('show');
}

function addClient(client) {
    const token = localStorage.getItem('token');
    console.log('Client data to be sent:', client); // Dodan log za prikaz podataka klijenta koji se šalju
    console.log('Token:', token); // Dodan log za prikaz tokena
    $.ajax({
        url: '/clients',
        method: 'POST',
        headers: {
            'Authorization': token
        },
        data: client,
        success: function(data) {
            console.log('Client added:', data);
            fetchClients();
        },
        error: function(err) {
            console.error('Error adding client:', err);
        }
    });
}

function renderTaskList(tasks) {
    let taskList = '<ul class="list-group">';
    tasks.forEach(task => {
        taskList += `
            <li class="list-group-item">
                <h5>${task.title}</h5>
                <p>${task.description}</p>
                <p>Due: ${task.due_date}</p>
                <p>Status: ${task.status}</p>
                <p>Priority: ${task.priority}</p>
                <button class="btn btn-warning btn-sm" onclick="editTask(${task.id})">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteTask(${task.id})">Delete</button>
            </li>
        `;
    });
    taskList += '</ul>';
    $('#task-list').html(taskList);
}
