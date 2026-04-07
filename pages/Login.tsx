
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '../services/db';
import { Lock, User, ArrowLeft, LogIn, UserPlus, KeyRound } from 'lucide-react';
import { motion } from 'framer-motion';

export const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
        const user = await db.login(username, password);
        if (user) {
            if (user.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/chat');
            }
        } else {
            setError('Invalid username or password');
        }
    } else {
        if (username.length < 3 || password.length < 3) {
            setError('Username and password must be at least 3 characters');
            return;
        }
        const success = await db.signup(username, password);
        if (success) {
            navigate('/chat'); // New users go to chat
        } else {
            setError('Signup failed. Username might be taken.');
        }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden transition-colors duration-500 bg-gray-100 dark:bg-gray-900">
        {/* Back Button */}
        <Link to="/" className="btn-3d absolute top-6 left-6 z-50 flex items-center gap-2 transition font-bold px-6 py-3 rounded-full shadow-lg border bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-100 dark:border-gray-700">
            <ArrowLeft size={20} /> Back to Home
        </Link>
        
        {/* Animated Background */}
        <div className="absolute inset-0 pointer-events-none">
             <motion.div 
                animate={{ rotate: 360, scale: 1 }}
                transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full blur-3xl opacity-20 transition-colors duration-500 bg-gradient-to-br from-indigo-500 to-transparent"
             />
             <motion.div 
                animate={{ rotate: -360, scale: 1 }}
                transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                className="absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full blur-3xl opacity-20 transition-colors duration-500 bg-gradient-to-tl from-violet-500 to-transparent"
             />
        </div>

      <motion.div 
        key={isLogin ? 'login' : 'signup'}
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="card-3d backdrop-blur-xl p-10 rounded-3xl shadow-2xl w-full max-w-md relative z-10 border transition-all duration-500 bg-white/80 dark:bg-gray-800/80 border-white/40 dark:border-gray-700"
      >
        <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg icon-3d transition-colors duration-300 bg-indigo-50 dark:bg-gray-700 text-indigo-600">
                {isLogin ? <Lock size={32} /> : <UserPlus size={32} />}
            </div>
            <h2 className="text-3xl font-display font-bold tracking-tight transition-colors text-gray-900 dark:text-white">
                {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="mt-2 transition-colors text-gray-500 dark:text-gray-400">
                {isLogin ? 'Login to continue to the portal' : 'Join our community today'}
            </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
              <div className="p-4 rounded-xl text-sm text-center font-bold animate-pulse border bg-red-100 text-red-600 border-red-200">
                  {error}
              </div>
          )}
          
          <div>
            <label className="block text-sm font-bold mb-2 ml-1 transition-colors text-gray-700 dark:text-gray-300">Username</label>
            <div className="relative">
              <User className="absolute left-4 top-4 transition-colors text-gray-400" size={20} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border focus:ring-4 outline-none transition shadow-inner bg-white dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 dark:text-white focus:ring-indigo-500/20 focus:border-indigo-500"
                placeholder="Enter username"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold mb-2 ml-1 transition-colors text-gray-700 dark:text-gray-300">Password</label>
            <div className="relative">
              <KeyRound className="absolute left-4 top-4 transition-colors text-gray-400" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border focus:ring-4 outline-none transition shadow-inner bg-white dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 dark:text-white focus:ring-indigo-500/20 focus:border-indigo-500"
                placeholder="Enter password"
              />
            </div>
          </div>
          
          <button
            type="submit"
            className={`btn-3d w-full py-4 rounded-xl font-bold text-lg shadow-xl text-white flex items-center justify-center gap-2 mt-4 transition ${
                isLogin ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:shadow-indigo-500/30' : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-emerald-500/30'
            }`}
          >
            {isLogin ? <><LogIn size={20}/> Login</> : <><UserPlus size={20}/> Sign Up</>}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-gray-200 dark:border-gray-700 pt-6">
            <p className="text-gray-600 dark:text-gray-400">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button 
                    onClick={() => { setIsLogin(!isLogin); setError(''); }} 
                    className="ml-2 font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                    {isLogin ? 'Sign Up' : 'Login'}
                </button>
            </p>
        </div>
      </motion.div>
    </div>
  );
};
