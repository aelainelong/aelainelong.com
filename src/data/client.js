import data from './data.json';

const client = {
  portfolioInfo: data.portfolio.info,
  allProjects: data.portfolio.projects,
  socialLinks: data.social_links,
  getProjectByID: function(id) {
    return this.allProjects.filter(project => project.id === id)[0];
  },
  getAllImages: function() {
    return this.allProjects
      .map(project => project.thumbnail).join(",").split(",")
      .map(path => './../../../../assets/media/_thumbs/' + path);
  }
}

export default client;