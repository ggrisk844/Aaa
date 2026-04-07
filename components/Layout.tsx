
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sun, Moon, Phone, GraduationCap, MessageCircle, LogOut, CheckCircle, AlertCircle, Info, XCircle } from 'lucide-react';
import { db } from '../services/db';
import { CallSystem } from './CallSystem';
import { User, SchoolInfo } from '../types';

// --- Toast System ---
export const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    window.dispatchEvent(new CustomEvent('app-toast', { detail: { message, type } }));
};

const ToastContainer = () => {
    const [toasts, setToasts] = useState<{id: number, message: string, type: string}[]>([]);

    useEffect(() => {
        const handleToast = (e: any) => {
            const id = Date.now();
            setToasts(prev => [...prev, { id, message: e.detail.message, type: e.detail.type }]);
            setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
        };
        window.addEventListener('app-toast', handleToast);
        return () => window.removeEventListener('app-toast', handleToast);
    }, []);

    return (
        <div className="fixed top-24 right-4 md:right-6 z-[100] flex flex-col gap-3 pointer-events-none max-w-[90vw] md:max-w-md">
            <AnimatePresence>
                {toasts.map(t => (
                    <motion.div
                        key={t.id}
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 50, scale: 0.9 }}
                        className={`pointer-events-auto flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border backdrop-blur-md min-w-[280px] ${
                            t.type === 'success' ? 'bg-white/90 dark:bg-gray-800/90 border-green-500/50 text-green-700 dark:text-green-400' :
                            t.type === 'error' ? 'bg-white/90 dark:bg-gray-800/90 border-red-500/50 text-red-700 dark:text-red-400' :
                            'bg-white/90 dark:bg-gray-800/90 border-blue-500/50 text-blue-700 dark:text-blue-400'
                        }`}
                    >
                        {t.type === 'success' && <CheckCircle size={20} className="shrink-0" />}
                        {t.type === 'error' && <XCircle size={20} className="shrink-0" />}
                        {t.type === 'info' && <Info size={20} className="shrink-0" />}
                        <p className="font-bold text-sm">{t.message}</p>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

// --- Navbar & Layout ---

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) setIsDark(true);
    const fetchUser = async () => {
        const currentUser = await db.getCurrentUser();
        setUser(currentUser);
    };
    fetchUser();
  }, [location]);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  };

  const handleLogout = async () => {
      await db.logout();
      setUser(null);
      showToast('Logged out successfully', 'info');
      navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Teachers', path: '/teachers' },
    { name: 'Staff', path: '/staff' },
    { name: 'Students', path: '/students' },
    { name: 'Events', path: '/events' },
    { name: 'Results', path: '/results' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Notice', path: '/notice' },
    { name: 'Contact', path: '/contact' },
  ];

  const navbarClasses = `fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-300 rounded-full top-4 w-[95%] max-w-7xl ${
    isScrolled 
      ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-lg border border-white/20 dark:border-gray-700 py-2 px-6' 
      : 'bg-white/30 dark:bg-black/30 backdrop-blur-sm border border-white/10 dark:border-white/5 py-3 px-6 shadow-sm'
  }`;

  const textColor = isScrolled 
    ? 'text-gray-800 dark:text-gray-100' 
    : 'text-gray-900 dark:text-white';

  return (
    <nav className={navbarClasses}>
      <div className="flex justify-between items-center h-full">
        <Link to="/" className="flex items-center space-x-2 group">
            <div className="relative transform transition-transform group-hover:scale-110 duration-300">
                <div className="absolute inset-0 bg-primary-500 blur-lg opacity-50 rounded-full group-hover:opacity-75 transition"></div>
                <GraduationCap className="w-10 h-10 text-primary-600 dark:text-primary-400 relative z-10" />
            </div>
            <span className={`text-xl font-display font-bold transition-colors ${textColor}`}>
                AGTSC
            </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`font-medium transition link-3d ${textColor} hover:text-primary-600 dark:hover:text-primary-400`}
            >
              {link.name}
            </Link>
          ))}
          <button 
            onClick={toggleTheme}
            className={`p-2 rounded-full transition hover:scale-110 ${
                isScrolled ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200' : 'bg-white/20 text-gray-900 dark:text-white'
            }`}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          {user ? (
              <div className="flex items-center gap-3">
                  <Link to="/chat" className="btn-3d p-2 rounded-full bg-violet-600 text-white hover:bg-violet-700" title="Chat">
                      <MessageCircle size={20} />
                  </Link>
                  {user.role === 'admin' && (
                      <Link to="/admin/dashboard" className="btn-3d px-4 py-2 rounded-full bg-gray-800 text-white text-sm font-bold">
                          Dashboard
                      </Link>
                  )}
                  <button onClick={handleLogout} className="text-gray-500 hover:text-red-500 transition" title="Logout">
                      <LogOut size={20} />
                  </button>
              </div>
          ) : (
              <Link to="/login" className="btn-3d px-6 py-2 rounded-full bg-gradient-to-r from-primary-600 to-emerald-600 text-white font-semibold shadow-lg shadow-emerald-500/30">
                Login
              </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden flex items-center space-x-4">
             <button onClick={toggleTheme} className={`text-current transition hover:rotate-90 duration-500 ${textColor}`}>
                 {isDark ? <Sun size={20} /> : <Moon size={20} />}
             </button>
            <button onClick={() => setIsOpen(!isOpen)} className={`transition hover:scale-110 ${textColor}`}>
                {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-full left-0 mt-4 w-full bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 lg:hidden flex flex-col p-6 space-y-4 overflow-hidden z-50"
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="text-lg font-medium text-gray-800 dark:text-gray-200 hover:text-primary-600 hover:pl-2 transition-all border-b border-gray-100 dark:border-gray-800 pb-2 last:border-0"
              >
                {link.name}
              </Link>
            ))}
             {user ? (
                 <div className="flex flex-col gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                     <Link to="/chat" onClick={() => setIsOpen(false)} className="btn-3d text-center block w-full py-3 rounded-xl bg-violet-600 text-white font-bold flex items-center justify-center gap-2">
                         <MessageCircle /> Chat Room
                     </Link>
                     {user.role === 'admin' && (
                         <Link to="/admin/dashboard" onClick={() => setIsOpen(false)} className="btn-3d text-center block w-full py-3 rounded-xl bg-gray-800 text-white font-bold">
                             Admin Dashboard
                         </Link>
                     )}
                     <button onClick={() => { handleLogout(); setIsOpen(false); }} className="text-center text-red-500 font-bold py-2">Logout</button>
                 </div>
             ) : (
                 <Link to="/login" onClick={() => setIsOpen(false)} className="btn-3d text-center block w-full py-3 rounded-xl bg-gradient-to-r from-primary-600 to-emerald-600 text-white font-bold">
                    Login / Sign Up
                 </Link>
             )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Footer = () => {
  const [info, setInfo] = useState<SchoolInfo | null>(null);

  useEffect(() => {
    const fetchInfo = async () => {
      const fetchedInfo = await db.getInfo();
      setInfo(fetchedInfo);
    };
    fetchInfo();
  }, []);

  if (!info) return null;
  
  return (
    <footer className="bg-gray-900 text-white pt-20 pb-10 relative overflow-hidden mt-12">
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary-600/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary-600/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <h3 className="text-3xl font-display font-bold text-white tracking-tight">{info.name}</h3>
            <p className="text-gray-400 leading-relaxed">Empowering the next generation with technical skills and ethical values.</p>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-6 text-primary-400">Quick Links</h4>
            <ul className="space-y-3 text-gray-400">
              <li><Link to="/about" className="hover:text-white transition hover:pl-1 block">About Us</Link></li>
              <li><Link to="/teachers" className="hover:text-white transition hover:pl-1 block">Teachers</Link></li>
              <li><Link to="/notice" className="hover:text-white transition hover:pl-1 block">Notices</Link></li>
              <li><Link to="/contact" className="hover:text-white transition hover:pl-1 block">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6 text-primary-400">Contact</h4>
            <ul className="space-y-4 text-gray-400">
              <li className="flex items-start space-x-3 group cursor-default">
                 <span className="group-hover:scale-125 transition">📍</span> <span className="group-hover:text-gray-200 transition">{info.address}</span>
              </li>
              <li className="flex items-center space-x-3 group cursor-default">
                <Phone size={16} className="group-hover:scale-125 transition" /> <span className="group-hover:text-gray-200 transition">{info.phone}</span>
              </li>
              <li className="flex items-center space-x-3 group cursor-default">
                <span className="group-hover:scale-125 transition">✉️</span> <span className="group-hover:text-gray-200 transition">{info.email}</span>
              </li>
            </ul>
          </div>

          <div>
             <h4 className="text-lg font-bold mb-6 text-primary-400">Location</h4>
             <div className="w-full h-40 bg-gray-800 rounded-2xl overflow-hidden shadow-lg border border-gray-700 hover:border-primary-500 transition-colors duration-300 card-3d">
                 {info.mapEmbedUrl ? (
                     <iframe 
                        src={info.mapEmbedUrl || undefined} 
                        width="100%" 
                        height="100%" 
                        style={{border:0}} 
                        allowFullScreen 
                        loading="lazy" 
                        className="opacity-70 hover:opacity-100 transition duration-500"
                     />
                 ) : (
                     <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">Map not available</div>
                 )}
             </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-16 pt-8 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} {info.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Update heartbeat periodically to stay "online"
  useEffect(() => {
    db.updateHeartbeat();
    const interval = setInterval(() => db.updateHeartbeat(), 30000); // Every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300 flex flex-col">
      <ToastContainer />
      <CallSystem /> {/* Global Call Manager */}
      <Navbar />
      <main className="flex-grow relative z-0">
        {children}
        <div className="back-glow z-0 top-0 left-0 fixed">
           <div className="glow-blob bg-blue-500/20 w-96 h-96 top-20 left-20 animate-float"></div>
           <div className="glow-blob bg-purple-500/20 w-80 h-80 bottom-20 right-20 animate-float" style={{animationDelay: '2s'}}></div>
           <div className="glow-blob bg-green-500/20 w-72 h-72 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-float" style={{animationDelay: '4s'}}></div>
        </div>
      </main>
      <a 
        href="https://wa.me/8801329328125" 
        target="_blank" 
        rel="noreferrer"
        className="fixed bottom-8 right-8 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition btn-3d flex items-center justify-center border-2 border-white dark:border-gray-800"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
      </a>
      <Footer />
    </div>
  );
};