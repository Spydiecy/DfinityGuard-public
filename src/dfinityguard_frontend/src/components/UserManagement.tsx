import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dfinityguard_backend } from '../../../declarations/dfinityguard_backend';
import { User } from '../../../declarations/dfinityguard_backend/dfinityguard_backend.did';
import { 
  UserIcon, 
  EnvelopeIcon, 
  LockClosedIcon, 
  UserCircleIcon, 
  KeyIcon,
  UserPlusIcon,
  IdentificationIcon,
  AtSymbolIcon
} from '@heroicons/react/24/outline';

function UserManagement() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLogin, setIsLogin] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [loginData, setLoginData] = useState({
    usernameOrEmail: '',
    password: '',
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (isLogin) {
      setLoginData({ ...loginData, [name]: value });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await dfinityguard_backend.registerUser(
        formData.username,
        formData.firstName,
        formData.lastName,
        formData.email,
        formData.password
      );
      if ('ok' in result) {
        setMessage('User registered successfully');
        fetchUser(formData.username);
        localStorage.setItem('username', formData.username); // Store the username in localStorage
        navigate('/dashboard');
      } else {
        setMessage(`Error: ${result.err}`);
      }
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await dfinityguard_backend.login(loginData.usernameOrEmail, loginData.password);
      if ('ok' in result) {
        setUser(result.ok);
        setMessage('Logged in successfully');
        setLoginData({ usernameOrEmail: '', password: '' });
        localStorage.setItem('username', result.ok.username); // Store the username in localStorage
        navigate('/dashboard'); // Redirect to the dashboard
      } else {
        setMessage(`Error: ${result.err}`);
      }
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const fetchUser = async (username: string) => {
    try {
      const result = await dfinityguard_backend.getUser(username);
      if ('ok' in result) {
        setUser(result.ok);
      } else {
        setMessage('User not found');
      }
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setMessage('Logged out successfully');
    setFormData({ username: '', firstName: '', lastName: '', email: '', password: '' });
    setLoginData({ usernameOrEmail: '', password: '' });
    localStorage.removeItem('username');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-gray-900">
      <div className="bg-black bg-opacity-50 p-8 rounded-lg shadow-2xl w-full max-w-md backdrop-filter backdrop-blur-sm border border-gray-800">
        <div className="flex items-center justify-center mb-8">
          <KeyIcon className="h-12 w-12 text-yellow-500 mr-2" />
          <h1 className="text-4xl font-bold text-center text-yellow-500">DfinityGuard</h1>
        </div>
        {user ? (
          <div className="text-center text-white">
            <UserCircleIcon className="h-24 w-24 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-4">Welcome, {user.firstName}!</h2>
            <p className="mb-2 flex items-center justify-center">
              <UserIcon className="h-5 w-5 mr-2 text-yellow-500" />
              Username: {user.username}
            </p>
            <p className="mb-4 flex items-center justify-center">
              <EnvelopeIcon className="h-5 w-5 mr-2 text-yellow-500" />
              Email: {user.email}
            </p>
            <button
              onClick={handleLogout}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-full transition duration-300 transform hover:scale-105 flex items-center justify-center"
            >
              <LockClosedIcon className="h-5 w-5 mr-2" />
              Logout
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-6">
              <button
                onClick={() => setIsLogin(false)}
                className={`px-4 py-2 rounded-l-lg transition duration-300 ${!isLogin ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
              >
                Register
              </button>
              <button
                onClick={() => setIsLogin(true)}
                className={`px-4 py-2 rounded-r-lg transition duration-300 ${isLogin ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
              >
                Login
              </button>
            </div>
            {isLogin ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="relative mb-4">
                  <label htmlFor="usernameOrEmail" className="block text-sm font-medium text-gray-300 mb-1">Username or Email</label>
                  <div className="relative">
                    <AtSymbolIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      id="usernameOrEmail"
                      name="usernameOrEmail"
                      placeholder="Enter your username or email"
                      value={loginData.usernameOrEmail}
                      onChange={handleInputChange}
                      className="w-full p-3 pl-10 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      required
                    />
                  </div>
                </div>
                <div className="relative mb-4">
                  <label htmlFor="loginPassword" className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                  <div className="relative">
                    <LockClosedIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="password"
                      id="loginPassword"
                      name="password"
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={handleInputChange}
                      className="w-full p-3 pl-10 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-4 rounded-lg transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 flex items-center justify-center"
                >
                  <UserCircleIcon className="h-5 w-5 mr-2" />
                  Login
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="relative mb-4">
                  <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">Username</label>
                  <div className="relative">
                    <UserIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      id="username"
                      name="username"
                      placeholder="Choose a username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="w-full p-3 pl-10 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      required
                    />
                  </div>
                </div>
                <div className="relative mb-4">
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-1">First Name</label>
                  <div className="relative">
                    <IdentificationIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      placeholder="Enter your first name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full p-3 pl-10 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      required
                    />
                  </div>
                </div>
                <div className="relative mb-4">
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-1">Last Name</label>
                  <div className="relative">
                    <IdentificationIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      placeholder="Enter your last name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full p-3 pl-10 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      required
                    />
                  </div>
                </div>
                <div className="relative mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                  <div className="relative">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full p-3 pl-10 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      required
                    />
                  </div>
                </div>
                <div className="relative mb-4">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                  <div className="relative">
                    <LockClosedIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="password"
                      id="password"
                      name="password"
                      placeholder="Choose a strong password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full p-3 pl-10 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-4 rounded-lg transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 flex items-center justify-center"
                >
                  <UserPlusIcon className="h-5 w-5 mr-2" />
                  Register
                </button>
              </form>
            )}
          </>
        )}
        {message && (
          <p className="mt-4 text-center text-sm text-yellow-300 bg-yellow-900 bg-opacity-50 p-2 rounded">{message}</p>
        )}
      </div>
    </div>
  );
}

export default UserManagement;