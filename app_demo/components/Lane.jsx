import React from 'react';
import PropTypes from 'prop-types';
import Notes from './Notes.jsx';
import NoteActions from '../actions/NoteActions';
import NoteStore from '../stores/NoteStore';
import LaneActions from '../actions/LaneActions';
import Editable from './Editable.jsx';
import {DropTarget} from 'react-dnd';
import ItemTypes from '../constants/itemTypes';

const noteTarget = {
    hover(targetProps, monitor) {
        const targetId = targetProps.id;
        const sourceProps = monitor.getItem();
        const sourceId = sourceProps.id;
        if (!targetProps.lane.notes.length) {
            LaneActions.attachToLane({
                laneId : targetProps.lane.id,
                noteId : sourceId
            });
        }

    }
};

@DropTarget(ItemTypes.NOTE, noteTarget, (connect) => (
    {
        connectDropTarget : connect.dropTarget()
    }
))
class Lane extends React.Component {
    constructor(props) {
        super(props);
        this.state =  NoteStore.getState() ;
        this.storeChanged = this.storeChanged.bind(this);
        this.addNote = this.addNote.bind(this);
        this.deleteNote = this.deleteNote.bind(this);
    }
    componentDidMount() {
        NoteStore.listen(this.storeChanged);
    }
    componentWillUnmount() {
        NoteStore.unlisten(this.storeChanged);
    }

    storeChanged(state){
        this.setState(state);
    }
    render() {
        const {connectDropTarget, lane, ...props} = this.props;
        const notes = NoteStore.getNoteByIds(lane.notes);
        return connectDropTarget(<div {...props}>
            <div className="lane-header" onClick={this.activateLaneEdit}>
                <div className="lane-add-note">
                    <button onClick={this.addNote}>+</button>
                </div>
                <Editable
                    className="lane-name"
                    editing={lane.editing}
                    value={lane.name}
                    onEdit={this.editName}
                />
                <div className="lane-delete">
                    <button onClick={this.deleteLane}>x</button>
                </div>
            </div>
            <Notes
                notes={notes}
                onValueClick={this.activateNoteEdit}
                onEdit={this.editNote}
                onDelete={this.deleteNote}
            />
        </div>);
    }
    addNote = (e) => {
        e.stopPropagation();
        let laneId = this.props.lane.id;
        let note = NoteActions.create({task : 'New TTTT'});
        LaneActions.attachToLane({
            laneId : laneId,
            noteId : note.id
        });
    };
    editNote(id, task){
        if (!task.trim()) {
            NoteActions.update({id, editing : false});
            return;
        }
        NoteActions.update({id, task, editing : false});
    }
    deleteNote = (id, e) => {
        e.stopPropagation();
        let laneId = this.props.lane.id;
        NoteActions.delete(id);
        LaneActions.detachFromLane({
            laneId : laneId,
            noteId : id
        });
    };
    editName = (name) => {
        const laneId = this.props.lane.id;
        if (!name.trim()) {
            LaneActions.update({id : laneId, editing : false});
            return;
        }
        LaneActions.update({id : laneId, name, editing : false});
    };
    deleteLane = () => {
        const laneId = this.props.lane.id;
        LaneActions.delete(laneId);
    };
    activateLaneEdit = () => {
        const laneId = this.props.lane.id;
        LaneActions.update({id : laneId, editing : true});
    };
    activateNoteEdit = (noteId) => {
        NoteActions.update({id : noteId, editing : true});
    };

}

Lane.propTypes = {
    lane : PropTypes.shape({
        id : PropTypes.string.isRequired,
        editing : PropTypes.bool,
        name : PropTypes.string,
        notes : PropTypes.array
    }).isRequired,
    connectDropTarget: PropTypes.func
};
Lane.defaultProps = {
    name : '',
    notes : []
};

export default Lane;