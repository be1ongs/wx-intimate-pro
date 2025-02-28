
const Wechaty = require('wechaty');
const { Puppeteer } = require('wechaty-puppet-puppeteer');
const onMessage = require('./handers/on-message')
const onLogin = require('./handers/on-login')
const onScan = require('./handers/on-scan')
const onReady = require('./handers/on-ready')
const { addPlatformDbConfig } = require('./common/platformDb')
const { WechatyBuilder, log } = Wechaty;


// 服务器host 默认
//let platformHostUrl = 'http://localhost:8080/api/public/wx-client';
//let applictionToken = '111';
// const initConfig = {
//     PLATFORM_HOST_URL: process.env['PLATFORM_HOST_URL'] || platformHostUrl,
//     APPLICTION_TOKEN: process.env['APPLICTION_TOKEN'] || applictionToken,
// }

// if (!initConfig.APPLICTION_TOKEN || !initConfig.APPLICTION_TOKEN) {
//     console.log("未设置PLATFORM_HOST_URL或APPLICTION_TOKEN，请设置后重试")
//     return;
// }
//初始化平台配置
// addPlatformDbConfig(initConfig)
// get a Wechaty instance


const bot = WechatyBuilder.singleton({
    name: 'pg',
    puppetOptions: {
        uos: true
    },
    puppet: Puppeteer,
})


// emit when the bot needs to show you a QR Code for scanning
bot.on('scan', onScan)
    .on('login', onLogin)
    .on('message', onMessage)
    .on('ready', onReady)
// start the bot
bot.start()
    .then(() => log.info('启动贴心小助手成功', 'Starter Bot Started.'))
    .catch(e => log.error('启动贴心小助手报错', e))