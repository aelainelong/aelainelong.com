import React from 'react';
import PropTypes from 'prop-types';
import ReactGA from 'react-ga';
import { Scrollbars } from 'react-custom-scrollbars';
import ReactFancyBox from 'react-fancybox';
import 'react-fancybox/lib/fancybox.css';

import './Project.css';

class CustomScrollbar extends React.Component {
  render(){
    return (
      <Scrollbars
        autoHeight
        autoHeightMin={500}
        renderTrackVertical={props => <div {...props} className="track-vertical" />}
        renderThumbVertical={props => <div {...props} className="thumb-vertical" />}
        renderView={props => <div {...props} />}>
        {this.props.children}
      </Scrollbars>
    );
  }
}

class Project extends React.Component {
  constructor(props){
    super(props);
    
    this.state = {
      projectOpen: false,
      projectExpanded: false,
      galleryOpen: false,
      atStart: this.props.portfolioProgress.start,
      atEnd: this.props.portfolioProgress.end
    }
  }
  
  // Update project state upon mounting
  componentDidMount(){
    setTimeout(function(){
      this.setState({ projectOpen: true });
    }.bind(this), 200);
  }

  componentDidUpdate(prevProps, prevState){
    console.log(prevProps, prevState);
  }
  
  // Update project state upon unmounting
  componentWillUnmount(){
    this.setState({ projectOpen: false });
  }
  
  componentWillReceiveProps(newProps){
    this.setState({
      atStart: newProps.portfolioProgress.start,
      atEnd: newProps.portfolioProgress.end
    });
  }

  // Expand/collapse the project details
  handleToggle = () => {
    this.setState(() => ({ projectExpanded: !this.state.projectExpanded }));
  }
  
  // Update project state upon unmounting
  handleClose = () => {
    if(this.state.projectExpanded){
      this.setState(() => ({ projectExpanded: false }));
    } else {
      this.setState(() => ({ projectOpen: false }));
      this.props.closeProject();
      // setTimeout(function () {
        
      // }.bind(this), 500);
    }
  }
  
  // Load previous/next project upon click of project nav
  handleProjectNav = (direction) => {
    const { atStart, atEnd } = this.state;
    
    if((atStart && direction === "prev") || (atEnd && direction === "next")){
      // console.log("We are at the beginning or at the end");
      this.setState({ projectOpen: false });
      setTimeout(function(){
        this.props.handleProjectClose();
      }.bind(this), 500);
    } else {
      this.props.traverseProjects(direction);
    }
  }
  
  // Track project link clicks via Google Analytics
  handleLinkClick = e => {
    const linkTitle = e.target.getAttribute("title");
    ReactGA.event({
      category: 'externalSiteLink',
      action: 'click',
      label: linkTitle
    });
  }

  handleGallery = e => {
    this.setState(() => ({ galleryOpen: !this.state.galleryOpen }));
  }

  // Pull in media gallery cover image
  getCoverImage = () => {
    const coverImage = require(`./../../../assets/media${this.props.project.carouselCover}`);
    return (
      <div className="project-media-cover">
        <div className="wrapper">
          <img src={coverImage} alt="View Gallery" />
          <div className="overlay"></div>
          <button className="btn btn-gallery" onClick={() => this.handleGallery()}>View Gallery</button>
        </div>
      </div>
    )
  }

  // Pull in the project images/videos
  getProjectMedia = () => {
    return this.props.project.media.map((item, index) => {
      const media = require(`./../../../assets/media${item}`);
      let thumbnail;

      if (item.indexOf(".mp4") !== -1) { // If it is an image and not a video
        thumbnail = require(`./../../../assets/media/_thumbs/${this.props.project.thumbnail}`);
      } else { // It is a video
        thumbnail = media;
      }

      return (
        <li key={`media-` + index}>
          <ReactFancyBox
            thumbnail={thumbnail}
            image={media} />
        </li>
      )
    });
  }

  getProjectTech = () => {
    return this.props.project.tech.map(tech => {
      return tech.toString();
    }).join(", ");
  }
  
  render(){
    const galleryCover = this.getCoverImage();
    const mediaList = this.getProjectMedia();
    const techList = this.getProjectTech();
    
    return(
      <div className={`Project ${this.state.projectOpen ? `Project--open` : ``} ${this.state.projectExpanded ? `Project--expanded` : ``} ${this.state.galleryOpen ? `Project--gallery` : ``}`}>
        <div className="project-wrapper">
        <div className="project-cover"></div>
        
          <div className="project-content">

            <div className="col-1">
              <div className="project-header">
                <h2 className="project-title">{this.props.project.title}</h2>
                {this.props.project.deliverables ? <h3 className="project-subtitle">{this.props.project.deliverables}</h3> : null}
                {this.props.project.url ? <div className="project-link"><a href={this.props.project.url} target="_blank" title={this.props.project.title} rel="noopener noreferrer" onClick={(e) => this.handleLinkClick(e)}><i className="fa fa-link" aria-hidden="true"></i> Visit site</a></div> : null}
              </div>

              <div className="project-meta">
                {this.props.project.description ? <p className="project-description">{this.props.project.description}</p> : null}
                {this.props.project.tech.length > 0 ? <h4><span>Technologies:</span> {techList}</h4> : null}
                {this.props.project.client ? <h4><span>Client : </span> {this.props.project.client}</h4> : null}
                {this.props.project.agency ? <h4><span>Agency : </span> {this.props.project.agency}</h4> : null}
              </div>
            </div>

            <div className="col-2">
              {/* <CustomScrollbar> */}
                <div className="project-media">
                {galleryCover}
                  {/* <div className="project-images">
                    <ul>{mediaList}</ul>
                  </div> */}
                </div>
              {/* </CustomScrollbar> */}
            </div>
          </div>

          <div className="project-nav">
            <button className="btn btn-toggle" onClick={() => this.handleToggle()}>{!this.state.projectExpanded ? `View Project` : `Close`}</button>
            { this.state.projectOpen ? <button className="btn btn-close" onClick={() => this.handleClose()}>close</button> : null }
            { this.state.atEnd ? null : <button className="btn btn-next" onClick={() => this.handleProjectNav("next")}>next</button> }
            { this.state.atStart ? null : <button className="btn btn-prev" onClick={() => this.handleProjectNav("prev")}>prev</button>}
          </div>
      </div>
      </div>
    )
  }
}

export default Project;

Project.propTypes = {
  project: PropTypes.object,
  handleProjectClose: PropTypes.func,
  traverseProjects: PropTypes.func,
  portfolioProgress: PropTypes.object
}