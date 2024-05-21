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

    fetchTasks();

    $('#taskForm').on('submit', function(event) {
        event.preventDefault();
        const taskData = {
            title: $('#taskTitle').val(),
            description: $('#taskDescription').val(),
            due_date: $('#taskDueDate').val(),
            status: $('#taskStatus').val(),
            priority: $('#taskPriority').val(),
            client_id: $('#taskClient').val(),
            task_type_id: $('#taskType').val()
        };

        $.ajax({
            url: `http://localhost:${serverPort}/tasks`,
            method: 'POST',
            headers: {
                'Authorization': localStorage.getItem('token')
            },
            data: taskData,
            success: function(data) {
                $('#taskModal').modal('hide');
                fetchTasks();
            },
            error: function(err) {
                console.error('Error adding task:', err);
            }
        });
    });

    $('#clientForm').on('submit', function(event) {
        event.preventDefault();
        const clientData = {
            name: $('#clientName').val(),
            email: $('#clientEmail').val()
        };

        $.ajax({
            url: `http://localhost:${serverPort}/clients`,
            method: 'POST',
            headers: {
                'Authorization': localStorage.getItem('token')
            },
            data: clientData,
            success: function(data) {
                $('#clientModal').modal('hide');
                fetchClients();
            },
            error: function(err) {
                console.error('Error adding client:', err);
            }
        });
    });
});

function fetchTasks() {
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
        url: `http://localhost:${serverPort}/tasks`,
        method: 'GET',
        headers: {
            'Authorization': localStorage.getItem('token')
        },
        success: function(data) {
            renderTaskTable(data);
        },
        error: function(err) {
            console.error('Error fetching tasks:', err);
        }
    });
}

function fetchClients() {
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
        url: `http://localhost:${serverPort}/clients`,
        method: 'GET',
        headers: {
            'Authorization': localStorage.getItem('token')
        },
        success: function(data) {
            renderClientTable(data);
        },
        error: function(err) {
            console.error('Error fetching clients:', err);
        }
    });
}

function renderTaskTable(tasks) {
    let taskTable = `
        <table class="table table-striped">
            <thead>
                <tr>
                    <th>Vrsta zadatka</th>
                    <th>Opis</th>
                    <th>Rok</th>
                    <th>Status</th>
                    <th>Prioritet</th>
                    <th>Klijent</th>
                    <th>Kreirao</th>
                    <th>Akcije</th>
                </tr>
            </thead>
            <tbody>
    `;
    tasks.forEach(task => {
        taskTable += `
            <tr>
                <td>${task.task_type_name || 'Nedefinisano'}</td>
                <td>${task.description}</td>
                <td>${new Date(task.due_date).toLocaleString('sr-RS')}</td>
                <td>${task.status}</td>
                <td>${task.priority}</td>
                <td>${task.client_name || 'Nedefinisano'}</td>
                <td>${task.creator}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="editTask(${task.id})">Izmeni</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteTask(${task.id})">Obriši</button>
                    <button class="btn btn-success btn-sm" onclick="completeTask(${task.id})">Završeno</button>
                </td>
            </tr>
        `;
    });
    taskTable += `
            </tbody>
        </table>
    `;
    $('#task-list').html(taskTable);
}

function renderClientTable(clients) {
    let clientTable = `
        <table class="table table-striped">
            <thead>
                <tr>
                    <th>Ime</th>
                    <th>Email</th>
                    <th>Akcije</th>
                </tr>
            </thead>
            <tbody>
    `;
    clients.forEach(client => {
        clientTable += `
            <tr>
                <td>${client.name}</td>
                <td>${client.email}</td>
                <td>
                    <!-- Ovdje možete dodati dugmad za uređivanje ili brisanje klijenata -->
                </td>
            </tr>
        `;
    });
    clientTable += `
            </tbody>
        </table>
    `;
    $('#client-list').html(clientTable);
}

function editTask(taskId) {
    // Implementacija funkcije za izmenu zadatka
}

function deleteTask(taskId) {
    if (confirm('Da li ste sigurni da želite da obrišete ovaj zadatak?')) {
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
            url: `http://localhost:${serverPort}/tasks/${taskId}`,
            method: 'DELETE',
            headers: {
                'Authorization': localStorage.getItem('token')
            },
            success: function(data) {
                fetchTasks();
            },
            error: function(err) {
                console.error('Error deleting task:', err);
            }
        });
    }
}

function completeTask(taskId) {
    const completionTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
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
        url: `http://localhost:${serverPort}/tasks/${taskId}/complete`,
        method: 'PUT',
        headers: {
            'Authorization': localStorage.getItem('token')
        },
        data: { completion_time: completionTime },
        success: function(data) {
            fetchTasks();
        },
        error: function(err) {
            console.error('Error completing task:', err);
        }
    });
}

function showTaskForm() {
    $('#taskModal').modal('show');
}

function showClientForm() {
    $('#clientModal').modal('show');
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    window.location.href = 'index.html';
}
