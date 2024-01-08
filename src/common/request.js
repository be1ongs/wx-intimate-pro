const rp = require('request-promise')
/**
 * post请求
 * @param url 请求地址
 * @param data 参数
 * @constructor
 */
// @ts-ignore
async function Post(url, data) {
    try {
        var options = {
            method: 'POST',
            uri: url,
            body: data,
            json: true // Automatically stringifies the body to JSON
        };
        let res = await rp(options);
        return res;
    } catch (e) {
        console.log("post请求请求失败:", e);
        return;
    }
}




async function PostGetBody(url, data) {
    try {
        var options = {
            method: 'POST',
            uri: url,
            body: data,
            json: true // Automatically stringifies the body to JSON
        };

        const response = await rp(options); // 使用 await 等待请求完成
        console.log(response);
        return response;

    } catch (error) {
        console.error("An error occurred:", error);
        // 手动关闭连接（如果需要）
         //rp.abort(); // 通常不需要手动关闭连接，因为 request-promise 会自动处理连接管理
    }
}
/**
 * get请求
 * @param url
 * @returns {Promise<void>}
 * @constructor
 */
async function Get(url) {
    try {
        var options = {
            uri: url,
            headers: {
                'User-Agent': 'Request-Promise'
            },
            json: true // Automatically parses the JSON string in the response
        };
        let res = await rp(options);
        return res;
    } catch (e) {
        console.log("post请求请求失败:", e);
        return;
    }
}

module.exports = {
    Get,
    Post,
    PostGetBody
}
