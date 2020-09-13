import React from 'react';
import PropTypes from 'prop-types';

import './Header.css';
import About from './_about/About';
import Connect from './_connect/Connect';
import client from '../../data/client.js';

const Header = props => {
  const portfolioInfo = client.getPortfolioInfo();
  const socialLinks = client.getSocials();

  const handleLinkClick = e => {
    e.preventDefault();
    const view = e.target.getAttribute("data-view");
    props.updateView(view);
  }

  return (
    <div className="Header">
      <div className="Header__wrap">
        <div className="Title">
          <h1>{portfolioInfo.name}</h1>
          <h2>{portfolioInfo.title}</h2>
        </div>
        <div className="Menu" role="navigation">
          <ul role="menu">
            <li className="home" role="presentation"><a href="#" onClick={handleLinkClick} data-view="home" role="menu-item" aria-label="Home">Home</a></li>
            <li className="explore" role="presentation"><a href="#" onClick={handleLinkClick} data-view="explore" role="menu-item" aria-label="Explore">Explore</a></li>
            <li className="about" role="presentation"><a href="#" onClick={handleLinkClick} data-view="about" role="menu-item" aria-label="About">About</a></li>
            <li className="connect" role="presentation"><a href="#" onClick={handleLinkClick} data-view="connect" role="menu-item" aria-label="Connect">Connect</a></li>
          </ul>
        </div>
        <div className="Info">
          <About show={props.about} bio={portfolioInfo.bio} />
          <Connect connect={props.connect} socialLinks={socialLinks} />
        </div>
      </div>


    </div>
  );
}

export default Header;

Header.propTypes = {
  portfolioInfo: PropTypes.object
}