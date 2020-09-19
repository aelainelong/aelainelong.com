import React from 'react';

import './Header.css';
import About from './_about/About';
import Connect from './_connect/Connect';
import client from '../../data/client.js';

const Header = props => {
  const { portfolioInfo, socialLinks } = client;

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
            <li className="home" role="presentation"><button onClick={handleLinkClick} data-view="home" role="menuitem" aria-label="Home">Home</button></li>
            <li className="explore" role="presentation"><button onClick={handleLinkClick} data-view="explore" role="menuitem" aria-label="Explore">Explore</button></li>
            <li className="about" role="presentation"><button onClick={handleLinkClick} data-view="about" role="menuitem" aria-label="About">About</button></li>
            <li className="connect" role="presentation"><button onClick={handleLinkClick} data-view="connect" role="menuitem" aria-label="Connect">Connect</button></li>
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