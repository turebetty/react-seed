import React, { Component } from 'react';

import { Route } from 'react-router-dom';

import Login from './login';

export default class UserRoute extends Component {
    render() {
        return (
            <div>
                <Route
                    path="/user/login"
                    component={Login}
                />
            </div>
        );
    }
}