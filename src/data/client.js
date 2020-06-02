import data from './data.json';

const portfolioInfo = data.portfolio.info;
const allProjects = data.portfolio.projects;
const allSocialLinks = data.social_links;

const client = {
  getPortfolioInfo(){
    return portfolioInfo;
  },
  getAllProjects(){
    return allProjects;
  },
  getCategoryProjects(category){
    const categoryProjects = allProjects.filter(project => {
      const projectCategories = new Set(project.categories);
      return projectCategories.has(category);
    });
    return categoryProjects;
  },
  getProjectByID(projectID){
    const project = allProjects.filter(project => project.id === projectID);
    return project[0];
  },
  getAllCategories(){
    const categories = allProjects.map(project => project.categories).join(",").split(",");
    return Array.from(new Set(categories));
  },
  getAllImages(){
    const imagePaths = allProjects.map(project => project.thumbnail).join(",").split(",");
    const images = imagePaths.map(path => './../../../../assets/media/_thumbs/' + path);
    return Array.from(new Set(images));
  },
  getSocials(){
    return allSocialLinks;
  }
}

const allThumbnails = client.getAllImages();

export default client;
export { allThumbnails };