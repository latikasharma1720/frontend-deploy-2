// src/utils/validation.js

export const isPfwEmail = (email) => {
  if (!email) return false;
  return email.toLowerCase().trim().endsWith('@pfw.edu');
};

export const isStrongPassword = (password) => {
  if (!password) return false;
  return password.length >= 8;
};

export const isValidEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};