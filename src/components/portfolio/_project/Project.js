import React from 'react';
import PropTypes from 'prop-types';
import ReactGA from 'react-ga';
import ReactFancyBox from 'react-fancybox';
import 'react-fancybox/lib/fancybox.css';

import './Project.css';

class Project extends React.Component {
  constructor(props){
    super(props);
    
    this.state = {
      projectOpen: false,
      atStart: this.props.portfolioProgress.start,
      atEnd: this.props.portfolioProgress.end
    }
    
    this.handleClose = this.handleClose.bind(this);
    this.handleProjectNav = this.handleProjectNav.bind(this);
    this.handleLinkClick = this.handleLinkClick.bind(this);
  }
  
  // Update portfolio progress prior to mounting 
  componentWillMount(){
    console.log("Receiving initial props now. Do something.");
  }
  
  // Update project state upon mounting
  componentDidMount(){
    setTimeout(function(){
      this.setState({ projectOpen: true });
    }.bind(this), 200);
  }
  
  // Update project state upon unmounting
  componentWillUnmount(){
    this.setState({ projectOpen: false });
  }
  
  componentWillReceiveProps(newProps){
    console.log("Receiving new props now. Do something.");
    // alert("Beginning is " + newProps.portfolioProgress.start);
    // alert("Ending is " + newProps.portfolioProgress.end);
    this.setState({
      atStart: newProps.portfolioProgress.start,
      atEnd: newProps.portfolioProgress.end
    });
  }
  
  // Update project state upon unmounting
  handleClose(){
    this.setState({ projectOpen: false });
    setTimeout(function(){
      this.props.handleProjectClose();
    }.bind(this), 500);
  }
  
  // Load previous/next project upon click of project nav
  handleProjectNav(direction){
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
  handleLinkClick(e){
    const linkTitle = e.target.getAttribute("title");
    ReactGA.event({
      category: 'externalSiteLink',
      action: 'click',
      label: linkTitle
    });
  }
  
  render(){
    // Portfolio Progress
    const { atEnd } = this.state;
    
    // Project click events
    const handleClose = this.handleClose;
    const handleLinkClick = this.handleLinkClick;
    
    // Project meta info
    const projectOpen = this.state.projectOpen;
    const projectInfo = this.props.projectInfo;
    
    const projectImages = projectInfo.images;
    const projImageList = projectImages.map((image, index) => {
      return(
        <li key={`image-`+ index}>
          <ReactFancyBox
            thumbnail={process.env.PUBLIC_URL + '/img/portfolio' + image}
            image={process.env.PUBLIC_URL + '/img/portfolio' + image} />
        </li>
      )
    });
    
    const projectCategories = projectInfo.categories;
    const projCatList = projectCategories.map((category, index) => {
      return(
        <li key={`category-`+ index}>
          <span>{category}</span>
        </li>
      )
    });
    
    const projectTools = projectInfo.tools;
    const projToolList = projectTools.map((tool, index) => {
      return(
        <li key={`tool-`+ index}>
          <span>{tool}</span>
        </li>
      )
    });
    
    return(
      <div className={projectOpen ? `Project open` : `Project`}>
        <div className="project-wrapper">
          <div className="project-header">
            <h3 className="project-title">{projectInfo.title}</h3>
            { projectInfo.url ? <a href={projectInfo.url} className="project-link" target="_blank" title={projectInfo.title} rel="noopener noreferrer" onClick={(e) => handleLinkClick(e)}><i className="fa fa-external-link" aria-hidden="true"></i> Visit site</a> : null }
            <button className="btn btn-closeProject" onClick={() => handleClose()}>X</button>
          </div>
          { projectInfo.client ? <h4 className="project-meta">Client: <span>{projectInfo.client}</span></h4> : null }
          { projectInfo.deliverables ? <h4 className="project-meta">Deliverables: <span>{projectInfo.deliverables}</span></h4> : null }
          { projectInfo.agency ? <h4 className="project-meta">Agency: <span>{projectInfo.agency}</span></h4> : null }
          <p className="project-description">{projectInfo.description}</p>
          <div className="project-categories">
            <h5>Skills applied: </h5>
            <ul>{projCatList}</ul>
          </div>
          <div className="project-tools">
            <h5>Technologies used: </h5>
            <ul>{projToolList}</ul>
          </div>
          <div className="project-images">
            <ul>{projImageList}</ul>
          </div>
        </div>
        <div className="btn-wrapper next">
          { atEnd ? null : <button className="btn-next" onClick={() => this.handleProjectNav("next")}><i className="fa fa-angle-double-right" aria-hidden="true" title="Next project"></i></button> }
        </div>
      </div>
    )
  }
}

export default Project;

Project.propTypes = {
  projectInfo: PropTypes.object,
  handleProjectClose: PropTypes.func,
  traverseProjects: PropTypes.func,
  portfolioProgress: PropTypes.object
}