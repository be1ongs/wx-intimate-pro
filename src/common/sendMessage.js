const template = require('art-template');
const fs = require('fs');
const path = require('path');
const { FileBox } = require('file-box')
const { Get, Post,PostGetBody } = require('../common/request');
const {delay}=require('../common/index')
/**
 * 发送消息
 * @param {*} that 
 * @param {*} contact 发消息的人
 * @param {*} room room对象(私聊为空)
 * @param {*} messageData 消息data
 */
async function sendMessage(that, contact, room, messageData) {
    try {
        debugger;
        const arrayContent = await analyzeResult(messageData);
        arrayContent.forEach(async (value, index, array) => {
            let r = value;
            if (!r) return;
            if (messageData.messageType == 2) {
                //发送内容为图片
                r = await toFileBox(r);
            }
            if (room) {
                if (contact) {
                    await room.say(r, contact);
                }
                else {
                    await room.say(r);
                }
            }
            else {
                await contact.say(r);
            }
        });
    } catch (e) {
        console.error("发送消息异常:")
        console.error(e);
        return messageData.result;
    }
}



async function testSendMessage(that, contact, room, content, dirPath) {
    try {
        const files = await fs.promises.readdir('E:\\tuzhi');

        for (const file of files) {
            const filePath = path.join('E:\\tuzhi', file);
            const stats = await fs.promises.stat(filePath);

            if (stats.isFile()) {
                console.log(filePath); // 处理文件
                let pic = ["--path", filePath];

                const startTime = Date.now(); // 记录请求开始时间

                // 使用 Promise 来模拟延迟
                await new Promise(resolve => setTimeout(resolve, 1000));

                const delay = Date.now() - startTime; // 计算实际延迟时间
                console.log(`实际延迟时间: ${delay} 毫秒`);

                const response = await PostGetBody('http://127.0.0.1:1224/argv', pic);

                try {
                    console.log(response);
                    if (response.toLowerCase().includes(content.toLowerCase())) {
                        const fileBox = FileBox.fromFile(filePath);
                        contact.say(fileBox);
                    }
                } catch (error) {
                    console.error('解析响应时发生错误:', error);
                }
            } else if (stats.isDirectory()) {
                // traverseDirectoryAsync(filePath); // 递归处理子目录
            }
        }

    } catch (e) {
        console.error("发送消息异常:");
        console.error(e);
        return r.result;
    }
}




async function analyzeResult(messageData) {
    if (messageData.isAnalyze) {
        try {
            //解析
            const result = template.render(messageData.analyzeExpression, { R: JSON.parse(messageData.result) });
            console.log('result', result);
            return stringToJson(result);
        }
        catch (e) {
            return ['语法解析失败,请检查语法是否错误:' + messageData.result];
        }
    }
    return [messageData.result];
}

async function stringToJson(result) {
    try {
        return JSON.parse(result);
    }
    catch (e) {
        console.log('转换JSON出错', e)
        return [result];
    }
}
async function toFileBox(fileUrl) {
    try {
        return FileBox.fromUrl(fileUrl);
    }
    catch (e) {
        console.log('转换FileBox出错', e)
        return fileUrl;
    }
}
module.exports = {
    sendMessage,
    testSendMessage
}