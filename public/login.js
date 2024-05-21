$(document).ready(function() {
    $('#loginForm').on('submit', function(event) {
        event.preventDefault();
        const user = {
            email: $('#loginEmail').val(),
            password: $('#loginPassword').val()
        };
        loginUser(user);
    });
});

function loginUser(user) {
    $.ajax({
        url: '/login',
        method: 'POST',
        data: user,
        success: function(data) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', user.email);
            window.location.href = 'tasks.html';
        },
        error: function(err) {
            $('#loginMessage').text('Error logging in.');
            console.error('Error logging in:', err);
        }
    });
}
