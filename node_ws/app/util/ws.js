const WebSocket = require('ws');
const config = require('../config/config')
const Store = require("../middleware/store");

const WebsocketServer = WebSocket.Server;

const wss = new WebsocketServer({port : 3000});
const store = new Store();

/**
 * msgFormation 消息缓存队列；后续使用 redis 替换
 * key => code 唯一绑定标识
 * val => 数据组
 */
var msgFormation = {};

wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
        client.send(data);
    });
};
wss.on('connection', function (ws) {
    //console.log(`[SERVER] connection()`);

    ws.on('close', function(d) {
        console.log(d + 'close 客户端关闭页面');
    });
    ws.on('message', async function (message) {
        console.log(`[SERVER] Received: ${message}`);
        var obj = eval('(' + message + ')')

        /**
         * 数据消息推送
         */
        var msgData = await getMsg( obj );
        msgFormation = JSON.parse(msgData.data);
        // console.log(JSON.parse(msgData.data, null, 2));
        console.log('send--------------');
        
        if ( obj.type == 'pull' ) {
            ws.send(JSON.stringify(msgFormation));
        } else if ( obj.type == 'push' ) {
            wss.broadcast(JSON.stringify(msgFormation))
        }
    });
});

/**
 * @todo:: Ws 数据推送方法
 * @param {type} 【push、pull】
 * @param {msg}  【数据体{user : MD5(openid + actKey), data {}}】
 */
async function getMsg( message ){
    console.log('message===>1' + JSON.stringify(message, null, 2));
    var redisdata = '';
    switch ( message.type ) {
        case 'push':
            var data = await getAuditActList ( message.actKey );
            const redisKey_push = await store.set({data : data});
            redisdata = await store.get(redisKey_push);
        break;

        case 'pull': // 数据拉取、写入消息队列【code 为 key】
            // msgFormation[message.actKey] = await getAuditActList ( message.actKey );
            var data = await getAuditActList ( message.actKey );

            var redisKeycode = message.actKey;
            
            //const redisKey = await store.set({ code :redisKeycode, data : data});
            const redisKey = await store.set({data : data});
            redisdata = await store.get(redisKey);


            // console.log( 'redisKeycode:=>' + redisKeycode + 'redis<222==========' + JSON.stringify(redisdata, null, 2));

        break;
        case 'delete': // 移除已处理过的数据【code、room_posture_audit_id】
            // console.log('移除前====》' + JSON.stringify(msgFormation, null, 2));
            rmComplete( message.code, message.roomId );
            // console.log('移除后====》' + JSON.stringify(msgFormation, null, 2));
        break;
    }


    return redisdata
}

/**
 * 拉取数据列表
 * @param {*} code 
 */
function getAuditActList ( code ) {
    let request = require('request');

    // 使用 Promise 协议 修改异步为同步回调
    // code = '832290';
    var url =  config.api.url + 'Posture/getAuditActList/act_code/'+ code +'/etag/0';

    return new Promise (( resolve, reject ) => {
        request({
            url: url,
            method: "GET",
            json: false,
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
}

/**
 * @todo:: 消息队列数据 移除已处理过的数据【code、room_posture_audit_id】
 * @param 
 */
function rmComplete ( code, roomId ) {

    if ( msgFormation[code] ) {
        var userData = JSON.parse(msgFormation[code]);//.data;

        // console.log('移除前====》' + JSON.stringify(userData, null, 2));
        var flag = userData.data[0] ? true : false;
        var i = 0;

        var html = '';
        while ( flag ) {
            var userRes = eval(userData.data[i])
            // console.log(userRes.room_posture_audit_id + '-------------移除 ？ ---------' + roomId);
            if ( userRes.room_posture_audit_id == roomId ) {
                delete userData.data[i]
            }
            i++;
            if(!userData.data[i]) flag = false;
        }

        // console.log('移除后====》' + JSON.stringify(userData, null, 2));
        msgFormation[code] = userData;
    }
}

console.log('ws server stared ad port 3000...');