$(document).ready(function() {
    let serverPort;

    // Get the server port
    $.ajax({
        url: '/api/config',
        method: 'GET',
        async: false,
        success: function(data) {
            serverPort = data.port;
        },
        error: function(err) {
            console.error('Error fetching server config:', err);
        }
    });

    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const userRole = localStorage.getItem('userRole');

    if (!token || userRole !== 'admin') {
        window.location.href = 'index.html';
        return;
    }

    $('#adminGreeting').text(`Prijavljen kao: ${user}`);

    fetchTaskTypes();
    fetchUsers();

    $('#taskTypeForm').on('submit', function(event) {
        event.preventDefault();
        const taskType = {
            name: $('#taskTypeName').val()
        };
        addTaskType(taskType);
        $('#taskTypeModal').modal('hide');
        $('#taskTypeForm')[0].reset();
    });
});

function fetchTaskTypes() {
    const token = localStorage.getItem('token');
    let serverPort;
    $.ajax({
        url: '/api/config',
        method: 'GET',
        async: false,
        success: function(data) {
            serverPort = data.port;
        },
        error: function(err) {
            console.error('Error fetching server config:', err);
        }
    });

    $.ajax({
        url: `http://localhost:${serverPort}/task_types`,
        method: 'GET',
        headers: {
            'Authorization': token
        },
        success: function(data) {
            console.log('Fetched task types:', data);
            renderTaskTypeTable(data);
        },
        error: function(err) {
            console.error('Error fetching task types:', err);
        }
    });
}

function fetchUsers() {
    const token = localStorage.getItem('token');
    let serverPort;
    $.ajax({
        url: '/api/config',
        method: 'GET',
        async: false,
        success: function(data) {
            serverPort = data.port;
        },
        error: function(err) {
            console.error('Error fetching server config:', err);
        }
    });

    $.ajax({
        url: `http://localhost:${serverPort}/users`,
        method: 'GET',
        headers: {
            'Authorization': token
        },
        success: function(data) {
            console.log('Fetched users:', data);
            renderUserTable(data);
        },
        error: function(err) {
            console.error('Error fetching users:', err);
        }
    });
}

function addTaskType(taskType) {
    const token = localStorage.getItem('token');
    let serverPort;
    $.ajax({
        url: '/api/config',
        method: 'GET',
        async: false,
        success: function(data) {
            serverPort = data.port;
        },
        error: function(err) {
            console.error('Error fetching server config:', err);
        }
    });

    $.ajax({
        url: `http://localhost:${serverPort}/task_types`,
        method: 'POST',
        headers: {
            'Authorization': token
        },
        data: taskType,
        success: function(data) {
            console.log('Task type added:', data);
            fetchTaskTypes();
        },
        error: function(err) {
            console.error('Error adding task type:', err);
        }
    });
}

function deactivateUser(userId) {
    const token = localStorage.getItem('token');
    let serverPort;
    $.ajax({
        url: '/api/config',
        method: 'GET',
        async: false,
        success: function(data) {
            serverPort = data.port;
        },
        error: function(err) {
            console.error('Error fetching server config:', err);
        }
    });

    $.ajax({
        url: `http://localhost:${serverPort}/users/${userId}/deactivate`,
        method: 'PUT',
        headers: {
            'Authorization': token
        },
        success: function(data) {
            console.log('User deactivated:', data);
            fetchUsers();
        },
        error: function(err) {
            console.error('Error deactivating user:', err);
        }
    });
}

function renderTaskTypeTable(taskTypes) {
    let taskTypeTable = `
        <table class="table table-striped">
            <thead>
                <tr>
                    <th>Ime vrste zadataka</th>
                    <th>Akcije</th>
                </tr>
            </thead>
            <tbody>
    `;
    taskTypes.forEach(taskType => {
        taskTypeTable += `
            <tr>
                <td>${taskType.name}</td>
                <td>
                    <!-- Ovdje možete dodati dugmad za uređivanje ili brisanje vrsta zadataka -->
                </td>
            </tr>
        `;
    });
    taskTypeTable += `
            </tbody>
        </table>
    `;
    $('#taskType-list').html(taskTypeTable);
}

function renderUserTable(users) {
    let userTable = `
        <table class="table table-striped">
            <thead>
                <tr>
                    <th>Korisničko ime</th>
                    <th>Email</th>
                    <th>Uloga</th>
                    <th>Status</th>
                    <th>Akcije</th>
                </tr>
            </thead>
            <tbody>
    `;
    users.forEach(user => {
        userTable += `
            <tr>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td>${user.active ? 'Aktivan' : 'Neaktivan'}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="deactivateUser(${user.id})" type="button">Deaktiviraj</button>
                </td>
            </tr>
        `;
    });
    userTable += `
            </tbody>
        </table>
    `;
    $('#user-list').html(userTable);
}

function showTaskTypeForm() {
    $('#taskTypeModal').modal('show');
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    window.location.href = 'index.html';
}
