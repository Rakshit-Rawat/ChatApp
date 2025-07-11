import React, { useState } from 'react';
import { useLogin } from '@/stores/authStore';
import { Mail, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Label } from '../components/ui/label';
import { Link, useNavigate } from 'react-router-dom' 

const Login = () => {
  const login= useLogin();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate(); 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      const response = await login(formData);
      if (response.success) {
        setSuccess('Login successful!');
        setTimeout(() => {
          navigate('/chat');
        }, 1000); // Redirect after 1 sec
      } else {
        setError(response.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Background layers with CSS animations and gradients */}
      <div className="fixed inset-0 overflow-hidden z-0">
        {/* Base dark background */}
        <div className="absolute inset-0 bg-zinc-900"></div>

        {/* Animated dot grid layer 1 */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle at 10px 10px, rgba(100, 100, 100, 0.5) 1px, transparent 0)',
            backgroundSize: '30px 30px',
            backgroundPosition: '0 0',
            transform: 'rotate(30deg) scale(1.5)',
            opacity: 0.7,
            animation: 'moveBackground 120s linear infinite'
          }}
        />
        
        {/* Animated dot grid layer 2 */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle at 15px 15px, rgba(120, 120, 120, 0.3) 1px, transparent 0)',
            backgroundSize: '40px 40px',
            backgroundPosition: '10px 10px',
            transform: 'rotate(60deg) scale(1.3)',
            opacity: 0.5,
            animation: 'moveBackground 180s linear infinite reverse'
          }}
        />
        
        {/* Subtle gradient overlay */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at center, rgba(30, 30, 30, 0) 0%, rgba(10, 10, 10, 0.8) 100%)'
          }}
        />
      </div>
      <Card className="w-full max-w-md bg-white shadow-xl border-0 rounded-lg overflow-hidden z-10">
        <CardHeader className="pb-6 pt-8 border-b border-gray-200">
          <CardTitle className="text-2xl font-semibold text-center text-gray-900">
            Welcome Back
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email address"
                    onChange={handleChange}
                    required
                    className="pl-10 border-gray-200 rounded-md focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-800">
                  Password
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    onChange={handleChange}
                    required
                    className="pl-10 border-gray-200 rounded-md focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-md transition-colors"
              >
                {isLoading ? 'Logging in...' : 'Log In'}
              </Button>
            </div>
          </form>

          {/* Success Alert */}
          {success && (
            <div className="mt-5">
              <Alert className="bg-green-50 border border-green-100 text-green-800">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="mt-5">
              <Alert className="bg-red-50 border border-red-100 text-red-800">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-center py-6 border-t border-gray-100 text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="ml-1 text-blue-600 font-medium hover:text-blue-800 transition-colors">
            Create one
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
