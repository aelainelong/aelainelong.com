import React from 'react';
import ReactGA from 'react-ga';
import Stagger from 'react-css-stagger';
import PropTypes from 'prop-types';

import './Header.css';
import Footer from '../footer/Footer';

class Header extends React.Component {
  constructor(props){
    super(props);
  }

  handleLinkClick = e => {
    e.preventDefault();
    const view = e.target.getAttribute("data-view");

    if(view === "connect"){
      this.props.toggleConnect();
    } else {
      this.props.updateView(view);
    }

    // this.props.updateBgColor(this.props.bgColors[view]);
  }

  render() {
    const portfolioInfo = this.props.portfolioInfo;
    const socialLinks = this.props.socialLinks;
    const connected = this.props.connect;
    // const bgColors = this.props.bgColors;
    
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

          <Footer connected={connected} socialLinks={socialLinks} />
          </div>

          
				</div>
    );
  }
}

export default Header;

Header.propTypes = {
  portfolioInfo: PropTypes.object
}