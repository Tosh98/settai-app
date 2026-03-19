import React from 'react';
import { NavLink } from 'react-router-dom';
import { Building, Gift } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-brand">
        🍽️ せったいくん
      </NavLink>
      <div className="navbar-links">
        <NavLink
          to="/restaurants"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <Building size={16} />
          店舗
        </NavLink>
        <NavLink
          to="/gifts"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <Gift size={16} />
          手土産
        </NavLink>
      </div>
    </nav>
  );
}
