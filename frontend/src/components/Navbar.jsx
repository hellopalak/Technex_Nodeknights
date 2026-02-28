import React from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";

export default function Navbar({ user, logout }) {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-logo">
          <span className="logo-icon">♻️</span> WasteWise
        </Link>

        <ul className="nav-menu">
          <li>
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
          </li>
          <li>
            <Link to="/analyze" className="nav-link">Analyze</Link>
          </li>
          <li>
            <Link to="/records" className="nav-link">Records</Link>
          </li>
          <li>
            <Link to="/chatbot" className="nav-link">Chatbot</Link>
          </li>
        </ul>

        <div className="nav-user">
          {user && <span className="user-name">{user.name}</span>}
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </div>
    </nav>
  );
}
