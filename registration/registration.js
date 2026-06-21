/**
 * Registration Module Controller (registration.js)
 */

function validatePasswordRules(password) {
  if (password.length > 30) return false;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  return hasUpper && hasLower && hasSpecial;
}

function validateMobileNumber(number) {
  return /^[0-9]{10}$/.test(number);
}

document.getElementById('form-register').addEventListener('submit', function(e) {
  e.preventDefault();

  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const countryCode = document.getElementById('reg-country-code').value;
  const mobile = document.getElementById('reg-mobile').value.trim();
  const address = document.getElementById('reg-address').value.trim();
  const desiredUserId = document.getElementById('reg-userid').value.trim();
  const password = document.getElementById('reg-password').value;
  const confirmPassword = document.getElementById('reg-confirm-password').value;
  const preferences = document.getElementById('reg-preferences').value.trim();

  if (name.length > 50) {
    showToast('Customer Name cannot exceed 50 characters.', 'danger');
    return;
  }

  if (!validateMobileNumber(mobile)) {
    showToast('Mobile number must be a 10 digit numeric string.', 'danger');
    return;
  }

  if (desiredUserId.length < 5 || desiredUserId.length > 20) {
    showToast('User ID must be between 5 and 20 characters.', 'danger');
    return;
  }

  if (!validatePasswordRules(password)) {
    showToast('Password criteria failed! Must contain an uppercase letter, lowercase letter, special character, and be under 30 characters.', 'danger');
    return;
  }

  if (password !== confirmPassword) {
    showToast('Confirm Password does not match Password.', 'danger');
    return;
  }

  const users = getUsers();
  
  const idTaken = users.some(u => u.userId.toLowerCase() === desiredUserId.toLowerCase() || (u.customId && u.customId.toLowerCase() === desiredUserId.toLowerCase()));
  if (idTaken) {
    showToast('This User ID is already taken. Please choose another.', 'danger');
    return;
  }

  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const generatedUsername = `cust_${randomSuffix}`;

  const newUser = {
    userId: generatedUsername,
    customId: desiredUserId,
    password: password,
    role: 'customer',
    name: name,
    email: email,
    mobile: countryCode + mobile,
    address: address,
    preferences: preferences
  };

  users.push(newUser);
  saveUsers(users);

  document.getElementById('ack-username').textContent = generatedUsername;
  document.getElementById('ack-name').textContent = name;
  document.getElementById('ack-email').textContent = email;

  document.getElementById('view-register').classList.remove('active');
  document.getElementById('view-register-success').classList.add('active');
  
  showToast('Registration successful!', 'success');
});

document.getElementById('btn-ack-login').addEventListener('click', function() {
  const generatedUsername = document.getElementById('ack-username').textContent;
  window.location.href = `../login/login.html?registeredUser=${encodeURIComponent(generatedUsername)}`;
});
