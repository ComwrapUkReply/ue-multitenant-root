/**
 * Login block implementation
 * Provides authentication interface for users
 */

/**
 * Create login form HTML
 * @param {HTMLElement} block - The block DOM element
 * @param {string} apiUrl - Login API endpoint URL
 * @returns {HTMLElement} The login form element
 */
const createLoginForm = (block, apiUrl) => {
  const formContainer = document.createElement('div');
  formContainer.className = 'login-form-container';

  formContainer.innerHTML = `
    <div class="login-header">
      <h1>${block.querySelector('h1, h2, h3')?.textContent || 'Sign In'}</h1>
    </div>
    
    <div class="error-message" id="errorMessage" style="display: none;"></div>
    
    <form class="login-form" id="loginForm">
      <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" id="email" name="email" required autocomplete="email">
      </div>
      
      <div class="form-group">
        <label for="password">Password:</label>
        <input type="password" id="password" name="password" required autocomplete="current-password">
      </div>
      
      <button type="submit" class="login-button">Sign In</button>
    </form>
    
    <div class="demo-credentials">
      <strong>Demo Credentials:</strong><br>
      Member: member@example.com / demo123<br>
      Premium: premium@example.com / demo123<br>
      Admin: admin@example.com / demo123
    </div>
  `;

  return formContainer;
};

/**
 * Handle login form submission
 * @param {Event} event - Form submit event
 * @param {string} apiUrl - Login API endpoint URL
 */
const handleLoginSubmit = async (event, apiUrl) => {
  event.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errorMessage = document.getElementById('errorMessage');

  // Hide previous error
  errorMessage.style.display = 'none';

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // Get return URL from query parameter
      const urlParams = new URLSearchParams(window.location.search);
      const returnUrl = urlParams.get('returnUrl') || '/';

      // Redirect to return URL
      window.location.href = returnUrl;
    } else {
      // Show error
      errorMessage.textContent = data.error || 'Login failed';
      errorMessage.style.display = 'block';
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Login error:', error);
    errorMessage.textContent = 'An error occurred. Please try again.';
    errorMessage.style.display = 'block';
  }
};

/**
 * Decorate login block
 * @param {HTMLElement} block - The block DOM element
 */
export default function decorate(block) {
  // Get API URL from block configuration
  const apiUrl = block.dataset.apiUrl || '/api/login';

  // Clear block content
  block.innerHTML = '';

  // Create and add login form
  const formContainer = createLoginForm(block, apiUrl);
  block.appendChild(formContainer);

  // Add form submit handler
  const form = block.querySelector('#loginForm');
  if (form) {
    form.addEventListener('submit', (event) => handleLoginSubmit(event, apiUrl));
  }

  // Add analytics tracking
  form?.addEventListener('submit', () => {
    // eslint-disable-next-line no-console
    console.log('Login attempt');
  });
}

