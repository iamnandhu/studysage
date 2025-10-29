import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { ThemeProvider } from './context/ThemeContext';
import axios from 'axios';
import Landing from './pages/Landing';
import Home from './pages/Home';
import SessionView from './pages/SessionView';
import Sidebar from './components/layout/Sidebar';
import UserMenu from './components/layout/UserMenu';
import AgeOnboarding from './components/AgeOnboarding';
import '@/App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

axios.defaults.baseURL = API;

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAgeOnboarding, setShowAgeOnboarding] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          const response = await axios.get('/auth/me');
          setUser(response.data);
          
          // Check if age is set
          if (!response.data.age) {
            setShowAgeOnboarding(true);
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('access_token');
        }
      }
      setLoading(false);
    };

    checkAuth();

    // Check for session_id in URL fragment (Google OAuth callback)
    const hash = window.location.hash;
    if (hash && hash.includes('session_id=')) {
      const sessionId = hash.split('session_id=')[1].split('&')[0];
      handleGoogleCallback(sessionId);
    }
  }, []);

  const handleGoogleCallback = async (sessionId) => {
    try {
      const response = await axios.post('/auth/google/callback', { session_id: sessionId });
      localStorage.setItem('access_token', response.data.access_token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
      setUser(response.data.user);
      
      // Check age
      if (!response.data.user.age) {
        setShowAgeOnboarding(true);
      }
      
      window.history.replaceState({}, document.title, '/home');
    } catch (error) {
      console.error('Google auth failed:', error);
    }
  };

  const handleLogin = (token, userData) => {
    localStorage.setItem('access_token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
    
    // Check age
    if (!userData.age) {
      setShowAgeOnboarding(true);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('access_token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    // Clear any query params and navigate to root
    window.location.href = '/';
  };

  const handleAgeComplete = async () => {
    // Refresh user data
    try {
      const response = await axios.get('/auth/me');
      setUser(response.data);
      setShowAgeOnboarding(false);
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="App min-h-screen bg-background text-foreground flex">
          {user && <Sidebar user={user} onLogout={handleLogout} />}
          
          <main className="flex-1 min-h-screen">
            <Routes>
              <Route
                path="/"
                element={
                  user ? <Navigate to="/home" /> : <Landing onLogin={handleLogin} />
                }
              />
              <Route
                path="/home"
                element={
                  user ? <Home /> : <Navigate to="/" />
                }
              />
              <Route
                path="/session/:sessionId"
                element={
                  user ? <SessionView /> : <Navigate to="/" />
                }
              />
            </Routes>
          </main>

          <Toaster position="top-right" />
          
          {user && showAgeOnboarding && (
            <AgeOnboarding open={showAgeOnboarding} onComplete={handleAgeComplete} />
          )}
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;