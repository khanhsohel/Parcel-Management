/**
 * Parcel Management System (PMS)
 * Shared Logic Controller & Layout Injector (common.js)
 */

// ==================== 1. DATABASE & STATE INITIALIZATION ====================

const SEED_USERS = [
  {
    userId: 'customer01',
    password: 'Password123!',
    role: 'customer',
    name: 'John Doe',
    email: 'john@example.com',
    mobile: '9876543210',
    address: '123 Main Street, New York, NY 10001'
  },
  {
    userId: 'customer02',
    password: 'Password123!',
    role: 'customer',
    name: 'Jane Smith',
    email: 'jane@example.com',
    mobile: '8765432109',
    address: '456 Elm Street, San Francisco, CA 94101'
  },
  {
    userId: 'officer01',
    password: 'Password123!',
    role: 'officer',
    name: 'Officer Jack Cooper',
    email: 'j.cooper@pms.com',
    mobile: '9991112222',
    address: 'Central Logistics Terminal, Chicago, IL'
  },
  {
    userId: 'officer02',
    password: 'Password123!',
    role: 'officer',
    name: 'Officer Dana Scully',
    email: 'd.scully@pms.com',
    mobile: '9993334444',
    address: 'Federal Parcel Hub, Washington, DC'
  }
];

const SEED_BOOKINGS = [
  {
    bookingId: '100234567891',
    customerId: 'customer01',
    senderName: 'John Doe',
    senderAddress: '123 Main Street, New York, NY 10001',
    senderContact: '9876543210',
    receiverName: 'Alice Johnson',
    receiverAddress: '555 Pine Street, Seattle, WA 98101',
    receiverPin: '98101',
    receiverContact: '9998887776',
    weight: 500,
    size: 'small',
    contents: 'Official Documents',
    insurance: false,
    tracking: true,
    speed: 'standard',
    packaging: 'standard',
    pickupTime: '2026-06-10T12:00',
    dropoffTime: '2026-06-11T14:30',
    cost: 7.00,
    status: 'Delivered',
    bookingDate: '2026-06-10 10:00',
    paymentTime: '2026-06-10 10:05'
  },
  {
    bookingId: '200345678912',
    customerId: 'customer01',
    senderName: 'John Doe',
    senderAddress: '123 Main Street, New York, NY 10001',
    senderContact: '9876543210',
    receiverName: 'Bob Miller',
    receiverAddress: '888 Oak Ave, Boston, MA 02108',
    receiverPin: '02108',
    receiverContact: '8887776665',
    weight: 2500,
    size: 'medium',
    contents: 'Winter Jackets',
    insurance: true,
    tracking: true,
    speed: 'express',
    packaging: 'eco',
    pickupTime: '2026-06-13T11:00',
    dropoffTime: '2026-06-15T16:00',
    cost: 23.00,
    status: 'In Transit',
    bookingDate: '2026-06-13 09:15',
    paymentTime: '2026-06-13 09:20'
  },
  {
    bookingId: '300456789123',
    customerId: 'customer02',
    senderName: 'Jane Smith',
    senderAddress: '456 Elm Street, San Francisco, CA 94101',
    senderContact: '8765432109',
    receiverName: 'Charlie Brown',
    receiverAddress: '121 Peanuts Lane, Minneapolis, MN 55101',
    receiverPin: '55101',
    receiverContact: '7776665554',
    weight: 12000,
    size: 'large',
    contents: 'Antique Desk Lamp',
    insurance: true,
    tracking: true,
    speed: 'next-day',
    packaging: 'fragile',
    pickupTime: '2026-06-14T11:30',
    dropoffTime: '',
    cost: 63.00,
    status: 'Picked up',
    bookingDate: '2026-06-14 08:00',
    paymentTime: '2026-06-14 08:05'
  },
  {
    bookingId: '400567891234',
    customerId: 'customer02',
    senderName: 'Jane Smith',
    senderAddress: '456 Elm Street, San Francisco, CA 94101',
    senderContact: '8765432109',
    receiverName: 'David Beckham',
    receiverAddress: '999 Soccer Road, Los Angeles, CA 90001',
    receiverPin: '90001',
    receiverContact: '6665554443',
    weight: 1500,
    size: 'medium',
    contents: 'Signed Football',
    insurance: false,
    tracking: false,
    speed: 'standard',
    packaging: 'standard',
    pickupTime: '',
    dropoffTime: '',
    cost: 15.00,
    status: 'Booked',
    bookingDate: '2026-06-14 15:30',
    paymentTime: '2026-06-14 15:35'
  }
];

function initDatabase() {
  if (!localStorage.getItem('pms_users')) {
    localStorage.setItem('pms_users', JSON.stringify(SEED_USERS));
  }
  if (!localStorage.getItem('pms_bookings')) {
    localStorage.setItem('pms_bookings', JSON.stringify(SEED_BOOKINGS));
  }
}

