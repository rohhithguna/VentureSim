import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';

function Layout({ children }) {
    var scrolledState = useState(false);
    var scrolled = scrolledState[0];
    var setScrolled = scrolledState[1];

    useEffect(function () {
        function handleScroll() {
            setScrolled(window.scrollY > 10);
        }
        window.addEventListener('scroll', handleScroll);
        return function () {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <div>
            <nav className={'navbar' + (scrolled ? ' scrolled' : '')}>
                <div className="navbar-inner">
                    <span className="navbar-brand">VentureSim</span>
                    <div className="navbar-links">
                        <NavLink to="/" className={function (props) { return 'nav-link' + (props.isActive ? ' active' : ''); }}>Home</NavLink>
                        <NavLink to="/setup" className={function (props) { return 'nav-link' + (props.isActive ? ' active' : ''); }}>Setup</NavLink>
                        <NavLink to="/market" className={function (props) { return 'nav-link' + (props.isActive ? ' active' : ''); }}>Market</NavLink>
                        <NavLink to="/finance" className={function (props) { return 'nav-link' + (props.isActive ? ' active' : ''); }}>Finance</NavLink>
                        <NavLink to="/dashboard" className={function (props) { return 'nav-link' + (props.isActive ? ' active' : ''); }}>Dashboard</NavLink>
                        <NavLink to="/result" className={function (props) { return 'nav-link' + (props.isActive ? ' active' : ''); }}>Result</NavLink>
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
