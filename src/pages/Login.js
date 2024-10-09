import { useState } from "react";
import { useLogin } from "../hooks/useLogin";
import worktrack from "../assets/worktrack.jpg";
import GeminiWave from "../components/sync/GeminiWave";
import GradientShineButton from "../components/sync/GradientShineButton";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, error, isLoading } = useLogin();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden flex justify-center items-center">
      {/* GeminiWave animation as background */}
      <div className="absolute inset-0">
        <GeminiWave />
      </div>

      {/* Login form container with backdrop-blur effect */}
      <div className="relative z-10 max-w-lg mx-auto p-8 bg-white/70 rounded-xl shadow-2xl backdrop-blur-md bg-opacity-80">
        <div className="flex flex-col items-center">
          <img 
            src={worktrack} 
            alt="Logo" 
            className="w-32 h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 object-contain" // Adjusted logo size for better visibility
          />
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            {/* <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label> */}
            <input 
              type="email" 
              onChange={(e) => setEmail(e.target.value)} 
              value={email}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Email"
              required
            />
          </div>

          <div>
            {/* <label className="block text-sm font-medium text-gray-700 mb-1">Password</label> */}
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                onChange={(e) => setPassword(e.target.value)} 
                value={password}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Password"
                required
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-3 top-3 text-gray-600"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Button with centered alignment */}
          <div className="flex justify-center mt-6">
            <GradientShineButton
              type="submit" 
              disabled={isLoading}
              sx={{ width: '100%', padding: '12px', borderRadius: '8px' }}
              text="Sign in"
            />
          </div>

          {error && (
            <div className="error mt-4 p-3 bg-red-100 text-red-700 border border-red-700 rounded-md">
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;
