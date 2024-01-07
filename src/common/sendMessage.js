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

 function testSendMessage(that, contact, room, content,dirPath) {
    try {
         fs.readdir('E:\\tuzhi', (err, files) => {
            if (err) {
                console.error(err);
                return;
            }

            files.forEach(file => {
                const filePath = path.join('E:\\tuzhi', file);

                fs.stat(filePath, (err, stats) => {
                    if (err) {
                        console.error(err);
                        return;
                    }

                    if (stats.isFile()) {
                        console.log(filePath); // 处理文件
                        let pic = ["--path", filePath];

                        const res = PostGetBody('http://127.0.0.1:1224/argv', pic).then(response => {
                            try {
                                //const data = JSON.parse(response);
                                // 处理 JSON 数据
                                console.log(response);
                                if (response.toLowerCase().includes(content.toLowerCase())){
                                    const fileBox = FileBox.fromFile(filePath);
                                    contact.say(fileBox);
                                }
                            } catch (error) {
                                // 处理解析错误
                                console.error('解析响应时发生错误:', error);
                            }
                        })
                            .catch(error => {
                                // 处理请求错误
                                console.error('请求时发生错误:', error);
                            });

                        delay(1000);
                    } else if (stats.isDirectory()) {
                       // traverseDirectoryAsync(filePath); // 递归处理子目录
                    }

                });
            });
        });

    } catch (e) {
        console.error("发送消息异常:")
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