import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const navStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@400;600;700&family=Rajdhani:wght@600;700&display=swap');

  .ww-nav {
    position: sticky; top: 0; z-index: 100;
    background: #0d3320;
    border-bottom: 1px solid rgba(255,255,255,0.08);
    box-shadow: 0 2px 16px rgba(0,0,0,0.4);
    font-family: 'Exo 2', sans-serif;
    overflow: visible;
  }

  /* Big leaf watermarks inside the navbar */
  .ww-nav-leaves {
    position: absolute; inset: 0;
    pointer-events: none; overflow: hidden;
  }
  .ww-nav-leaf {
    position: absolute;
    opacity: 0.07;
    line-height: 1;
    pointer-events: none;
  }

  .ww-nav-inner {
    position: relative; z-index: 2;
    max-width: 1200px; margin: 0 auto;
    display: flex; align-items: center;
    padding: 0 28px; height: 62px; gap: 0;
  }

  /* ── Logo ── */
  .ww-nav-logo {
    display: flex; align-items: center; gap: 10px;
    text-decoration: none; flex-shrink: 0;
    margin-right: 48px;
  }
  .ww-nav-logo-circle {
    
    
   
    font-size: 1.1rem;
    
    flex-shrink: 0;
  }
  .ww-nav-logo-name {
    font-family: 'Rajdhani', sans-serif;
    font-size: 1.6rem; font-weight: 700;
    color: #ffffff;
    letter-spacing: 0.3px;
  }

  /* ── Nav links ── */
  .ww-nav-links {
    display: flex; align-items: center; gap: 2px;
    list-style: none; flex: 1;
  }
  .ww-nav-links li a {
    display: block;
    padding: 8px 20px;
    color: rgba(255,255,255,0.75);
    text-decoration: none;
    font-size: 1.2rem; font-weight: 500;
    letter-spacing: 0.3px;
    border-radius: 6px;
    transition: color 0.18s, background 0.18s;
    white-space: nowrap;
  }
  .ww-nav-links li a:hover {
    color: #ffffff;
    background: rgba(255,255,255,0.07);
  }
  .ww-nav-links li a.active {
    color: #ffffff;
    background: rgba(255,255,255,0.09);
  }

  /* ── Right: username + logout ── */
  .ww-nav-right {
    display: flex; align-items: center; gap: 14px;
    flex-shrink: 0; margin-left: auto;
  }
  .ww-nav-username {
    font-size: 1.5rem;
    color: rgba(255,255,255,0.8);
    font-weight: 500;
    letter-spacing: 0.2px;
  }

  /* Green filled logout button */
  .ww-nav-logout {
    display: flex; align-items: center; gap: 7px;
    padding: 8px 18px;
    background: #22c55e;
    border: none; border-radius: 7px;
    color: rgb(255, 255, 255);
    font-family: 'Exo 2', sans-serif;
    font-size: 1.0rem; font-weight: 700;
    letter-spacing: 1.5px; text-transform: uppercase;
    cursor: pointer;
    box-shadow: 0 2px 12px rgba(34,197,94,0.4);
    transition: background 0.18s, box-shadow 0.18s, transform 0.1s;
    white-space: nowrap;
  }
  .ww-nav-logout:hover {
    background: #16a34a;
    box-shadow: 0 4px 18px rgba(34,197,94,0.5);
  }
  .ww-nav-logout:active { transform: scale(0.97); }
  .ww-nav-logout-icon {
    font-size: 1rem; line-height: 1;
  }

  /* ── Hamburger button — hidden on desktop ── */
  .ww-nav-hamburger {
    display: none;
    background: none;
    border: none;
    color: white;
    font-size: 1.6rem;
    cursor: pointer;
    padding: 4px 8px;
    margin-left: 12px;
    line-height: 1;
  }

  /* ── Mobile ── */
  @media (max-width: 768px) {
    .ww-nav-links {
      display: none;
    }
    .ww-nav-links.open {
      display: flex;
      flex-direction: column;
      position: absolute;
      top: 54px; left: 0; right: 0;
      background: #0d3320;
      padding: 8px 16px 16px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      box-shadow: 0 8px 20px rgba(0,0,0,0.3);
      gap: 4px;
      z-index: 99;
    }
    .ww-nav-links.open li a {
      font-size: 1rem;
      padding: 10px 14px;
      border-radius: 8px;
    }
    .ww-nav-inner {
      padding: 0 16px;
      height: 54px;
    }
    .ww-nav-logo {
      margin-right: auto;
    }
    .ww-nav-username {
      display: none;
    }
    .ww-nav-logout {
      padding: 6px 12px;
      font-size: 0.75rem;
      letter-spacing: 1px;
    }
    .ww-nav-logo-name {
      font-size: 1.2rem;
    }
    .ww-nav-hamburger {
      display: block;
    }
  }
`;

export default function Navbar({ user, logout }) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/analyze",   label: "Analyze"   },
    { to: "/records",   label: "Records"   },
    { to: "/chatbot",   label: "Chatbot"   },
  ];

  return (
    <>
      <style>{navStyles}</style>
      <nav className="ww-nav">

        {/* Leaf watermarks */}
        <div className="ww-nav-leaves">
          <span className="ww-nav-leaf" style={{ left: "3%",  top: "-30px", fontSize: "110px", transform: "rotate(-15deg)" }}>🌿</span>
          <span className="ww-nav-leaf" style={{ left: "10%", top: "-20px", fontSize: "90px",  transform: "rotate(10deg)"  }}>🍃</span>
          <span className="ww-nav-leaf" style={{ left: "18%", top: "-35px", fontSize: "100px", transform: "rotate(-5deg)"  }}>🌿</span>
          <span className="ww-nav-leaf" style={{ right: "18%",top: "-25px", fontSize: "95px",  transform: "rotate(12deg)"  }}>🍃</span>
          <span className="ww-nav-leaf" style={{ right: "8%", top: "-30px", fontSize: "105px", transform: "rotate(-8deg)"  }}>🌿</span>
          <span className="ww-nav-leaf" style={{ right: "1%", top: "-20px", fontSize: "88px",  transform: "rotate(20deg)"  }}>🍃</span>
        </div>

        <div className="ww-nav-inner">

          {/* Logo */}
          <Link to="/dashboard" className="ww-nav-logo">
            <div className="ww-nav-logo-circle">♻️</div>
            <span className="ww-nav-logo-name">WasteWise</span>
          </Link>

          {/* Nav links — toggles open/closed on mobile */}
          <ul className={`ww-nav-links ${menuOpen ? "open" : ""}`}>
            {links.map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className={location.pathname.startsWith(to) ? "active" : ""}
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Username + Logout */}
          <div className="ww-nav-right">
            {user && <span className="ww-nav-username">{user.name}</span>}
            <button className="ww-nav-logout" onClick={logout}>
              <span className="ww-nav-logout-icon"></span>
              Logout
            </button>
          </div>

          {/* Hamburger — only visible on mobile */}
          <button
            className="ww-nav-hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? "✕" : "☰"}
          </button>

        </div>
      </nav>
    </>
  );
}
