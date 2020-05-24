import ReactGA from 'react-ga';

const misc = {
    trackLinkClick(e) {
        // Send portfolio project link clicks to Google Analytics
        console.log(e.target.parentNode);
        const linkTitle = e.target.parentNode.getAttribute("title");
        ReactGA.event({
            category: 'externalLink',
            action: 'click',
            label: linkTitle
        });
    }
}

export default misc;