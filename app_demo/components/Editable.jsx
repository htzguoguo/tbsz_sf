import React from 'react';
import PropTypes from 'prop-types';

class Editable extends React.Component {
    render () {
        const {value, onEdit, onValueClick, editing, onDelete, ...props} = this.props;
        return (
            <div {...props}>
                {editing ? this.renderEdit() : this.renderValue()}
            </div>
        );
    }
    renderEdit = () => {
        return <input type="text"
                    ref = {(e) => e ? e.selectionStart = this.props.value.length : null}
                    autoFocus={true}
                    defaultValue={this.props.value}
                    onBlur={this.finishEdit}
                    onKeyPress={this.checkEnter}
        />
    };
    renderValue = () => {
        return (
            <div onClick={this.props.onValueClick}>
                <span className="value">{this.props.value}</span>
                {this.props.onDelete ? this.renderDelete() : null }
            </div>
        );
    };
    renderDelete = () => {
        return (<button
            className="delete"
            onClick={this.props.onDelete}>x</button>);
    };
    finishEdit = (e) => {
        this.props.onEdit(e.target.value);
    };
    checkEnter = (e) => {
        if (e.key === 'Enter') {
            this.finishEdit(e);
        }
    };
}

Editable.propTypes = {
    value : PropTypes.string,
    editing : PropTypes.bool,
    onEdit : PropTypes.func.isRequired,
    onValueClick : PropTypes.func.isRequired,
    onDelete : PropTypes.func
};
Editable.defaultProps = {
    value : '',
    editing : false,
    onEdit : () => {}
};



export default Editable;