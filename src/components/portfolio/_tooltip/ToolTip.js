import React from 'react';
import './ToolTip.css';

class ToolTip extends React.Component {
    render(){
        return (
          <ToolTip className="ToolTip">
                <i className="fas fa-dice-d20"></i><p>Interact with the polyhedron to view different projects</p>
          </ToolTip>  
        );
    }
}

export default ToolTip;