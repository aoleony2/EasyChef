import React from 'react';
import './style.css'

const Footer = () => {
  return (
    
    <div className="container footer">
      <footer className="d-flex flex-wrap justify-content-between align-items-center py-3 my-4 border-top">
        <p className="col-md-4 mb-0 text-muted">&copy; 2023 Easy Chef, Inc</p>
        <ul className="nav col-md-4 justify-content-end">
          <li className="nav-item"><a href="/" className="nav-link px-2 text-muted">Home</a></li>
          <li className="nav-item"><a href="/myrecipe" className="nav-link px-2 text-muted">My Recipe</a></li>
          <li className="nav-item"><a href="/newRecipe" className="nav-link px-2 text-muted">Create New Recipe</a></li>
        </ul>
      </footer>
    </div>
  );
};

export default Footer;
