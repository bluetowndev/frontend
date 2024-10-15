import { useState } from "react";
import { useLogin } from "../hooks/useLogin";
import GeminiWave from "../components/sync/GeminiWave";
import GradientShineButton from "../components/sync/GradientShineButton";
import TypingEffect from "../components/sync/TypingEffect";
import HorizontalCards from "../components/HorizontalCard"; // Import the HorizontalCards component

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
    <div className="relative w-full h-full flex flex-col items-center bg-gray-50">
      {/* GeminiWave animation as background */}
      <div className="absolute inset-0">
        <GeminiWave />
      </div>

      {/* Main content container */}
      <div className="relative z-10 flex flex-col w-full items-center justify-center flex-grow space-y-8 p-4 lg:flex-row">
        
        {/* Text for mobile and left side for large screens */}
        <div className="flex flex-col items-center lg:hidden w-full mb-8">
          <h1 
            className="text-4xl font-bold text-white pb-3 text-center" 
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            WORKTRACK
          </h1>
          <TypingEffect 
            text="Simplifying Field Work" 
            className="text-2xl font-bold text-white text-center" 
            style={{ fontFamily: "'Raleway', sans-serif" }} 
          />
        </div>

        {/* Text for large screens */}
        <div className="hidden lg:flex lg:items-center lg:justify-center lg:w-1/2 lg:min-h-screen">
          <div className="text-center">
            <h1 
              className="text-6xl font-bold text-white pb-5" 
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              WORKTRACK
            </h1>
            <TypingEffect 
              text="Simplifying Field Work" 
              className="text-4xl lg:text-5xl font-bold text-white" 
              style={{ fontFamily: "'Raleway', sans-serif" }} 
            />
          </div>
        </div>

        {/* Login form */}
        <div className="relative z-10 w-full max-w-md p-8 m-5 bg-white/70 rounded-xl shadow-2xl backdrop-blur-md bg-opacity-80 lg:w-1/3">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
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

      {/* Heading and Cards Section */}
      <div className="w-full mt-10 pb-4 text-center relative z-20">
        {/* Centered heading for "Today's non compliance" */}
        <h2 
          className="text-4xl font-bold text-white mb-6"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Today's Non Compliance
        </h2>

        {/* Horizontal Cards placed just below the heading */}
        <HorizontalCards />
      </div>
    </div>
  );
};

export default Login;
