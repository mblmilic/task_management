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

    $('#registerForm').on('submit', function(event) {
        event.preventDefault();
        const username = $('#username').val();
        const email = $('#email').val();
        const password = $('#password').val();

        $.ajax({
            url: `http://localhost:${serverPort}/register`,
            method: 'POST',
            data: { username, email, password },
            success: function(data) {
                if (data.auth) {
                    localStorage.setItem('token', data.token);
                    window.location.href = 'index.html';
                } else {
                    $('#registerError').text('Neuspešna registracija');
                }
            },
            error: function(err) {
                console.error('Error registering:', err);
                $('#registerError').text('Neuspešna registracija');
            }
        });
    });
});
