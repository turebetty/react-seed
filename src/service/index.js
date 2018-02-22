import { message } from 'antd';
import cookie from 'js-cookie';
import config from 'src/config';

export const server = {
    _promise(method, version, ...args) {
        return new Promise((resolve, reject) => new Http(method, version, ...args).success(resolve).error(reject));
    },
    get(...args) {
        return this._promise('GET', 'v1', ...args);
    },
    post(...args) {
        return this._promise('POST', 'v1', ...args);
    },
    delete(...args) {
        return this._promise('DELETE', 'v1', ...args);
    },
    put(...args) {
        return this._promise('PUT', 'v1', ...args);
    },
    getV2(...args) {
        return this._promise('GET', 'v2', ...args);
    },
    postV2(...args) {
        return this._promise('POST', 'v2', ...args);
    },
    deleteV2(...args) {
        return this._promise('DELETE', 'v2', ...args);
    },
    putV2(...args) {
        return this._promise('PUT', 'v2', ...args);
    },
};

export function param(obj) {
    const arr = [];
    for (const key in obj) {
        let value = obj[key];
        if (typeof key == 'function') value = value();
        if (value instanceof (Array)) value = value.join(',');
        if (value == null) value = '';
        arr.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    }
    return arr.join('&');
}

export function route_param(s) {
    const search = s || window.location.search.substr(1);
    const obj = {};
    if (!search) {
        return obj;
    }
    search.split('&').forEach((item) => {
        const [key, value] = item.split('=');
        obj[key] = value;
    });
    return obj;
}

export class Http {
    constructor(method, version, ...arg) {
        let base_url = `${config.apiOrigin}/operation/api/${version}`;
        if (version == 'teacher') {
            base_url = `${config.apiOrigin}/teacher/api/v1/teacher`;
        }

        let [url, data] = arg;
        // 判断是否绝对路径
        if (url.indexOf('//') === -1) {
            url = base_url + url;
        }
        if (method == 'GET') {
            const [base, search] = url.split('?');
            const obj = route_param(search);
            data = { ...obj, ...data };
            url = `${base}?${param(data)}`;
        } else {
            data = param(data);
        }

        let xhr = new XMLHttpRequest();
        this.xhr = xhr;
        xhr.open(method, url, true);
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhr.setRequestHeader('sid', 1);
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (version != 'teacher') {
            xhr.setRequestHeader('Token', user.token);
        }

        xhr.withCredentials = true;
        xhr.timeout = 100000;
        xhr.send(data);
        xhr.ontimeout = () => {
        };
        xhr.onreadystatechange = () => {
            if (xhr.readyState != 4) {
                return;
            }
            if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
                try {
                    const json = JSON.parse(xhr.responseText);
                    if (!json) throw new Error('not a json');
                    if (json.status != 10104) {
                        if (json.status == 10103) {
                            window.location.hash = '/login';
                        }
                        if (json.status == 0) {
                            if (this.success_fn) {
                                this.success_fn(json, xhr);
                            }
                        } else if (this.error_fn && typeof this.error_fn === 'function') {
                            this.error_fn(json);
                        } else {
                            // this.error_fn && this.error_fn(xhr.statusText || null, xhr.status, xhr);
                            message.error(json.msg, 2);
                        }
                    } else {
                        message.error('未授权，请登录后重试');
                        cookie.set('user', '');
                        window.location.hash = '/login';
                    }
                } catch (e) {
                    throw e;
                }
            } else {
                if (this.error_fn) {
                    this.error_fn(xhr.statusText || null, xhr.status, xhr);
                }
                message.error('请求失败!', 2);
            }
            xhr = null;
        };
    }

    success(fn) {
        this.success_fn = fn;
        return this;
    }

    error(fn) {
        this.error_fn = fn;
        return this;
    }
}

export function $get(...arg) {
    return new Http('GET', 'v1', ...arg);
}
export function $post(...arg) {
    return new Http('POST', 'v1', ...arg);
}
export function $delete(...arg) {
    return new Http('DELETE', 'v1', ...arg);
}
export function $put(...arg) {
    return new Http('PUT', 'v1', ...arg);
}
export function $get2(...arg) {
    return new Http('GET', 'v2', ...arg);
}
export function $post2(...arg) {
    return new Http('POST', 'v2', ...arg);
}
export function $delete2(...arg) {
    return new Http('DELETE', 'v2', ...arg);
}
export function $put2(...arg) {
    return new Http('PUT', 'v2', ...arg);
}
export function $get3(...arg) {
    return new Http('GET', 'teacher', ...arg);
}
export function $post3(...arg) {
    return new Http('POST', 'teacher', ...arg);
}
export function $delete3(...arg) {
    return new Http('DELETE', 'teacher', ...arg);
}
export function $put3(...arg) {
    return new Http('PUT', 'teacher', ...arg);
}
