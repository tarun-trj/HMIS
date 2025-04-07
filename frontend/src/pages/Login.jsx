import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("patient"); // Toggle state

  const { setToken, setRole } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ email, password, userType }); // Pass userType if needed
      setToken(res.data.accessToken);
      setRole(res.data.role);
      localStorage.setItem("role", role);
      localStorage.setItem("user", JSON.stringify(user)); // includes _id
      
      if(userType==="patient") navigate("/patient")
     
      // navigate(`/${res.data.role}/profile`)
    } catch (err) {
      console.error("Login failed", err);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-96 text-center">
        <img
          src="/profile-icon.png"
          alt="Profile"
          className="w-32 h-32 rounded-full mx-auto mb-4 transition-transform duration-300 hover:scale-110"
        />

        {/* Toggle Button */}
        <div className="flex justify-center mb-6 space-x-4">
          <button
            type="button"
            className={`px-4 py-2 rounded-full font-semibold ${
              userType === "patient"
                ? "bg-teal-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setUserType("patient")}
          >
            Patient
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded-full font-semibold ${
              userType === "employee"
                ? "bg-teal-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setUserType("employee")}
          >
            Employee
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your Email Address"
            className="w-full p-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
            required
          />
         <div className="text-right text-sm italic text-teal-600 cursor-pointer hover:underline" onClick={() => navigate("/forgot-password")}>
            Forgot Password?
          </div>

          <button
            type="submit"
            className="w-full p-3 bg-teal-700 text-white rounded-lg text-lg hover:bg-teal-800"
          >
            LOGIN
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
