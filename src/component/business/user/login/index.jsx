import { Button, Form, Input } from 'antd';
import md5 from 'blueimp-md5';
import 'particles.js';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { $dispatch } from 'src/util/reduxTool';
import * as userService from 'src/service/user';
import './index.less';
import logoSrc from 'src/asset/image/logo/logo_240.png';

const particlesJS = window.particlesJS;
const createForm = Form.create;

@connect(({ user }) => ({ user }))
@createForm()
class Login extends Component {
    constructor() {
        super();
        this.state = {
            error_msg: '',
            username: '',
            password: '',
        };
    }
    componentDidMount() {
        particlesJS('particles-js', {
            particles: {
                number: {
                    value: 20,
                    density: {
                        enable: true,
                        value_area: 600,
                    },
                },
                color: {
                    value: '#e9eff2',
                },
                shape: {
                    type: 'polygon',
                    stroke: {
                        width: 0,
                        color: '#e9eff2',
                    },
                    polygon: {
                        nb_sides: 5,
                    },
                    image: {
                        src: '',
                        width: 0,
                        height: 0,
                    },
                },
                opacity: {
                    value: 1,
                    random: false,
                    anim: {
                        enable: false,
                        speed: 1,
                        opacity_min: 0.1,
                        sync: false,
                    },
                },
                size: {
                    value: 10,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 0,
                        size_min: 0.8120772123013452,
                        sync: false,
                    },
                },
                line_linked: {
                    enable: true,
                    distance: 400,
                    color: '#e9eff2',
                    opacity: 1,
                    width: 1,
                },
                move: {
                    enable: true,
                    speed: 3,
                    direction: 'none',
                    random: true,
                    straight: false,
                    out_mode: 'out',
                    bounce: false,
                    attract: {
                        enable: false,
                        rotateX: 600,
                        rotateY: 1200,
                    },
                },
            },
            interactivity: {
                detect_on: 'canvas',
                events: {
                    onhover: {
                        enable: true,
                        mode: 'repulse',
                    },
                    onclick: {
                        enable: true,
                        mode: 'push',
                    },
                    resize: true,
                },
                modes: {
                    grab: {
                        distance: 400,
                        line_linked: {
                            opacity: 1,
                        },
                    },
                    bubble: {
                        distance: 400,
                        size: 40,
                        duration: 2,
                        opacity: 8,
                        speed: 3,
                    },
                    repulse: {
                        distance: 81.20772123013451,
                        duration: 0.4,
                    },
                    push: {
                        particles_nb: 1,
                    },
                    remove: {
                        particles_nb: 2,
                    },
                },
            },
            retina_detect: true,
        });
    }
    handleUsernameChange(e) {
        const username = e.target.value;
        this.setState({
            username,
            error_msg: '',
        });
    }
    handlePasswordChange(e) {
        const pwd = e.target.value;
        this.setState({
            password: pwd,
            error_msg: '',
        });
    }

    async login() {
        const username = this.state.username;
        const password = this.state.password;
        if (username == '' && password == '') {
            this.showError('账号和密码不能为空');
            return;
        }
        if (username == '') {
            this.showError('账号不能为空');
            return;
        }
        if (password == '') {
            this.showError('密码不能为空');
            return;
        }
        const sendOptions = {};
        sendOptions.username = username;
        sendOptions.password = md5(password);
        let json = await userService.login(sendOptions);
        if (json.data) {
            const user = {
                id: json.data.id,
                name: json.data.username,
                phone: json.data.phone,
                email: json.data.email,
                status: json.data.status,
                created_at: json.data.created_at,
                updated_at: json.data.updated_at,
                permissions: json.data.permissions,
                nickname: json.data.nickname,
                role: json.data.role,
                token: json.data.token,
            };
            $dispatch(user, 'user', { expires: 7 });
            localStorage.setItem('user', JSON.stringify(user));
            window.location.href = '/#/homework/list';
        } else {
            this.setState({
                error_msg: json.msg,
            });
        }
    }

    showError(msg) {
        this.setState({
            error_msg: msg,
        });
    }

    change() {
        // this.$dispatch({username:e.value},'login')
    }

    handleSubmit(e) {
        e.preventDefault();
        this.props.form.validateFields(() => {
        });
    }

    userExists(rule, value, callback) {
        if (!value) {
            callback();
        } else {
            setTimeout(() => {
                if (value === 'JasonWood') {
                    callback([new Error('抱歉，该用户名已被占用。')]);
                } else {
                    callback();
                }
            }, 800);
        }
    }

    handleCountPress() {
        this.login();
    }

    handleSecretPress() {
        this.login();
    }

    hideError() {
        this.setState({
            error_msg: '',
        });
        return true;
    }
    render() {
        return (
            <div className="loginContainer">
                <div id="particles-js" className="particleContainer" />
                <div className="loginWrap clearfix">
                    <div className="logoBox " style={{ float: 'left' }}>
                        <img src={logoSrc} width="120" alt="AI学logo" />
                        <p className="tips">AI学<span style={{ marginLeft: '12px' }}>后台管理系统</span></p>
                    </div>
                    <div className="loginBox " style={{ float: 'right' }}>
                        <form autoComplete="off">
                            <div className="inputItem">
                                <Input size="large" onChange={(...arg) => this.handleUsernameChange(...arg)} placeholder="请输入管理系统帐号" onPressEnter={(...arg) => this.handleCountPress(...arg)} />
                            </div>
                            <div className="inputItem">
                                <Input size="large" type="password" onChange={(...arg) => this.handlePasswordChange(...arg)} placeholder="请输入密码" onPressEnter={(...arg) => this.handleSecretPress(...arg)} />
                            </div>
                            <p className="err_msg" style={{ visibility: this.state.error_msg == '' ? 'hidden' : 'visible' }}>{this.state.error_msg}</p>
                            <Button type="primary" className="loginBtn" size="large" onClick={(...arg) => this.login(...arg)}>登录</Button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }
}
export default Login;
