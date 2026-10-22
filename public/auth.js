const authForm = document.getElementById('authForm');
const formTitle = document.getElementById('formTitle');
const toggleBtn = document.getElementById('toggleBtn');
const toggleText = document.getElementById('toggleText');
const usernameField = document.getElementById('usernameField');
const roleField = document.getElementById('roleField');
const submitBtn = document.getElementById('submitBtn');
const errorMsg = document.getElementById('errorMsg');

let isLogin = true;

toggleBtn.addEventListener('click', () => {
    isLogin = !isLogin;
    if (isLogin) {
        formTitle.textContent = 'Student Portal Login';
        submitBtn.textContent = 'Login';
        toggleText.textContent = "Don't have an account?";
        toggleBtn.textContent = 'Register';
        usernameField.classList.add('hidden');
        roleField.classList.add('hidden');
    } else {
        formTitle.textContent = 'Register New Account';
        submitBtn.textContent = 'Register';
        toggleText.textContent = 'Already have an account?';
        toggleBtn.textContent = 'Login';
        usernameField.classList.remove('hidden');
        roleField.classList.remove('hidden');
    }
    errorMsg.classList.add('hidden');
});

authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMsg.classList.add('hidden');

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin ? { email, password } : {
        username: document.getElementById('username').value,
        email,
        password,
        role: document.getElementById('role').value
    };

    try {
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Authentication failed');

        if (isLogin) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);
            localStorage.setItem('username', data.username);
            window.location.href = 'dashboard.html';
        } else {
            alert('Registration successful! Please login.');
            toggleBtn.click();
        }
    } catch (err) {
        errorMsg.textContent = err.message;
        errorMsg.classList.remove('hidden');
    }
});