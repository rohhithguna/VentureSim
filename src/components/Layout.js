import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';

function Layout({ children }) {
    var scrolledState = useState(false);
    var scrolled = scrolledState[0];
    var setScrolled = scrolledState[1];

    var menuOpenState = useState(false);
    var menuOpen = menuOpenState[0];
    var setMenuOpen = menuOpenState[1];

    useEffect(function () {
        function handleScroll() {
            setScrolled(window.scrollY > 10);
        }
        window.addEventListener('scroll', handleScroll);
        return function () {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [setScrolled]);

    return (
        <div>
            <nav className={'navbar' + (scrolled ? ' scrolled' : '')}>
                <div className="navbar-inner">
                    <span className="navbar-brand">VentureSim</span>

                    <button className="mobile-menu-btn" onClick={function () { setMenuOpen(!menuOpen); }}>
                        {menuOpen ? '✕' : '☰'}
                    </button>

                    <div className={'navbar-links' + (menuOpen ? ' mobile-open' : '')}>
                        <NavLink to="/" onClick={function () { setMenuOpen(false); }} className={function (props) { return 'nav-link' + (props.isActive ? ' active' : ''); }}>Home</NavLink>
                        <NavLink to="/setup" onClick={function () { setMenuOpen(false); }} className={function (props) { return 'nav-link' + (props.isActive ? ' active' : ''); }}>Setup</NavLink>
                        <NavLink to="/market" onClick={function () { setMenuOpen(false); }} className={function (props) { return 'nav-link' + (props.isActive ? ' active' : ''); }}>Market</NavLink>
                        <NavLink to="/finance" onClick={function () { setMenuOpen(false); }} className={function (props) { return 'nav-link' + (props.isActive ? ' active' : ''); }}>Finance</NavLink>
                        <NavLink to="/dashboard" onClick={function () { setMenuOpen(false); }} className={function (props) { return 'nav-link' + (props.isActive ? ' active' : ''); }}>Dashboard</NavLink>
                        <NavLink to="/result" onClick={function () { setMenuOpen(false); }} className={function (props) { return 'nav-link' + (props.isActive ? ' active' : ''); }}>Result</NavLink>
                    </div>
                </div>
            </nav>
            <main className="page-content">
                {children}
            </main>
        </div>
    );
}

export default Layout;
