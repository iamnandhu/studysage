import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import axios from 'axios';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import StudyMaterials from './pages/StudyMaterials';
import ExamPrep from './pages/ExamPrep';
import QA from './pages/QA';
import ReadingMode from './pages/ReadingMode';
import Subscription from './pages/Subscription';
import '@/App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Set up axios defaults
axios.defaults.baseURL = API;

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          const response = await axios.get('/auth/me');
          setUser(response.data);
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
      window.history.replaceState({}, document.title, '/dashboard');
    } catch (error) {
      console.error('Google auth failed:', error);
    }
  };

  const handleLogin = (token, userData) => {
    localStorage.setItem('access_token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
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
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route
            path="/"
            element={
              user ? <Navigate to="/dashboard" /> : <Landing onLogin={handleLogin} />
            }
          />
          <Route
            path="/dashboard"
            element={
              user ? (
                <Dashboard user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/documents"
            element={
              user ? <Documents user={user} onLogout={handleLogout} /> : <Navigate to="/" />
            }
          />
          <Route
            path="/study-materials"
            element={
              user ? <StudyMaterials user={user} onLogout={handleLogout} /> : <Navigate to="/" />
            }
          />
          <Route
            path="/exam-prep"
            element={
              user ? <ExamPrep user={user} onLogout={handleLogout} /> : <Navigate to="/" />
            }
          />
          <Route
            path="/qa"
            element={
              user ? <QA user={user} onLogout={handleLogout} /> : <Navigate to="/" />
            }
          />
          <Route
            path="/reading/:documentId"
            element={
              user ? <ReadingMode user={user} onLogout={handleLogout} /> : <Navigate to="/" />
            }
          />
          <Route
            path="/subscription"
            element={
              user ? <Subscription user={user} onLogout={handleLogout} /> : <Navigate to="/" />
            }
          />
        </Routes>
        <Toaster position="top-right" />
      </div>
    </BrowserRouter>
  );
}

export default App;