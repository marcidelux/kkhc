import {createStore, combineReducers, applyMiddleware} from 'redux';
import { createLogger } from 'redux-logger';
import thunk from 'redux-thunk';
// import promise from "redux-promise-middleware";

import drive from './reducers/driveReducers';
import fileList from './reducers/FileListReducers';

export default createStore(
    combineReducers({
        drive,
        fileList,
    }),
    // {},
    applyMiddleware(
        // createLogger(),
        thunk,
    //  promise()
)
);