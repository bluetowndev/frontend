import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RequestPasswordReset = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const response = await fetch('api/user/request-password-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const json = await response.json();

    if (!response.ok) {
      setIsLoading(false);
      setError(json.error);
    } else {
      setIsLoading(false);
      setMessage(json.message);
      setTimeout(() => navigate('/login'), 3000);
    }
  };

  return (
    <form className="request-password-reset max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-lg" onSubmit={handleSubmit}>
      <h3 className="text-2xl font-semibold mb-4 text-center">Request Password Reset</h3>
      <label className="block text-gray-700 mb-2">Email address:</label>
      <input
        type="email"
        onChange={(e) => setEmail(e.target.value)}
        value={email}
        className="w-full p-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
      />
      <button
        disabled={isLoading}
        className={`w-full p-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-300 ${isLoading && 'opacity-50 cursor-not-allowed'}`}
      >
        Send Reset Link
      </button>
      {message && <div className="message mt-4 p-2 bg-green-100 text-green-700 border border-green-700 rounded-md">{message}</div>}
      {error && <div className="error mt-4 p-2 bg-red-100 text-red-700 border border-red-700 rounded-md">{error}</div>}
    </form>
  );
};

export default RequestPasswordReset;
