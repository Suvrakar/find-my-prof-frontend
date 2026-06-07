import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="navbar bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="navbar-brand text-2xl font-bold text-blue-600">
          📚 Find My Professor
        </Link>
        <div className="nav-links flex gap-6 items-center">
          <Link to="/" className="text-gray-700 hover:text-blue-600">
            Home
          </Link>
          {user ? (
            <>
              <Link to="/dashboard" className="text-gray-700 hover:text-blue-600">
                Dashboard
              </Link>
              <span className="text-gray-600">{user.email}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
