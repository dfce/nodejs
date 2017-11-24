/**
 * @desc IndexController
 * @todo 微信端验证接口
 */

 const wx = require('../util/wx');


 const IndexController = {
    'GET /' : async ( ctx, next ) => {
        const result = wx.auth(ctx)
        if (result) {
            ctx.body = ctx.query.echostr
        } else {
            ctx.body = { code: -1, msg: "You aren't wechat server !"}
    }
    },
    'POST /' : ( ctx, next ) => {
        let msg,
        MsgType,
        result
    
        msg = ctx.req.body ? ctx.req.body.xml : ''

        if (!msg) {
            ctx.body = 'error request.'
            return;
        }
        
        MsgType = msg.MsgType[0]

        switch (MsgType) {
            case 'text':
                msg.Content = '仅为测试消息';
                result = wx.message.text(msg, msg.Content)
                break;
            default: 
                result = 'success'
        }
        
        // console.log(JSON.stringify(result, null, 2));
        ctx.status = 200

        ctx.res.setHeader('Content-Type', 'application/xml')
        ctx.res.end(result)
        }
 }

 module.exports = IndexController;