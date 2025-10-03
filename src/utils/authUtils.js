// Authentication utility functions

export const isAuthenticated = () => {
  let token = localStorage.getItem('token');
  
  // If token is not found directly, check if it's stored as part of an object
  if (!token) {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      token = userData.token;
    } catch (error) {
      console.log('Error parsing user data:', error);
    }
  }
  
  return token !== null && token !== undefined && token !== '';
};

export const getToken = () => {
  let token = localStorage.getItem('token');
  
  // If token is not found directly, check if it's stored as part of an object
  if (!token) {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      token = userData.token;
    } catch (error) {
      console.log('Error parsing user data:', error);
    }
  }
  
  return token;
};

export const clearAuth = () => {
  localStorage.removeItem('token');
  window.location.href = '/login';
};

export const validateToken = async () => {
  const token = getToken();
  if (!token) {
    clearAuth();
    return false;
  }

  try {
    // You can add additional token validation here if needed
    // For now, we'll just check if it exists
    return true;
  } catch (error) {
    console.error('Token validation error:', error);
    clearAuth();
    return false;
  }
};

export const requireAuth = () => {
  if (!isAuthenticated()) {
    clearAuth();
    return false;
  }
  return true;
};
