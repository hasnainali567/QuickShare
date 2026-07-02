import React from "react";
import LOGO from '../../assets/logo-new.png'
import "./style.scss";
import { Link, useLocation } from "react-router-dom";
import ThemeBtn from "../Theme";
import { useTheme } from "../../context/ThemeContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

const Header = () => {
  const { isDark, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { pathname } = useLocation();
  const hasSharedContent = pathname === '/' && window.location.search.includes('id=');
  const isLandingPage = pathname === '/' && !hasSharedContent;

  return (
    <div className='header w-full'>
      <div className="flex items-center gap-2">

        <div className="img-conatiner size-12 p-2">
          <Link to={'/'}><img className="logo-img w-full object-contain" src={LOGO} alt="QuickShare" />
          </Link>
        </div>
        <div>
          <h3 className="text-lg font-medium">QuickShare</h3>
          <p className="text-xs opacity-70">Secure sharing workspace</p>
        </div>
      </div>
      <div className="list-container">
        <ul >
          {isLandingPage && (
            <li className="hidden md:block">
              <Link to={'/app'}>Open app</Link>
            </li>
          )}
          {user && (pathname === '/app' || hasSharedContent) && (
            <li className="hidden md:block">
              <button type="button" onClick={signOut}>Sign out</button>
            </li>
          )}
          <li>
            <ThemeBtn theme={isDark} themeToggle={toggleTheme} />
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Header;

