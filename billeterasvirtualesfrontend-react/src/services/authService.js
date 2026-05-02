// authService.js
// Este archivo simula la conexión con una base de datos.
// Más adelante puedes reemplazar localStorage por llamadas a una API real.

const USERS_KEY = 'finwallet_users';
const CURRENT_USER_KEY = 'finwallet_current_user';

// Obtener todos los usuarios registrados
const getUsers = () => {
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : [];
};

// Guardar lista de usuarios
const saveUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

// Registrar un nuevo usuario
export const register = (userData) => {
  const users = getUsers();
  
  // Verificar si el email ya existe
  const existingUser = users.find(u => u.email === userData.email);
  if (existingUser) {
    return { success: false, message: 'El correo electrónico ya está registrado' };
  }
  
  // Crear nuevo usuario con ID único
  const newUser = {
    id: Date.now().toString(),
    ...userData,
    puntos: 0,
    nivel: 'Bronce',
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  saveUsers(users);
  
  return { success: true, message: 'Usuario registrado exitosamente' };
};

// Iniciar sesión
export const login = (email, password) => {
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    // No guardamos la contraseña en la sesión actual por seguridad
    const { password, ...userWithoutPassword } = user;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
    return { success: true, user: userWithoutPassword };
  }
  
  return { success: false, message: 'Correo o contraseña incorrectos' };
};

// Cerrar sesión
export const logout = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
  return { success: true };
};

// Obtener usuario actual (sesión activa)
export const getCurrentUser = () => {
  const user = localStorage.getItem(CURRENT_USER_KEY);
  return user ? JSON.parse(user) : null;
};

// Restablecer contraseña (simula envío de correo)
export const resetPassword = (email) => {
  const users = getUsers();
  const user = users.find(u => u.email === email);
  
  if (user) {
    // En un proyecto real, aquí enviarías un correo con un enlace.
    // Como es simulación, solo devolvemos un mensaje.
    return { 
      success: true, 
      message: `Se ha enviado un enlace de restablecimiento a ${email}` 
    };
  }
  
  return { success: false, message: 'No existe una cuenta con ese correo electrónico' };
};

// Verificar si hay sesión activa (para rutas protegidas)
export const isAuthenticated = () => {
  return getCurrentUser() !== null;
};