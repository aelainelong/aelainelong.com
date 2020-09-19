import React from 'react';
import Fade from 'react-reveal/Fade';

import utils from '../../../utils/misc.js';
import './Connect.css';

const Connect = props => {

  // Track link on click
  const handleLinkClick = (e) => {
    utils.trackLinkClick(e);
  }

  // Build list of social links
  const socialLinks = props.socialLinks;
  const socialList = socialLinks.map(link => {
    return (
      <li key={`social-` + link.channel}>
        <a href={link.url} onClick={handleLinkClick} title={link.channel} target={link.target} rel="noopener noreferrer">
          <i className={`fa fa-` + link.icon} aria-hidden="true"></i>
          <span>{link.channel}</span>
        </a>
      </li>
    );
  });

  // Determine build structure
  const connect = 
    props.connect ?
      <Fade top cascade duration={1000}>
        <ul className="social">
          {socialList}
        </ul>
      </Fade>
    : null;

  return (
    <div className="Connect">
      { connect }
    </div>
  );
}

export default Connect;