import React from 'react';
import Stagger from 'react-css-stagger';
import PropTypes from 'prop-types';

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
        <ul className="social">
          {this.props.connect ? <Stagger transition={"socialIn"} delay={125} initialDelay={200}>
            {socialList}
          </Stagger> : null}
          
        </ul>
      </div>
    );
  }
}

export default Connect;

Connect.propTypes = {
  socialLinks: PropTypes.array
}