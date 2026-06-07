import React from 'react';
import './Navigation.css';

function Navigation() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <h1 className="navbar-brand">🎓 Find My Professor</h1>
        <ul className="navbar-menu">
          <li><a href="/">Home</a></li>
          <li><a href="/browse">Browse Professors</a></li>
          <li><a href="/matches">My Matches</a></li>
          <li><a href="/profile">Profile</a></li>
        </ul>
      </div>
    </nav>
  );
}

export default Navigation;
