import { useState } from "react";
import { AlertCircle, CheckCircle2, Lock, Mail, User } from "lucide-react";
import { Link } from "react-router";

import { Alert, AlertDescription } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useRegister } from "../stores/authStore";

const Register = () => {
  const register = useRegister();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const response = await register(formData);

      if (response.success) {
        setSuccess("Registration successful. You can sign in now.");
        setFormData({ username: "", email: "", password: "" });
      } else {
        setError(response.message || "Registration failed. Please try again.");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="fixed inset-0 overflow-hidden z-0">
        <div className="absolute inset-0 bg-zinc-900" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 10px 10px, rgba(100, 100, 100, 0.5) 1px, transparent 0)",
            backgroundSize: "30px 30px",
            backgroundPosition: "0 0",
            transform: "rotate(30deg) scale(1.5)",
            opacity: 0.7,
            animation: "moveBackground 120s linear infinite",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15px 15px, rgba(120, 120, 120, 0.3) 1px, transparent 0)",
            backgroundSize: "40px 40px",
            backgroundPosition: "10px 10px",
            transform: "rotate(60deg) scale(1.3)",
            opacity: 0.5,
            animation: "moveBackground 180s linear infinite reverse",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at center, rgba(30, 30, 30, 0) 0%, rgba(10, 10, 10, 0.8) 100%)",
          }}
        />
      </div>

      <Card className="w-full max-w-md bg-white shadow-xl border-0 rounded-lg overflow-hidden z-10">
        <CardHeader className="pb-6 pt-8 border-b border-gray-200">
          <CardTitle className="text-2xl font-semibold text-center text-gray-900">
            Create Account
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          {success && (
            <Alert className="mt-5 bg-green-50 border-green-100 text-green-800">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="mt-5 bg-red-50 border-red-100 text-red-800">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>

        <CardFooter className="flex justify-center py-6 border-t border-gray-100 text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="ml-1 text-blue-600 font-medium hover:text-blue-800"
          >
            Sign in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;
