
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '../services/db';
import { Lock, User, ArrowLeft, LogIn, UserPlus, ShieldCheck, ShieldAlert, KeyRound } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isAdminMode) {
        // Strict Admin Login Logic (Redirects to Dashboard)
        const user = db.login(username, password);
        if (user) {
            if (user.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                setError('Access Denied: This panel is for Administrators only.');
                db.logout(); // Invalid session for this panel
            }
        } else {
            setError('Invalid administrator credentials');
        }
    } else {
        // Standard User Login / Signup (Redirects to Chat, even for Admin)
        if (isLogin) {
            const user = db.login(username, password);
            if (user) {
                // IMPORTANT: If logging in via the normal panel, go to CHAT, 
                // even if the user is an admin.
                navigate('/chat');
            } else {
                setError('Invalid username or password');
            }
        } else {
            if (username.length < 3 || password.length < 3) {
                setError('Username and password must be at least 3 characters');
                return;
            }
            if (db.signup(username, password)) {
                navigate('/chat'); // New users go to chat
            } else {
                setError('Username already taken');
            }
        }
    }
  };

  const toggleAdminMode = () => {
      const newMode = !isAdminMode;
      setIsAdminMode(newMode);
      setIsLogin(true); // Admin is always login mode
      setUsername('');
      setPassword('');
      setError('');
  };

  return (
    <div className={`min-h-screen flex items-center justify-center relative overflow-hidden transition-colors duration-500 ${isAdminMode ? 'bg-slate-900' : 'bg-gray-100 dark:bg-gray-900'}`}>
        {/* Back Button */}
        <Link to="/" className={`btn-3d absolute top-6 left-6 z-50 flex items-center gap-2 transition font-bold px-6 py-3 rounded-full shadow-lg border ${isAdminMode ? 'bg-slate-800 text-white border-slate-700 hover:bg-slate-700' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-100 dark:border-gray-700'}`}>
            <ArrowLeft size={20} /> Back to Home
        </Link>
        
        {/* Admin Switcher Icon */}
        <button 
            onClick={toggleAdminMode}
            className={`btn-3d absolute top-6 right-6 z-50 p-3 rounded-full shadow-lg transition border flex items-center gap-2 font-bold ${
                isAdminMode 
                ? 'bg-indigo-600 text-white border-indigo-500 hover:bg-indigo-500 pr-5' 
                : 'bg-white dark:bg-gray-800 text-gray-400 hover:text-slate-600 border-gray-100 dark:border-gray-700'
            }`}
            title={isAdminMode ? "Switch to User Login" : "Switch to Admin Login"}
        >
            {isAdminMode ? <User size={20} /> : <ShieldCheck size={20} />}
            {isAdminMode && <span className="text-sm">User Login</span>}
        </button>

        {/* Animated Background */}
        <div className="absolute inset-0 pointer-events-none">
             <motion.div 
                animate={{ rotate: 360, scale: isAdminMode ? 1.2 : 1 }}
                transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                className={`absolute -top-1/2 -left-1/2 w-full h-full rounded-full blur-3xl opacity-20 transition-colors duration-500 ${isAdminMode ? 'bg-gradient-to-br from-slate-600 to-red-900' : 'bg-gradient-to-br from-indigo-500 to-transparent'}`}
             />
             <motion.div 
                animate={{ rotate: -360, scale: isAdminMode ? 1.1 : 1 }}
                transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                className={`absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full blur-3xl opacity-20 transition-colors duration-500 ${isAdminMode ? 'bg-gradient-to-tl from-slate-800 to-indigo-900' : 'bg-gradient-to-tl from-violet-500 to-transparent'}`}
             />
        </div>

      <motion.div 
        key={isAdminMode ? 'admin' : (isLogin ? 'login' : 'signup')}
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3 }}
        className={`card-3d backdrop-blur-xl p-10 rounded-3xl shadow-2xl w-full max-w-md relative z-10 border transition-all duration-500 ${
            isAdminMode 
            ? 'bg-slate-800/90 border-slate-600 shadow-slate-900/50' 
            : 'bg-white/80 dark:bg-gray-800/80 border-white/40 dark:border-gray-700'
        }`}
      >
        <div className="text-center mb-8">
            <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg icon-3d transition-colors duration-300 ${isAdminMode ? 'bg-slate-700 text-red-500' : 'bg-indigo-50 dark:bg-gray-700 text-indigo-600'}`}>
                {isAdminMode ? <ShieldAlert size={32} /> : (isLogin ? <Lock size={32} /> : <UserPlus size={32} />)}
            </div>
            <h2 className={`text-3xl font-display font-bold tracking-tight transition-colors ${isAdminMode ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                {isAdminMode ? 'Administrator Access' : (isLogin ? 'Welcome Back' : 'Create Account')}
            </h2>
            <p className={`mt-2 transition-colors ${isAdminMode ? 'text-slate-400' : 'text-gray-500 dark:text-gray-400'}`}>
                {isAdminMode ? 'Secure login for school management' : (isLogin ? 'Login to continue to the portal' : 'Join our community today')}
            </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
              <div className={`p-4 rounded-xl text-sm text-center font-bold animate-pulse border ${isAdminMode ? 'bg-red-900/20 text-red-400 border-red-900/30' : 'bg-red-100 text-red-600 border-red-200'}`}>
                  {error}
              </div>
          )}
          
          <div>
            <label className={`block text-sm font-bold mb-2 ml-1 transition-colors ${isAdminMode ? 'text-slate-300' : 'text-gray-700 dark:text-gray-300'}`}>Username</label>
            <div className="relative">
              <User className={`absolute left-4 top-4 transition-colors ${isAdminMode ? 'text-slate-500' : 'text-gray-400'}`} size={20} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className={`w-full pl-12 pr-4 py-3.5 rounded-xl border focus:ring-4 outline-none transition shadow-inner ${
                    isAdminMode 
                    ? 'bg-slate-900/50 border-slate-600 text-white focus:ring-slate-500/30 focus:border-slate-500 placeholder-slate-600' 
                    : 'bg-white dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 dark:text-white focus:ring-indigo-500/20 focus:border-indigo-500'
                }`}
                placeholder="Enter username"
              />
            </div>
          </div>
          
          <div>
            <label className={`block text-sm font-bold mb-2 ml-1 transition-colors ${isAdminMode ? 'text-slate-300' : 'text-gray-700 dark:text-gray-300'}`}>Password</label>
            <div className="relative">
              <KeyRound className={`absolute left-4 top-4 transition-colors ${isAdminMode ? 'text-slate-500' : 'text-gray-400'}`} size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`w-full pl-12 pr-4 py-3.5 rounded-xl border focus:ring-4 outline-none transition shadow-inner ${
                    isAdminMode 
                    ? 'bg-slate-900/50 border-slate-600 text-white focus:ring-slate-500/30 focus:border-slate-500 placeholder-slate-600' 
                    : 'bg-white dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 dark:text-white focus:ring-indigo-500/20 focus:border-indigo-500'
                }`}
                placeholder="Enter password"
              />
            </div>
          </div>
          
          <button
            type="submit"
            className={`btn-3d w-full py-4 rounded-xl font-bold text-lg shadow-xl text-white flex items-center justify-center gap-2 mt-4 transition ${
                isAdminMode 
                ? 'bg-gradient-to-r from-slate-600 to-slate-800 hover:from-slate-500 hover:to-slate-700 hover:shadow-slate-900/50 border border-slate-500/30'
                : (isLogin ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:shadow-indigo-500/30' : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-emerald-500/30')
            }`}
          >
            {isAdminMode ? <><ShieldCheck size={20}/> Admin Login</> : (isLogin ? <><LogIn size={20}/> Login</> : <><UserPlus size={20}/> Sign Up</>)}
          </button>
        </form>

        {!isAdminMode && (
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
        )}
        
        {isAdminMode && (
            <div className="mt-8 text-center border-t border-slate-700 pt-6">
                <p className="text-slate-500 text-sm">
                    Protected area. Unauthorized access is prohibited.
                </p>
            </div>
        )}
      </motion.div>
    </div>
  );
};
