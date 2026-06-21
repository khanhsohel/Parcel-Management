/**
 * Dashboard Module Controller (dashboard.js)
 */

window.addEventListener('DOMContentLoaded', () => {
  const user = getCurrentUser();
  if (!user) return;

  const customerView = document.getElementById('view-customer-home');
  const officerView = document.getElementById('view-officer-home');

  if (user.role === 'customer') {
    customerView.classList.add('active');
    officerView.classList.remove('active');
    setupCustomerActions();
  } else if (user.role === 'officer') {
    officerView.classList.add('active');
    customerView.classList.remove('active');
    setupOfficerActions();
  }
});

function setupCustomerActions() {
  document.getElementById('card-cust-book').addEventListener('click', () => {
    window.location.href = '../booking/booking.html';
  });
  document.getElementById('card-cust-track').addEventListener('click', () => {
    window.location.href = '../tracking/tracking.html';
  });
  document.getElementById('card-cust-history').addEventListener('click', () => {
    window.location.href = '../history/history.html';
  });
}

function setupOfficerActions() {
  document.getElementById('card-off-book').addEventListener('click', () => {
    window.location.href = '../booking/booking.html';
  });
  document.getElementById('card-off-pickup').addEventListener('click', () => {
    window.location.href = '../pickup/pickup.html';
  });
  document.getElementById('card-off-delivery').addEventListener('click', () => {
    window.location.href = '../delivery/delivery.html';
  });
}
