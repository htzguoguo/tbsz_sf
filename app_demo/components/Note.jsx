import React from 'react';
import PropTypes from 'prop-types';
import {DragSource, DropTarget} from 'react-dnd';
import ItemTypes from '../constants/itemTypes';

const noteSource = {
    beginDrag(props) {
        return {
            id : props.id
        };
    },
    isDragging(props, monitor) {
        return props.id === monitor.getItem().id
    }
};
const noteTarget = {
    hover(targetProps, monitor) {
        const targetId = targetProps.id;
        const sourceProps = monitor.getItem();
        const sourceId = sourceProps.id;
        if (sourceId !== targetId) {
            targetProps.onMove({sourceId, targetId});
        }
    }
};

@DragSource(ItemTypes.NOTE, noteSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging : monitor.isDragging()
}))
@DropTarget(ItemTypes.NOTE, noteTarget, connect => (
    {
        connectDragTarget : connect.dropTarget()
    }
))
class Note extends React.Component {
    render() {
        const {connectDragSource, connectDragTarget, isDragging,
            id, onMove, editing,  ...props} = this.props;
        const dragSource = editing ? a => a : connectDragSource;
        return dragSource(
            connectDragTarget(
                <li style={
                    {
                        opacity : isDragging ? 0 : 1
                    }
                }
                    {...props}>{props.children}</li>
            )
        );
    }
}

Note.propTypes = {
    id: PropTypes.string.isRequired,
    editing : PropTypes.bool,
    isDragging : PropTypes.bool,
    onMove : PropTypes.func,
    connectDragSource : PropTypes.func,
    connectDragTarget : PropTypes.func
};
Note.defaultProps = {
    onMove : () => {},
    id : ''
};
export default Note;


