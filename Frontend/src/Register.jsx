import React, { useState } from "react";
import { useAuth } from "./AuthContext";
import { User, Mail, Lock } from "lucide-react";

const Register = () => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const response = await register(formData);
    if (response.success) {
      setSuccess("Registration successful!");
    } else {
      setError(response.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-500 via-blue-500 to-cyan-400 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl">
        <h2 className="text-3xl font-bold text-white text-center mb-8">
          Join the Adventure
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center">
              <User className="h-5 w-5 text-white/70" />
            </div>
            <input
              type="text"
              name="username"
              placeholder="Username"
              onChange={handleChange}
              required
              className="w-full bg-white/10 border-0 text-white placeholder-white/70 px-12 py-4 rounded-xl focus:ring-2 focus:ring-white/50 focus:bg-white/20 transition-all duration-300"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center">
              <Mail className="h-5 w-5 text-white/70" />
            </div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              onChange={handleChange}
              required
              className="w-full bg-white/10 border-0 text-white placeholder-white/70 px-12 py-4 rounded-xl focus:ring-2 focus:ring-white/50 focus:bg-white/20 transition-all duration-300"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center">
              <Lock className="h-5 w-5 text-white/70" />
            </div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleChange}
              required
              className="w-full bg-white/10 border-0 text-white placeholder-white/70 px-12 py-4 rounded-xl focus:ring-2 focus:ring-white/50 focus:bg-white/20 transition-all duration-300"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-4 rounded-xl transition-all duration-300"
          >
            Create Account
          </button>
        </form>

        {success && (
          <div className="mt-4 p-4 rounded-xl bg-green-500/20 backdrop-blur-sm">
            <p className="text-white text-center">{success}</p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 rounded-xl bg-red-500/20 backdrop-blur-sm">
            <p className="text-white text-center">{error}</p>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-white/90">
            Already have an account?{" "}
            <a href="/login" className="text-white font-semibold">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;