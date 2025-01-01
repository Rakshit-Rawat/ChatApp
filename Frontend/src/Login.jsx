import React, { useState } from "react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const response = await login(formData);
    if (response.success) {
      navigate("/chat");
    } else {
      setError(response.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-500 via-blue-500 to-cyan-400 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl">
        <h2 className="text-3xl font-bold text-white text-center mb-8">Welcome Back</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField 
            type="email" 
            name="email" 
            placeholder="Email" 
            icon={<Mail className="h-5 w-5 text-white/70" />} 
            onChange={handleChange} 
            required 
          />

          <InputField 
            type="password" 
            name="password" 
            placeholder="Password" 
            icon={<Lock className="h-5 w-5 text-white/70" />} 
            onChange={handleChange} 
            required 
          />

          <div className="flex items-center justify-between text-sm mt-2">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-0 bg-white/10 text-violet-500 focus:ring-violet-500"
              />
              <label htmlFor="remember-me" className="ml-2 text-white/90">
                Remember me
              </label>
            </div>
            <a href="#" className="text-white hover:text-white/80">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-4 rounded-xl transition-all duration-300"
          >
            Sign in
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 rounded-xl bg-red-500/20 backdrop-blur-sm">
            <p className="text-white text-center">{error}</p>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-white/90">
            Don't have an account?{" "}
            <a href="/register" className="text-white font-semibold">
              Create account
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

const InputField = ({ type, name, placeholder, icon, onChange, required }) => (
  <div className="relative">
    <div className="absolute inset-y-0 left-4 flex items-center">
      {icon}
    </div>
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      onChange={onChange}
      required={required}
      className="w-full bg-white/10 border-0 text-white placeholder-white/70 px-12 py-4 rounded-xl focus:ring-2 focus:ring-white/50 focus:bg-white/20 transition-all duration-300"
    />
  </div>
);

export default Login;

