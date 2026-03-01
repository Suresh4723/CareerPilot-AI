import { useEffect, useState } from 'react';
import { BrowserRouter, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import brandLogo from './assets/careerpilot-logo.svg';

import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Career from './pages/Career';
import Resume from './pages/Resume';
import Interview from './pages/Interview';
import Roadmap from './pages/Roadmap';
import Profile from './pages/Profile';
import Resources from './pages/Resources';
import Chatbot from './pages/Chatbot';

const NavBar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const authLinks = [
    { to: '/', label: 'Home' },
    { to: '/career', label: 'Career' },
    { to: '/resume', label: 'Resume' },
    { to: '/interview', label: 'Interview' },
    { to: '/roadmap', label: 'Roadmap' },
    { to: '/resources', label: 'Resources' },
    { to: '/chatbot', label: 'Chatbot' },
    { to: '/profile', label: 'Profile' }
  ];

  const guestLinks = [
    { to: '/login', label: 'Login' },
    { to: '/register', label: 'Register' }
  ];

  const links = user ? authLinks : guestLinks;

  return (
    <header className="topbar">
      <div className="topbar-inner navbar-shell">
        <NavLink to="/" className="brand navbar-brand">
          <img src={brandLogo} alt="CareerPilot AI logo" className="brand-logo" />
          <span>CareerPilot AI</span>
        </NavLink>

        <button
          className="nav-toggle"
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`nav-links navbar-links${menuOpen ? ' open' : ''}`}>
          {links.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}

          {user ? (
            <button className="button alt navbar-logout" onClick={logout}>
              Logout
            </button>
          ) : null}
        </nav>
      </div>
    </header>
  );
};

const AppRoutes = () => (
  <div className="app-shell">
    <NavBar />
    <main className="main-content">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/career"
          element={
            <ProtectedRoute>
              <Career />
            </ProtectedRoute>
          }
        />
        <Route
          path="/resume"
          element={
            <ProtectedRoute>
              <Resume />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interview"
          element={
            <ProtectedRoute>
              <Interview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/roadmap"
          element={
            <ProtectedRoute>
              <Roadmap />
            </ProtectedRoute>
          }
        />
        <Route
          path="/resources"
          element={
            <ProtectedRoute>
              <Resources />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chatbot"
          element={
            <ProtectedRoute>
              <Chatbot />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Routes>
    </main>
  </div>
);

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
