
import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { About, Teachers, Staff, Students, Notices, Gallery, Contact, Events } from './pages/PublicPages';
import { Results } from './pages/Result';
import { Chat } from './pages/Chat';
import { db } from './services/db';
import { supabase } from './services/supabase';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const ProtectedRoute = ({ children, requireAdmin = false }: { children?: React.ReactNode, requireAdmin?: boolean }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const auth = await db.isAuthenticated();
      setIsAuthenticated(auth);
      if (auth) {
        const user = await db.getCurrentUser();
        setIsAdmin(user?.role === 'admin');
      }
    };
    checkAuth();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        setIsAuthenticated(!!session);
        if (session) {
          const user = await db.getCurrentUser();
          setIsAdmin(user?.role === 'admin');
        } else {
          setIsAdmin(false);
        }
    });
    
    return () => {
        authListener.subscription.unsubscribe();
    };
  }, []);

  if (isAuthenticated === null || (requireAdmin && isAdmin === null)) {
      return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const App = () => {
  useEffect(() => {
    db.init(); // Initialize LocalStorage Data
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Public Routes Wrapped in Layout */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/about" element={<Layout><About /></Layout>} />
        <Route path="/teachers" element={<Layout><Teachers /></Layout>} />
        <Route path="/staff" element={<Layout><Staff /></Layout>} />
        <Route path="/students" element={<Layout><Students /></Layout>} />
        <Route path="/events" element={<Layout><Events /></Layout>} />
        <Route path="/notice" element={<Layout><Notices /></Layout>} />
        <Route path="/gallery" element={<Layout><Gallery /></Layout>} />
        <Route path="/contact" element={<Layout><Contact /></Layout>} />
        <Route path="/results" element={<Layout><Results /></Layout>} />
        
        {/* Chat (Protected for any logged in user) */}
        <Route path="/chat" element={
            <ProtectedRoute>
                <Layout><Chat /></Layout>
            </ProtectedRoute>
        } />
        
        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Admin Routes (Role check handled in dashboard or service usually, but simplified here) */}
        <Route path="/admin/*" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* Catch-all redirect to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
