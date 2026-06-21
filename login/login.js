/**
 * Login Module Controller (login.js)
 */

function validatePasswordRules(password) {
  if (password.length > 30) return false;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  return hasUpper && hasLower && hasSpecial;
}

document.getElementById('form-login').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const userIdInput = document.getElementById('login-userid').value.trim();
  const passwordInput = document.getElementById('login-password').value;

  if (userIdInput.length < 5 || userIdInput.length > 20) {
    showToast('User ID must be between 5 and 20 characters.', 'danger');
    return;
  }
  if (!validatePasswordRules(passwordInput)) {
    showToast('Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 special character, and be maximum 30 characters.', 'danger');
    return;
  }

  const users = getUsers();
  const foundUser = users.find(u => u.userId.toLowerCase() === userIdInput.toLowerCase() && u.password === passwordInput);

  if (foundUser) {
    showToast(`Welcome back, ${foundUser.name}!`, 'success');
    setCurrentUser(foundUser);
    setTimeout(() => {
      window.location.href = '../dashboard/dashboard.html';
    }, 1000);
  } else {
    showToast('Invalid User ID or Password.', 'danger');
  }
});

window.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const registeredUser = urlParams.get('registeredUser');
  if (registeredUser) {
    document.getElementById('login-userid').value = registeredUser;
    showToast('Please sign in with your generated username.', 'info');
  }
});
