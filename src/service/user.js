import { server } from './index';

/**
 * 登陆
 * @param {object} params { question_ids, homework_id }
 * [question_ids]: 选传, 题目id，多个id用逗号分隔
 * [homework_id]: 选传, 作业id，多个id用逗号分隔
 */
export function login(params) {
    return server.post('/user/login', params);
}