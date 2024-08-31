import { useState } from "react";
import { useSignup } from "../hooks/useSignup";
import AdminSidebar from "../components/admin/Sidebar_Admin";
import worktrack from "../assets/worktrack.jpg";

const statesAndUTs = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
  "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
  "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Lakshadweep", "Delhi", "Puducherry", "Denmark"
];

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [reportingManager, setReportingManager] = useState("");
  const [state, setState] = useState("");
  const { signup, error, isLoading } = useSignup();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await signup(email, password, fullName, phoneNumber, reportingManager, state);
    if (success) {
      setEmail("");
      setPassword("");
      setFullName("");
      setPhoneNumber("");
      setReportingManager("");
      setState("");
    }
  };

  return (
    <div className="md:flex">
      <AdminSidebar />
      <div className="flex-grow flex flex-col justify-center py-20">
        <form
          className="signup max-w-md mx-auto p-2 bg-white shadow-md rounded-lg"
          onSubmit={handleSubmit}
        >
          <img 
          src={worktrack}
          alt="Logo" 
          className="mx-auto mb-2 w-50 h-50 pb-2 object-contain"
        />
          <h3 className="text-2xl font-semibold mb-4 text-center">Sign Up</h3>
          <div className="flex flex-wrap -mx-2">
            <div className="w-full md:w-1/2 px-2 mb-4">
              <label className="block text-gray-700 mb-2">Full Name:</label>
              <input
                type="text"
                onChange={(e) => setFullName(e.target.value)}
                value={fullName}
                className="w-full p-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
              />

              <label className="block text-gray-700 mb-2">Phone Number:</label>
              <input
                type="text"
                onChange={(e) => setPhoneNumber(e.target.value)}
                value={phoneNumber}
                className="w-full p-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
              />

              <label className="block text-gray-700 mb-2">Reporting Manager:</label>
              <input
                type="text"
                onChange={(e) => setReportingManager(e.target.value)}
                value={reportingManager}
                className="w-full p-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
            <div className="w-full md:w-1/2 px-2 mb-4">
              <label className="block text-gray-700 mb-2">State:</label>
              <select
                onChange={(e) => setState(e.target.value)}
                value={state}
                className="w-full p-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                <option value="" disabled>Select your state</option>
                {statesAndUTs.map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>

              <label className="block text-gray-700 mb-2">Email address:</label>
              <input
                type="email"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                className="w-full p-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
              />

              <label className="block text-gray-700 mb-2">Password:</label>
              <div className="relative w-full mb-4">
                <input
                  type={showPassword ? "text" : "password"}
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-2 top-2 text-gray-600"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
          </div>
          <button
            disabled={isLoading}
            className={`w-full p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-300 ${
              isLoading && "opacity-50 cursor-not-allowed"
            }`}
          >
            Register Employee
          </button>

          {error && (
            <div className="error mt-4 p-2 bg-red-100 text-red-700 border border-red-700 rounded-md">
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Signup;