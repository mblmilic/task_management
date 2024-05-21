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

    $('#loginForm').on('submit', function(event) {
        event.preventDefault();
        const email = $('#email').val();
        const password = $('#password').val();

        $.ajax({
            url: `http://localhost:${serverPort}/login`,
            method: 'POST',
            data: { email, password },
            success: function(data) {
                if (data.auth) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', data.user.username);
                    localStorage.setItem('userRole', data.user.role);
                    window.location.href = 'tasks.html';
                } else {
                    $('#loginError').text('Neuspešna prijava');
                }
            },
            error: function(err) {
                console.error('Error logging in:', err);
                $('#loginError').text('Neuspešna prijava');
            }
        });
    });
});
