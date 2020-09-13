import React from 'react';
import PropTypes from 'prop-types';
import Fade from 'react-reveal/Fade';

import utils from '../../../utils/misc.js';
import './Connect.css';

class Connect extends React.Component {
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
        <li key={`social-`+link.channel}><a href={link.url} onClick={(e) => (this.handleLinkClick(e))} title={link.channel} target={link.target} rel="noopener noreferrer"><i className={`fa fa-`+ link.icon} aria-hidden="true"></i><span>{link.channel}</span></a></li>
      );
    });
    
    return(
      <div className="Connect">
        {
          this.props.connect ? 
            <Fade top cascade duration={1000}>
              <ul className="social">
                {socialList}
              </ul>
            </Fade>
            : null
        }
      </div>
    );
  }
}

export default Connect;

Connect.propTypes = {
  socialLinks: PropTypes.array
}