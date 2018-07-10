/**
 * Created by Administrator on 2017-12-25.
 */
import assert from 'assert';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom'
import configureStore from '../../store/configureStore';
import {
  renderIntoDocument,
  findRenderedDOMComponentWithClass,
  findRenderedDOMComponentWithTag
} from 'react-dom/test-utils';
import Header from './index.jsx';
const store = configureStore();
let auth = {
  user : {
    name : 'fireey'
  }
};
let logout = () => {};
describe("<Header/>", function () {
  it('render component', () => {
    const component = renderIntoDocument(
      <Provider store={store}>
        <MemoryRouter>
          <Header profile={auth} logout={logout}/>
        </MemoryRouter>
      </Provider>
    );
    console.log(component);
    const headerComponent = findRenderedDOMComponentWithTag(component, 'a');
    assert.equal(headerComponent.length, 1);
  });
});
