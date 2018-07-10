
import React from 'react';
import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import Lanes from './Lanes.jsx';
import LaneActions from '../actions/LaneActions';
import LaneStore from '../stores/LaneStore';
import {Icon ,Button} from 'antd';


@DragDropContext(HTML5Backend)
export default  class App extends React.Component {
   constructor(props) {
        super(props);

       this.state = LaneStore.getState();
    }
    componentDidMount() {
        LaneStore.listen(this.storeChanged);
    }
    componentWillUnmount() {
        LaneStore.unlisten(this.storeChanged);
    }
    storeChanged = (state) => {
        this.setState(state);
    };
    render() {
        const lanes = this.state.lanes;
        return (
            <div>
                <Button type="danger" size="large" className="add-lane" onClick={this.addLane}>
                    <Icon spin="true" type="plus-circle-o" />
                    添加
                </Button>
                <Lanes lanes={lanes}/>
            </div>
        );
    }
    addLane() {
        LaneActions.create({name : 'New Lane'});
    }
}

