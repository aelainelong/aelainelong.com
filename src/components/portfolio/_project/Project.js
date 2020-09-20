import React from 'react';
import ReactGA from 'react-ga';

import Carousel from 'nuka-carousel';

import './Project.css';

class Project extends React.Component {
  constructor(props){
    super(props);
    
    this.state = {
      projectOpen: false,
      projectExpanded: false,
      galleryOpen: false
    }
  }
  
  // Update project state upon mounting
  componentDidMount(){
    setTimeout(function(){
      this.setState({ projectOpen: true });
    }.bind(this), 200);
  }
  
  // Update project state upon unmounting
  componentWillUnmount(){
    this.setState({ projectOpen: false, projectExpanded: false, galleryOpen: false });
  }

  // Expand/collapse the project details
  handleCloseMobile = () => {
    this.setState(state => ({ projectExpanded: !state.projectExpanded }));
  }

  handleCloseDesktop = () => {
    this.setState(() => ({ projectOpen: false, projectExpanded: false }));
    this.props.handleProjectClose();
  }
  
  // Load previous/next project upon click of project nav
  handleProjectNav = (direction) => {
    const atStart = this.props.project.id === 1;
    const atEnd = this.props.project.id >= this.props.portfolioSize;
    
    if ((atStart && direction === "prev") || (atEnd && direction === "next")){
      // console.log("We are at the beginning or at the end");
      this.setState({ galleryOpen: false, projectOpen: false });
      setTimeout(() => this.props.handleProjectClose(), 500);
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

  handleGallery = () => {
    this.setState(state => ({ galleryOpen: !state.galleryOpen }));
  }

  // Pull in media gallery cover image
  getCoverImage = () => {
    const coverImage = require(`./../../../assets/media${this.props.project.carouselCover}`);
    return (
      <div className="project-media-cover">
        <div className="wrapper">
          <img src={coverImage} alt="View Gallery" />
          <div className="overlay"></div>
          <button className="btn-wrap" onClick={() => this.handleGallery()}>
            <span className="btn btn-gallery">View Gallery</span>
          </button>
        </div>
      </div>
    )
  }

  // Pull in the project images/videos
  getProjectMedia = () => {
    const mediaList = this.props.project.media.map((item, i) => {
      if (item.indexOf("youtube") !== -1) { // If it is a video
        return (
          <div key={i} className="video-wrapper">
            <iframe 
              width="600" 
              height="353" 
              title={`${item.title}: Project Video`}
              src={`${item}?theme=dark&autohide=2&modestbranding=1&rel=0`} 
              frameBorder="0" 
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
        )
      } else { // If it is an image
        const itemURL = require(`./../../../assets/media${item}`);
        return (
          <div key={i} className="image-wrapper">
            <img src={itemURL} alt={item.title} />
          </div>
        )
      }
    });
    return ( mediaList )
  }

  getProjectTech = () => {
    return this.props.project.tech.map(tech => tech.toString()).join(", ");
  }
  
  render(){
    const atStart = this.props.project.id === 1;
    const atEnd = this.props.project.id >= this.props.portfolioSize;
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
                {this.props.project.url ? 
                  <div className={`project-link ${this.props.project.flash ? `project-flash-site` : null }`}>
                    <a href={this.props.project.url} target="_blank" title={this.props.project.title} rel="noopener noreferrer" onClick={e => this.handleLinkClick(e)}>
                    <i className="fa fa-link" aria-hidden="true"></i> Visit site</a>
                  </div> : null
                }
              </div>

              <div className="project-meta">
                {this.props.project.description ? <p className="project-description">{this.props.project.description}</p> : null}
                {this.props.project.tech.length > 0 ? <h4><span>Technologies:</span> {techList}</h4> : null}
                {this.props.project.client ? <h4><span>Client : </span> {this.props.project.client}</h4> : null}
                {this.props.project.agency ? <h4><span>Agency : </span> {this.props.project.agency}</h4> : null}
              </div>
            </div>

            <div className="col-2">
                <div className="project-media">{galleryCover}</div>
            </div>
          </div>

          <div className="project-nav">
            {!this.state.projectOpen || this.state.galleryOpen ? null : <button className="btn btn-close" onClick={() => this.handleCloseDesktop()}>Close Project</button> }
            { !this.state.galleryOpen ? null : <button className="btn btn-gallery" onClick={() => this.handleGallery()}>Close Gallery</button> }
            { this.state.galleryOpen ? null : <button className="btn btn-toggle" onClick={() => this.handleCloseMobile()}>{!this.state.projectExpanded ? `View Project` : `Close `}</button>}
            { atEnd || this.state.galleryOpen ? <button className="btn btn-next" aria-disabled="true" disabled>next</button> : <button className="btn btn-next" onClick={() => this.handleProjectNav("next")}>next</button> }
            { atStart || this.state.galleryOpen ? <button className="btn btn-prev" aria-disabled="true" disabled>prev</button> : <button className="btn btn-prev" onClick={() => this.handleProjectNav("prev")}>prev</button>}
          </div>
        </div>

        {this.state.galleryOpen ? <div className="project-gallery">
          <Carousel
            cellAlign={'center'}
            slidesToShow={1}
            heightMode={'max'}
            >
            {mediaList}
          </Carousel>
        </div> : null }
      </div>
    )
  }
}

export default Project;