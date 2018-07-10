import React from 'react';
import PropTypes from 'prop-types';
import Editable from './Editable.jsx';
import Note from './Note.jsx';
import LaneActions from '../actions/LaneActions';

const Notes =  ({notes, onValueClick, onEdit, onDelete}) => { return (<ul className="notes">
    {
        notes.map(
            note =>
                   <Note className="note" id={note.id} key={note.id}
                         editing={note.editing} onMove = {LaneActions.move}

                   >
                       <Editable
                           editing={note.editing}
                           value={note.task}
                           onValueClick={onValueClick.bind(null, note.id)}
                           onEdit={onEdit.bind(null, note.id)}
                           onDelete={onDelete.bind(null, note.id)}
                       />
                   </Note>

        )
    }
    </ul>)};

Notes.propTypes = {
    notes : PropTypes.array,
    onValueClick : PropTypes.func,
    onEdit : PropTypes.func,
    onDelete : PropTypes.func
};
Notes.defaultProps = {
    notes : [],
    onEdit : () => {}
};

export default Notes;
