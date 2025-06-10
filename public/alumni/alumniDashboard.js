document.addEventListener('DOMContentLoaded', function () {
  const nameElement = document.getElementById('alumni-name');
  const emailElement = document.getElementById('alumni-email');
  const phoneElement = document.getElementById('alumni-phone');
  const occupationElement = document.getElementById('alumni-occupation');
  const companyElement = document.getElementById('alumni-company');
  const graduationYearElement = document.getElementById('alumni-graduationYear');
  const profileFields = document.getElementById('profile-fields');
  const errorElement = document.getElementById('error-message');

  const createBtn = document.getElementById('create-btn');
  const createOptions = document.getElementById('create-options');
  const searchBtn = document.getElementById('search-btn');
  const searchOptions = document.getElementById('search-options');

  // Fetch and verify authentication
  fetch('/api/alumni/me', {
    credentials: 'include'
  })
    .then(response => {
      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/alumniLogin.html?error=session_expired';
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      nameElement.textContent = data.name;
      nameElement.classList.remove('loading');
      emailElement.textContent = data.email || 'Not provided';
      phoneElement.textContent = data.phone || 'Not provided';
      occupationElement.textContent = data.occupation || 'Not provided';
      companyElement.textContent = data.company || 'Not provided';
      graduationYearElement.textContent = data.graduationYear || 'Not provided';
      profileFields.style.display = 'block';
    })
    .catch(error => {
      console.error('Fetch error:', error);
      errorElement.style.display = 'block';
      errorElement.textContent = 'Failed to load alumni data. Please try again.';
      nameElement.textContent = 'Error';
      setTimeout(() => {
        window.location.href = '/alumniLogin.html?error=fetch_failed';
      }, 3000);
    });

  // Toggle create dropdown
  createBtn.addEventListener('click', () => {
    const isVisible = createOptions.style.display === 'block';
    createOptions.style.display = isVisible ? 'none' : 'block';
    searchOptions.style.display = 'none';
  });

  // Toggle search dropdown
  searchBtn.addEventListener('click', () => {
    const isVisible = searchOptions.style.display === 'block';
    searchOptions.style.display = isVisible ? 'none' : 'block';
    createOptions.style.display = 'none';
  });

  // Hide dropdowns on click outside
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.create-btn') && !event.target.closest('#create-options')) {
      createOptions.style.display = 'none';
    }
    if (!event.target.closest('.search-btn') && !event.target.closest('#search-options')) {
      searchOptions.style.display = 'none';
    }
  });

  // Logout logic
  document.getElementById('logout-btn').addEventListener('click', (e) => {
    e.preventDefault();
    fetch('/logout', {
      method: 'GET',
      credentials: 'include'
    })
      .then(() => {
        window.location.replace('http://localhost:5000');
      })
      .catch(error => {
        console.error('Logout error:', error);
        window.location.replace('http://localhost:5000');
      });
  });

  // Reload page if coming from back/forward cache
  window.onpageshow = function (event) {
    if (event.persisted) {
      window.location.reload();
    }
  };
});

