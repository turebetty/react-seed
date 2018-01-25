import React, { Component } from 'react';
import { HashRouter } from 'react-router-dom';
import UserRoute from './component/business/user/Route';

export default class Root extends Component {
    render() {
        return (
            <HashRouter>
                <div>
                    <UserRoute />
                </div>
            </HashRouter>
        );
    }
}