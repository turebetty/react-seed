import { createStore, applyMiddleware } from 'redux';
import reducer from './Reducer';
import { BrowserRouter } from 'react-router-dom';
import { routerMiddleware } from 'react-router-redux';

const middleware = routerMiddleware(BrowserRouter);
const createStoreWithMiddleware = applyMiddleware(
    middleware
)(createStore);
const Store = (initialState) => {
    const store = createStoreWithMiddleware(reducer, initialState);
    return store;
};
export default Store;