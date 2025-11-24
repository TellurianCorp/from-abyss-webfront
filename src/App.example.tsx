import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/routing/ProtectedRoute';
import { LoginButton, UserProfile } from './components/auth';

// Example page components
const HomePage: React.FC = () => {
  return (
    <div>
      <h1>Welcome to From Abyss Media</h1>
      <p>Explore the depths of horror content...</p>
    </div>
  );
};

const DashboardPage: React.FC = () => {
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Your personalized horror content feed</p>
    </div>
  );
};

const ProfilePage: React.FC = () => {
  return (
    <div>
      <h1>Profile</h1>
      <UserProfile showLogout={true} />
    </div>
  );
};

// Header component with authentication
const Header: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <header className="app-header">
      <div className="app-header__logo">
        <h1>From Abyss Media</h1>
      </div>
      <nav className="app-header__nav">
        <a href="/">Home</a>
        {isAuthenticated && <a href="/dashboard">Dashboard</a>}
        {isAuthenticated && <a href="/profile">Profile</a>}
      </nav>
      <div className="app-header__auth">
        {isAuthenticated ? (
          <div className="app-header__user">
            {user?.picture && (
              <img src={user.picture} alt={user.name} className="avatar" />
            )}
            <span>{user?.name}</span>
          </div>
        ) : (
          <LoginButton />
        )}
      </div>
    </header>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Header />
          <main className="app-main">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
