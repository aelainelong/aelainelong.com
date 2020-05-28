import React from 'react';
import './ToolTip.css';

class ToolTip extends React.Component {
    render(){
        return (
            <div className={`ToolTip ${this.props.currentProject ? `ToolTip-hidden` : ``}`}>
                <i className="fas fa-dice-d20"></i><p>Interact with the polyhedron to view different projects</p>
          </div>  
        );
    }
}

export default ToolTip;