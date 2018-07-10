/**
 * Created by Administrator on 2017-12-05.
 */
import assert from 'assert';
import NoteActions from '../app/actions/NoteActions';
import NoteStore from '../app/stores/NoteStore';
import alt from '../app/libs/alt';

describe('NoteStore', () => {
    beforeEach(() => {
        alt.flush();
    });
    it('creates notes', () => {
        let task = 'task';
        NoteActions.create({task});
        let state = NoteStore.getState();
        assert.equal(state.notes.length, 1);
        assert.equal(state.notes[0].task, task);
    });
    it('updates notes', () => {
        let task = 'task';
        let updatedTask = 'newTask';
        NoteActions.create({task});
        const note = NoteStore.getState().notes[0];
        NoteActions.update({...note, task : updatedTask});
        let state = NoteStore.getState();
        assert.equal(state.notes.length, 1);
        assert.equal(state.notes[0].task, updatedTask);
    });
    it('deletes notes', () => {
        let task = 'task';
        NoteActions.create({task});
        let state = NoteStore.getState();
        assert.equal(state.notes.length, 1);
        NoteActions.delete(state.notes[0].id);
        state = NoteStore.getState();
        assert.equal(state.notes.length, 0);
    });
    it('gets notes', () => {
        let task = 'task';
        NoteActions.create({task});
        let note = NoteStore.getState().notes[0];
        let notes = NoteStore.getNoteByIds([note.id]);
        assert.equal(notes.length, 1);
        assert.equal(notes[0].task, task);
    });
});