function getUsers() {
  return JSON.parse(localStorage.getItem('pms_users')) || [];
}

function saveUsers(users) {
  localStorage.setItem('pms_users', JSON.stringify(users));
}

function getBookings() {
  return JSON.parse(localStorage.getItem('pms_bookings')) || [];
}

function saveBookings(bookings) {
  localStorage.setItem('pms_bookings', JSON.stringify(bookings));
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem('pms_current_user')) || null;
}

function setCurrentUser(user) {
  localStorage.setItem('pms_current_user', JSON.stringify(user));
}

function logout() {
  localStorage.removeItem('pms_current_user');
  showToast('Logged out successfully.', 'info');
  setTimeout(() => {
    window.location.href = getBasePath() + 'login/login.html';
  }, 500);
}

// ==================== 2. PATH UTILITIES ====================

function getBasePath() {
  const path = window.location.pathname;
  const parts = path.split('/');
  // If we're inside a subfolder (login, dashboard, etc.), go up one level
  const knownFolders = ['login', 'registration', 'dashboard', 'booking', 'tracking', 'delivery', 'pickup', 'history', 'support'];
  const currentFolder = parts[parts.length - 2];
  return knownFolders.includes(currentFolder) ? '../' : '';
}

function getPageName() {
  const path = window.location.pathname;
  return path.substring(path.lastIndexOf('/') + 1);
}

function isGuestPage(page) {
  return ['login.html', 'registration.html', 'index.html', ''].includes(page);
}

// ==================== 3. NOTIFICATIONS & TOASTS ====================

