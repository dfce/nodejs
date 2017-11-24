/**
 * @desc actController
 * @todo 处理活动码控制器
 */

 let request = require('request');
 let config = require('../config/config');
 let wsservice = config.api.wsservice

 const ActController = {
     /**
      * @desc 活动验证码页面
      * @param {ctx}
      * @param {next}
      */
     'GET /actkey' : async ( ctx, next ) => {

        // 通过微信 redirect get传递code 获取用户 openId
        let weChatCode = ctx.query.code || '';
        let weChatUserInfo = await ActController.getWeCahtUserInfo( weChatCode );

        // 测试数据
        weChatUserInfo.openid = 'test';

        if ( weChatUserInfo.openid && weChatUserInfo.openid != '' ){
            let openId = weChatUserInfo.openid;
            var userinfo = {}
            userinfo.user = openId;
            var viewModel = {title : '向向AR:验证活动码', UserInfo : userinfo};

            ctx.response.status = 200;
            ctx.render( 'act/actkey', viewModel );
        }else{

            ctx.body = weChatUserInfo.errmsg;
        }
     },

     /**
      * @desc 加载WS客户端 拉取待审核数据列表
      * @param {openId} user
      * @param {actKey} code
      */
     'GET /actlist' : async ( ctx, next ) => {
        let userinfo = {};
        let clientData = {user : ctx.query.user || '', actKey :  ctx.query.actKey || '', imgpath : config.api.imgpath}

        var viewModel = {title : '向向AR:教练审核', UserInfo : userinfo, clientData : clientData, wsservice : wsservice};

        ctx.response.status = 200;
        ctx.render( 'act/actkey_toexamine', viewModel );
     },

     /**
      * @desc 更新 列表页【Ws 刷新列表数据】 
      * @param {ctx}
      * @param {next}
      */
     'POST /actlist' : async ( ctx,next ) => {
        var url = config.api.url + 'Posture/updateAudit/room_posture_audit_id/'+ ctx.request.body.r_id +'/audit_status/'+ ctx.request.body.status + '/code/' + ctx.request.body.code;
        var res = await ActController.getPhpData(url);

        ctx.status = 200;
        ctx.body = res;
     },


     /**
      * @desc 接收 PHP 数据 推送 Ws消息更新 
      */
      'GET /pulldata' : ( ctx, next ) => {
            var msgData = {
                code : ctx.query.code || '',
                roomId : ctx.query.roomId || '',
                type : ctx.query.type || '',
            }

            /**
             * @todo WebSocket
             */
            
            const WebSocket = require('websocket');
            const WebSocketClient  = WebSocket.client;
            const wss = new WebSocketClient ();
            var client = new WebSocketClient();
    
            client.on('connectFailed', function(error) {
                console.log('Connect Error: ' + error.toString());
            });
            
            client.on('connect', function(connection) {
                //console.log('WebSocket Client Connected');
                connection.on('error', function(error) {
                    console.log("Connection Error: " + error.toString());
                });
                connection.on('close', function() {
                    console.log('echo-protocol Connection Closed');
                });
                connection.on('message', function(message) {// 不做处理 message 事件
                    // if (message.type === 'utf8') {
                        // console.log("Received: '" + JSON.stringify(message, null, 2) + "'==============");
                    // }
                });
                
                connection.send("{'user' : 'test-openid', 'actKey' : "+ msgData.code +", 'type' : 'push'}");

            });

            client.connect('ws://'+ wsservice, 'echo-protocol');
            ctx.status = 200;
            ctx.body = '';

            /**
             * @todo WS Client 方式查询中 【暂用 WebSocket Client 替代 或改用 socket.io】
             */
      },
     
     /**
      * @desc 同步获取php 处理状态
      * @param {url}
      * @return {obj}
      */
      getPhpData : ( url ) => {
        // 使用 Promise 协议 修改异步为同步回调
        return new Promise (( resolve, reject ) => {
            request({
                url: url,
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify({})
            }, function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    resolve( body );
                }else{
                    reject( error );
                }
            }); 
        })
      },

    /**
     * @desc 获取微信用户信息
     * @param {code} string
     * @param {boolean} isInfo
     * @return {str or obj} {openid} or {userInfo}
     */
     getWeCahtUserInfo : ( code,isInfo = false ) => {
        let requestData = {};
        let url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${config.wx.appid}&secret=${config.wx.secret}&code=${code}&grant_type=authorization_code`;

        // 使用 Promise 协议 修改异步为同步回调
        return new Promise (( resolve, reject ) => {
            request({
                url: url,
                method: "GET",
                json: true,
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify(requestData)
            }, function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    resolve( body );
                }else{
                    reject( err );
                }
            }); 
        })
     }
     
 }
 

 module.exports = ActController;