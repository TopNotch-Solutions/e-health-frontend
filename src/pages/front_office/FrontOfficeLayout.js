import { NavLink, Outlet } from 'react-router-dom';
import './front-office.css';

const KOPANO = 'https://kopanovertex.com/';

function BuildingIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 21V8l8-4 8 4v13M9 21v-6h6v6M4 21h16"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function FrontOfficeLayout() {
  return (
    <div className="fo-app">
      <header className="fo-header fo-header-minimal">
        <NavLink to="/front_office" className="fo-brand">
          <BuildingIcon />
          <span>Health Management System</span>
        </NavLink>
      </header>

      <main className="fo-main">
        <Outlet />
      </main>

      <footer className="fo-footer">
        Health Management System | A digital solution by{' '}
        <a href={KOPANO} target="_blank" rel="noopener noreferrer">
          Kopano-Vertex
        </a>{' '}
        | <a href={KOPANO}>Website</a> | © {new Date().getFullYear()} All rights reserved
      </footer>
    </div>
  );
}
