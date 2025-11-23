// Usuarios de ejemplo (simulación de base de datos)
const USERS = [
    {
        email: 'mesero@restaurante.com',
        password: '123456',
        role: 'mesero',
        name: 'Juan Pérez'
    },
    {
        email: 'cajero@restaurante.com',
        password: '123456',
        role: 'cajero',
        name: 'Ana López'
    },
    {
        email: 'admin@restaurante.com',
        password: 'admin123',
        role: 'admin',
        name: 'Administrador'
    }
];

let currentUser = null;

document.addEventListener('deviceready', onDeviceReady, false);
// Para probar en navegador también:
document.addEventListener('DOMContentLoaded', onDeviceReady, false);

function onDeviceReady() {
    console.log('Device listo');

    const loginForm = document.getElementById('login-form');
    const btnLogout = document.getElementById('btn-logout');
    const navButtons = document.querySelectorAll('.nav-btn');
    const togglePasswordBtn = document.getElementById('toggle-password');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    if (btnLogout) {
        btnLogout.addEventListener('click', handleLogout);
    }
    navButtons.forEach(btn => {
        btn.addEventListener('click', handleModuleClick);
    });
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', togglePasswordVisibility);
    }

    // Intentar cargar credenciales guardadas
    loadRememberedCredentials();
}

/* ---------- LOGIN ---------- */

function handleLogin(event) {
    event.preventDefault();

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const roleSelect = document.getElementById('role');
    const rememberMe = document.getElementById('remember-me');
    const errorBox = document.getElementById('login-error');

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const role = roleSelect.value;

    if (!email || !password || !role) {
        showError('Por favor, completa todos los campos.');
        return;
    }

    const user = USERS.find(
        (u) => u.email === email && u.password === password && u.role === role
    );

    if (!user) {
        showError('Credenciales incorrectas o rol no coincide.');
        return;
    }

    // Limpiar error
    errorBox.classList.add('hidden');
    errorBox.textContent = '';

    currentUser = user;

    // Recordar credenciales
    if (rememberMe.checked) {
        localStorage.setItem('remember_email', email);
        localStorage.setItem('remember_password', password);
        localStorage.setItem('remember_role', role);
        localStorage.setItem('remember_me', '1');
    } else {
        localStorage.removeItem('remember_email');
        localStorage.removeItem('remember_password');
        localStorage.removeItem('remember_role');
        localStorage.removeItem('remember_me');
    }

    goToMenu();
}

function showError(message) {
    const errorBox = document.getElementById('login-error');
    errorBox.textContent = message;
    errorBox.classList.remove('hidden');
    errorBox.classList.add('error');
}

function loadRememberedCredentials() {
    const rememberFlag = localStorage.getItem('remember_me');
    if (!rememberFlag) return;

    const email = localStorage.getItem('remember_email') || '';
    const password = localStorage.getItem('remember_password') || '';
    const role = localStorage.getItem('remember_role') || '';

    document.getElementById('email').value = email;
    document.getElementById('password').value = password;
    document.getElementById('role').value = role;
    document.getElementById('remember-me').checked = true;
}

/* Mostrar / ocultar contraseña */

function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.getElementById('toggle-password');

    if (!passwordInput) return;

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.textContent = '🙈';
    } else {
        passwordInput.type = 'password';
        toggleBtn.textContent = '👁';
    }
}

/* ---------- NAVEGACIÓN ---------- */

function goToMenu() {
    const loginView = document.getElementById('login-view');
    const menuView = document.getElementById('menu-view');
    const userLabel = document.getElementById('user-label');
    const roleLabel = document.getElementById('role-label');

    if (currentUser) {
        userLabel.textContent = `${currentUser.name} (${currentUser.email})`;

        let roleText = '';
        switch (currentUser.role) {
            case 'mesero':
                roleText = 'Mesero';
                break;
            case 'cajero':
                roleText = 'Cajero';
                break;
            case 'admin':
                roleText = 'Administrador';
                break;
            default:
                roleText = currentUser.role;
        }
        roleLabel.textContent = roleText;
    }

    loginView.classList.remove('active');
    menuView.classList.add('active');
}

function handleLogout() {
    currentUser = null;

    const loginView = document.getElementById('login-view');
    const menuView = document.getElementById('menu-view');

    menuView.classList.remove('active');
    loginView.classList.add('active');

    // Limpiar selección de menú
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    const moduleTitle = document.getElementById('module-title');
    const moduleMessage = document.getElementById('module-message');
    moduleTitle.textContent = 'Menú Principal';
    moduleMessage.textContent = 'Selecciona un módulo en la barra superior para continuar.';
}

/* Cuando se selecciona un módulo de la barra superior */

function handleModuleClick(event) {
    const moduleKey = event.currentTarget.getAttribute('data-module');
    const moduleTitle = document.getElementById('module-title');
    const moduleMessage = document.getElementById('module-message');

    // Marcar botón activo
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');

    let nombreModulo = '';
    switch (moduleKey) {
        case 'mesas':
            nombreModulo = 'Mesas';
            break;
        case 'pedidos':
            nombreModulo = 'Pedidos';
            break;
        case 'cuentas':
            nombreModulo = 'Cuentas / Cierre de cuentas';
            break;
        case 'reportes':
            nombreModulo = 'Reportes';
            break;
        case 'configuracion':
            nombreModulo = 'Configuración';
            break;
        default:
            nombreModulo = 'Módulo';
    }

    moduleTitle.textContent = nombreModulo;
    moduleMessage.textContent =
        `Seleccionaste el módulo: ${nombreModulo}. ` +
        'Esta sección será desarrollada en otros apartados del proyecto.';
}
