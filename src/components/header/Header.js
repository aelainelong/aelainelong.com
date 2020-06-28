import React from 'react';
import Stagger from 'react-css-stagger';
import PropTypes from 'prop-types';

import './Header.css';
import About from './_about/About';
import Connect from './_connect/Connect';
import client from '../../data/client.js';

class Header extends React.Component {
  constructor(props){
    super(props);
  }

  handleLinkClick = e => {
    e.preventDefault();
    const view = e.target.getAttribute("data-view");
    this.props.updateView(view);
  }

  render() {
    const portfolioInfo = client.getPortfolioInfo();
    const socialLinks = client.getSocials();
    
    return(
      
      <div className="Header">

          <div className="Header__wrap">
            <div className="Title">
              <h1>{portfolioInfo.name}</h1>
              <h2>{portfolioInfo.title}</h2>
            </div>
            <div className="Menu" role="navigation">
              <ul role="menu">
                <li className="home" role="presentation"><a href="#" onClick={e => (this.handleLinkClick(e))} data-view="home" role="menu-item" aria-label="Home">Home</a></li>
                <li className="explore" role="presentation"><a href="#" onClick={e => (this.handleLinkClick(e))} data-view="explore" role="menu-item" aria-label="Explore">Explore</a></li>
                <li className="about" role="presentation"><a href="#" onClick={e => (this.handleLinkClick(e))} data-view="about" role="menu-item" aria-label="About">About</a></li>
                <li className="connect" role="presentation"><a href="#" onClick={e => (this.handleLinkClick(e))} data-view="connect" role="menu-item" aria-label="Connect">Connect</a></li>
              </ul>
            </div>
          <div className="Info">
            {this.props.about ? <About bio={portfolioInfo.bio} /> : null}
            
            <Connect connect={this.props.connect} socialLinks={socialLinks} />
          </div>
          </div>

          
				</div>
    );
  }
}

export default Header;

Header.propTypes = {
  portfolioInfo: PropTypes.object
}