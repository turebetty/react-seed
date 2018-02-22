// action types
const USER = 'USER';
const CLEAR_USER = 'CLEAR_USER';

const initData = {
    id: '',
    name: '',
    phone: '',
    email: '',
    status: '',
    created_at: '',
    updated_at: '',
    nickname: '',
    permissions: [],
}

export function userReducer(state = initData, action) {
    if (action.type === USER) {
        const newState = action.payload;
        return { ...state, ...newState };
    }
    if (action.type === CLEAR_USER) {
        return {};
    }
    return state;
}