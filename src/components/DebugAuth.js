import React from 'react';

const DebugAuth = () => {
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
  
  const clearToken = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  };
  
  const testToken = () => {
    console.log('Current token:', token);
    console.log('Token exists:', !!token);
    console.log('Token length:', token?.length);
    console.log('Token type:', typeof token);
    console.log('Direct token from localStorage:', localStorage.getItem('token'));
    console.log('User data from localStorage:', localStorage.getItem('user'));
  };

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-300 rounded-lg p-4 shadow-lg z-50">
      <h3 className="font-bold text-yellow-800 mb-2">Debug Authentication</h3>
      <div className="text-sm text-yellow-700 space-y-1">
        <p>Token exists: {token ? 'Yes' : 'No'}</p>
        <p>Token length: {token?.length || 0}</p>
        <p>Token preview: {token ? `${token.substring(0, 20)}...` : 'None'}</p>
      </div>
      <div className="mt-3 space-x-2">
        <button 
          onClick={testToken}
          className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
        >
          Test Token
        </button>
        <button 
          onClick={clearToken}
          className="bg-red-500 text-white px-2 py-1 rounded text-xs"
        >
          Clear Token
        </button>
      </div>
    </div>
  );
};

export default DebugAuth;
