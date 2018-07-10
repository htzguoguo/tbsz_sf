import React from 'react';
import PropTypes from 'prop-types';
import Lane from './Lane.jsx';

const Lanes =  ({lanes}) => {
    return (<div className="lanes">
        {lanes.map(lane => <Lane className="lane" key={lane.id} lane={lane}/>)}
    </div>);
};

Lanes.propTypes = {
    lanes : PropTypes.array
};
Lanes.defaultProps = {
    lanes : []
};

export default Lanes;