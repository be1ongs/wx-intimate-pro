const template = require('art-template');
const fs = require('fs');
const path = require('path');
const { FileBox } = require('file-box')
const { Get, Post,PostGetBody } = require('../common/request');
const {delay}=require('../common/index')

// 连接 MongoDB
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/ocr-result', { useNewUrlParser: true, useUnifiedTopology: true });

// 创建 Image 模型
const ImageModel = mongoose.model('Image', {
    keyword: String,
    filePath: String,
    ocrResult: String,
});


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



// 调用 OCR 服务
async function callOcrService(filePath) {
    try {
        const pic = ["--path", filePath];
        const response = await PostGetBody('http://127.0.0.1:1224/argv', pic);

        // 直接将返回的数据作为 OCR 结果
        const ocrResult = response;

        if (ocrResult) {
            // 如果成功获取到 OCR 结果，则返回
            return ocrResult;
        } else {
            console.error('OCR 服务返回的数据无效:', response);
            // 如果返回的数据无效，抛出错误
            throw new Error('Invalid OCR response');
        }
    } catch (error) {
        console.error('调用 OCR 服务时发生错误:', error);
        // 如果发生错误，抛出异常
        throw error;
    }
}

async function findAndReturnFilePaths(content) {
    const images = await ImageModel.find({  $or: [
            { keyword: { $regex: content, $options: 'i' } },
            { filePath: { $regex: content, $options: 'i' } },
            { ocrResult: { $regex: content, $options: 'i' } }
        ] });
    const filePaths = images.reduce((uniquePaths, image) => {
        if (!uniquePaths.includes(image.filePath)) {
            uniquePaths.push(image.filePath);
        }
        console.log(`Found matched image for keyword "${content}": ${image.filePath}`);
        return uniquePaths;
    }, []);

    return filePaths;
}

// 测试发送消息函数
async function testSendMessage(that, contact, room, content, dirPath) {
    try {
        // 查询数据库看是否已经有关键字对应的图片信息
        console.log(`查询数据库关键字: ${content}`);
        const imagesPath = await findAndReturnFilePaths(content);

        console.log('Database Query Result:', imagesPath);

        for (const imagepath of imagesPath) {
                const fileBox = FileBox.fromFile(imagepath);
                await contact.say(fileBox);
                return;
            }

        // 如果数据库中没有缓存，则继续处理文件
        const files = await fs.promises.readdir(dirPath);

        // 处理文件，如果已经有缓存则直接返回，否则调用 OCR 服务
        for (const file of files) {
            const filePath = path.join(dirPath, file);
            await processFile(filePath, content, contact);
        }
    } catch (e) {
        console.error('发送消息异常:');
        console.error(e);
        return e.result; // 这里使用 e.result 来获取错误信息
    }
}



// 处理文件，包括 OCR 服务调用、结果缓存和发送消息
async function processFile(filePath, content, contact) {
    try {
        const stats = await fs.promises.stat(filePath);

        if (stats.isFile()) {
            console.log(filePath); // 处理文件

            const startTime = Date.now(); // 记录请求开始时间

            // 使用 Promise 来模拟延迟
            await new Promise(resolve => setTimeout(resolve, 1000));

            const delay = Date.now() - startTime; // 计算实际延迟时间
            console.log(`实际延迟时间: ${delay} 毫秒`);

            // 调用 OCR 服务
            const ocrResult = await callOcrService(filePath);

            // 这里使用 ocrResult 来进行后续操作，比如发送消息
            console.log('OCR Result:', ocrResult);

            if (ocrResult.toLowerCase().includes(content.toLowerCase())) {
                // 保存结果到数据库
                await ImageModel.create({ content, filePath, ocrResult });

                const fileBox = FileBox.fromFile(filePath);
                await contact.say(fileBox);  // 发送消息
            }
        } else if (stats.isDirectory()) {
            // traverseDirectoryAsync(filePath); // 递归处理子目录
        }
    } catch (error) {
        console.error('处理文件时发生错误:', error);
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