import React, { Component } from 'react';

import { Route } from 'react-router-dom';

import List from './list';

export default class UserRoute extends Component {
    render() {
        return (
            <div>
                <Route
                    path="/homework/list"
                    component={List}
                />
            </div>
        );
    }
}