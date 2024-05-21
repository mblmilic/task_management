


$(document).ready(function() {
    $('#adminLoginForm').on('submit', function(event) {
        event.preventDefault();
        const email = $('#email').val();
        const password = $('#password').val();

        $.ajax({
            url: 'http://localhost:3002/login', // Proverite da li je port ispravan
            method: 'POST',
            data: { email, password },
            success: function(data) {
                if (data.user.role === 'admin') {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', data.user.username);
                    localStorage.setItem('userRole', data.user.role);
                    window.location.href = 'admin.html';
                } else {
                    $('#loginError').text('Pristup dozvoljen samo admin korisnicima.');
                }
            },
            error: function(err) {
                $('#loginError').text('Neispravna lozinka ili email.');
                console.error('Error logging in:', err);
            }
        });
    });
});
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

    $('#adminLoginForm').on('submit', function(event) {
        event.preventDefault();
        const email = $('#email').val();
        const password = $('#password').val();

        $.ajax({
            url: `http://localhost:${serverPort}/login`,
            method: 'POST',
            data: { email, password },
            success: function(data) {
                if (data.user.role === 'admin') {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', data.user.username);
                    localStorage.setItem('userRole', data.user.role);
                    window.location.href = 'admin.html';
                } else {
                    $('#loginError').text('Pristup dozvoljen samo admin korisnicima.');
                }
            },
            error: function(err) {
                $('#loginError').text('Neispravna lozinka ili email.');
                console.error('Error logging in:', err);
            }
        });
    });
});
