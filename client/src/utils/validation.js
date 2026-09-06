export const validators = {
  isValidEmail: (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
  },
  
  isValidPassword: (password) => {
    return typeof password === 'string' && password.length >= 6;
  },

  isValidPhone: (phone) => {
    return /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(String(phone).trim());
  },

  isNotEmpty: (val) => {
    return val !== null && val !== undefined && String(val).trim().length > 0;
  }
};