function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let iconClass = 'fa-circle-info';
  if (type === 'success') iconClass = 'fa-circle-check';
  if (type === 'danger') iconClass = 'fa-triangle-exclamation';

  toast.innerHTML = `
    <i class="fa-solid ${iconClass}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 4000);
}

// ==================== 4. ROUTING SECURITY GUARDS ====================

function checkAuthGuard() {
  const user = getCurrentUser();
  const page = getPageName();
  const base = getBasePath();

  if (!user && !isGuestPage(page)) {
    window.location.href = base + 'login/login.html';
    return false;
  }

  if (user && isGuestPage(page)) {
    window.location.href = base + 'dashboard/dashboard.html';
    return false;
  }

  if (user && user.role === 'customer') {
    const officerOnlyPages = ['pickup.html', 'delivery.html'];
    if (officerOnlyPages.includes(page)) {
      window.location.href = base + 'dashboard/dashboard.html';
      return false;
    }
  }

  return true;
}

// ==================== 5. LAYOUT INJECTOR (SIDEBAR & HEADER) ====================

function injectLayout() {
  const user = getCurrentUser();
  const page = getPageName() || 'login.html';
  const base = getBasePath();

  const sidebarPlaceholder = document.getElementById('sidebar-placeholder');
  const headerPlaceholder = document.getElementById('header-placeholder');

  if (sidebarPlaceholder) {
    let sidebarHTML = `
      <aside class="sidebar" id="app-sidebar">
        <div class="sidebar-brand">
          <i class="fa-solid fa-box-open brand-icon"></i>
          <span>PMS Portal</span>
        </div>
        <nav class="sidebar-menu">
    `;

    if (!user) {
      sidebarHTML += `
        <ul id="menu-guest" class="menu-list active">
          <li>
            <a href="${base}login/login.html" id="link-login" class="menu-item ${page === 'login.html' ? 'active' : ''}">
              <i class="fa-solid fa-right-to-bracket"></i>
              <span>Login</span>
            </a>
          </li>
          <li>
            <a href="${base}registration/registration.html" id="link-register" class="menu-item ${page === 'registration.html' ? 'active' : ''}">
              <i class="fa-solid fa-user-plus"></i>
              <span>Register</span>
            </a>
          </li>
        </ul>
      `;
    } else if (user.role === 'customer') {
      sidebarHTML += `
        <ul id="menu-customer" class="menu-list active">
          <li>
            <a href="${base}dashboard/dashboard.html" id="link-cust-home" class="menu-item ${page === 'dashboard.html' ? 'active' : ''}">
              <i class="fa-solid fa-house"></i>
              <span>Home</span>
            </a>
          </li>
          <li>
            <a href="${base}booking/booking.html" id="link-cust-booking" class="menu-item ${page === 'booking.html' ? 'active' : ''}">
              <i class="fa-solid fa-truck-ramp-box"></i>
              <span>Booking Service</span>
            </a>
          </li>
          <li>
            <a href="${base}tracking/tracking.html" id="link-cust-tracking" class="menu-item ${page === 'tracking.html' ? 'active' : ''}">
              <i class="fa-solid fa-magnifying-glass-location"></i>
              <span>Tracking</span>
            </a>
          </li>
          <li>
            <a href="${base}history/history.html" id="link-cust-history" class="menu-item ${page === 'history.html' ? 'active' : ''}">
              <i class="fa-solid fa-clock-rotate-left"></i>
              <span>Previous Booking</span>
            </a>
          </li>
          <li>
            <a href="${base}support/support.html" id="link-cust-support" class="menu-item ${page === 'support.html' ? 'active' : ''}">
              <i class="fa-solid fa-headset"></i>
              <span>Contact Support</span>
            </a>
          </li>
          <li>
            <a href="#" id="link-cust-logout" class="menu-item text-danger">
              <i class="fa-solid fa-power-off"></i>
              <span>Logout</span>
            </a>
          </li>
        </ul>
      `;
    } else if (user.role === 'officer') {
      sidebarHTML += `
        <ul id="menu-officer" class="menu-list active">
          <li>
            <a href="${base}dashboard/dashboard.html" id="link-off-home" class="menu-item ${page === 'dashboard.html' ? 'active' : ''}">
              <i class="fa-solid fa-house"></i>
              <span>Home</span>
            </a>
          </li>
          <li>
            <a href="${base}booking/booking.html" id="link-off-booking" class="menu-item ${page === 'booking.html' ? 'active' : ''}">
              <i class="fa-solid fa-truck-ramp-box"></i>
              <span>Book Parcel</span>
            </a>
          </li>
          <li>
            <a href="${base}tracking/tracking.html" id="link-off-tracking" class="menu-item ${page === 'tracking.html' ? 'active' : ''}">
              <i class="fa-solid fa-magnifying-glass-location"></i>
              <span>Tracking</span>
            </a>
          </li>
          <li>
            <a href="${base}delivery/delivery.html" id="link-off-delivery" class="menu-item ${page === 'delivery.html' ? 'active' : ''}">
              <i class="fa-solid fa-truck-arrow-right"></i>
              <span>Delivery Status</span>
            </a>
          </li>
          <li>
            <a href="${base}pickup/pickup.html" id="link-off-pickup" class="menu-item ${page === 'pickup.html' ? 'active' : ''}">
              <i class="fa-solid fa-calendar-check"></i>
              <span>Pickup Scheduling</span>
            </a>
          </li>
          <li>
            <a href="${base}history/history.html" id="link-off-history" class="menu-item ${page === 'history.html' ? 'active' : ''}">
              <i class="fa-solid fa-list-check"></i>
              <span>Previous Booking</span>
            </a>
          </li>
          <li>
            <a href="#" id="link-off-logout" class="menu-item text-danger">
              <i class="fa-solid fa-power-off"></i>
              <span>Logout</span>
            </a>
          </li>
        </ul>
      `;
    }

    sidebarHTML += `
        </nav>
        <div class="sidebar-footer">
          <span class="version-label">v1.0.0</span>
        </div>
      </aside>
    `;

    sidebarPlaceholder.outerHTML = sidebarHTML;

    const custLogoutBtn = document.getElementById('link-cust-logout');
    if (custLogoutBtn) custLogoutBtn.addEventListener('click', (e) => { e.preventDefault(); logout(); });

    const offLogoutBtn = document.getElementById('link-off-logout');
    if (offLogoutBtn) offLogoutBtn.addEventListener('click', (e) => { e.preventDefault(); logout(); });
  }

  if (headerPlaceholder && user) {
    const titleMap = {
      'dashboard.html': user.role === 'customer' ? 'Customer Home Dashboard' : 'Officer Home Dashboard',
      'booking.html': 'Book Shipment Service',
      'tracking.html': 'Track Shipment',
      'pickup.html': 'Schedule Package Pickup',
      'delivery.html': 'Update Shipment Status',
      'history.html': user.role === 'customer' ? 'Your Booking History' : 'Master Booking Records',
      'support.html': 'Customer Support Contacts'
    };

    const viewTitle = titleMap[page] || 'Dashboard';
    const roleText = user.role.charAt(0).toUpperCase() + user.role.slice(1);

    const headerHTML = `
      <header class="top-header" id="top-header">
        <div class="header-title" id="header-view-title">${viewTitle}</div>
        <div class="header-profile">
          <div class="profile-info">
            <span class="welcome-text">Welcome, <strong id="header-username">${user.name}</strong></span>
            <span class="user-role-badge" id="header-user-role">${roleText}</span>
          </div>
          <button class="header-logout-btn" id="header-logout-btn" title="Logout">
            <i class="fa-solid fa-right-from-bracket"></i>
          </button>
        </div>
      </header>
    `;

    headerPlaceholder.outerHTML = headerHTML;

    const profileLogoutBtn = document.getElementById('header-logout-btn');
    if (profileLogoutBtn) profileLogoutBtn.addEventListener('click', logout);
  }
}

initDatabase();
if (checkAuthGuard()) {
  window.addEventListener('DOMContentLoaded', injectLayout);
}
