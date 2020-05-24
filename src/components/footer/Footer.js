import React from 'react';
import Stagger from 'react-css-stagger';
import PropTypes from 'prop-types';

import utils from '../../utils/misc.js';
import './Footer.css';

class Footer extends React.Component {
  constructor(props){
    super(props);
    
    this.handleLinkClick = this.handleLinkClick.bind(this);
  }
  
  handleLinkClick(e){
    utils.trackLinkClick(e);
  }
  
  render(){
    // Build list of social links
    const socialLinks = this.props.socialLinks;
    const socialList = socialLinks.map(link => {
      return (
        <li key={`social-`+link.channel}><a href={link.url} onClick={(e) => (this.handleLinkClick(e))} title={link.channel} target="_blank" rel="noopener noreferrer"><i className={`fa fa-`+ link.icon} aria-hidden="true"></i><span>{link.channel}</span></a></li>
      );
    });
    
    return(
      <footer className="Footer">
        <ul className="social">
          {this.props.connected ? <Stagger transition={"socialIn"} delay={150} initialDelay={200}>
            {socialList}
          </Stagger> : ``}
        </ul>
      </footer>
    );
  }
}

export default Footer;

Footer.propTypes = {
  socialLinks: PropTypes.array
}