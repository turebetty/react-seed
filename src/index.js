import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import createStore from './Store';
import './index.css';
import Route from './Route';
import registerServiceWorker from './registerServiceWorker';
const store = createStore();
window.store = store;
ReactDOM.render(
    <Provider store={store}>
        <Route />
    </Provider>,
    document.getElementById('root')
);
registerServiceWorker();