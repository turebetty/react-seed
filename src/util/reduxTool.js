export function $dispatch(newstate = {}, type = '') {
    window.store.dispatch({ type, newstate });
}
export function $getState(reducer) {
    return window.store.getState()[reducer];
}