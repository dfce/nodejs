/**
 * ## @desc :: UserController
 */
var basedir = process.cwd();
const userModel = require(`${basedir}/app/models/user`);

const User_model = require(process.cwd() + `/app/models/UserMod`);
const UserModel = new User_model();



const UserController = {
    //*****************************************************************************************/
    //                              测试内容：：
    //*****************************************************************************************/
    'GET /user/welcome' : async ( ctx, next ) => {
        const crypto_lib = require(process.cwd() + '/app/libraries/crypto_lib');
     

        var viewModel = {title:'用户登陆页'};
        console.log(viewModel);

        ctx.response.body = '测试页数据 ：' + viewModel.title + ' : ; ' + JSON.stringify(viewModel);
        
        // ctx.response.status = 200;
        // ctx.render( 'user/welcome', viewModel );
    },

    'GET /user/test' : async ( ctx, next ) => {
        console.log('test:');
        // ctx.response.redirect('/user/welcome');

        // ctx.response.body = '测试页数据 ：test页';

        const Upload = require(process.cwd() + `/app/models/Upload`);
         var file_img = Upload.fsReadImg( ctx );

         ctx.response.body = '11111<img scr="/public/static/bootstrap/img/p3.jpg">';
    },
    //*****************************************************************************************/
    //*****************************************************************************************/

    /**
     * @desc :: UserIndex 用户中心
     * @param {*} ctx 
     * @param {*} next 
     */
    'GET /user/index' : async ( ctx, next ) => {
        console.log(JSON.stringify(ctx.session, null, 2));
        if ( ctx.session.userInfo ) {
        var 
            userinfo    = await UserModel.userInfo( ctx ),
            provinces   = userinfo.provinces ? userinfo.provinces.split(',') : ''.split(','),
            province    = await UserModel.getProByAreaId( provinces[0] ),
            city        = await UserModel.getProByAreaId( provinces[1] ),
            area        = await UserModel.getProByAreaId( provinces[2] );

        userinfo.province    = province['area_name'];
        userinfo.city        = city['area_name'];
        userinfo.area        = area['area_name'];


        var viewModel = {title : '个人中心', UserInfo : userinfo};

        ctx.response.status = 200;
        ctx.render( 'user/index', viewModel );
        } else {
            ctx.response.redirect('/user/welcome');
        }
    },

    /**
     * @desc :: UserInfo 用户信息查看、修改
     */
    'GET /user/info' : async ( ctx, next ) => {
       
        var res = await UserModel.userInfo( ctx );
        var viewModel = {title : '个人中心info', UserInfo : res};

        ctx.response.status = 200;
        ctx.render( 'user/info', viewModel );
    },


    /**
     * @desc :: getArea 返回中国省市区县数据
     */
    'POST /user/getarea' : async ( ctx ) => {
        var result = {success : false, msg : ''};
        var res = await UserModel.getProvinces( ctx );
        
        if (res.length){
            result.success = true;
            result.res = res;
        }
      
        ctx.response.body = result;
    },


    /**
     * @desc :: UserReg 注册
     * @param {*} ctx 
     * @param {*} next 
     */
    'POST /user/singin' : async ( ctx, next ) => {
        var res = await UserModel.userSingn( ctx );
        console.log('res : ' + res + '; ') + JSON.stringify(res);
        if (res.res && res.userinfo) {
            var session = await UserController.setSESSION( ctx, res.userinfo );
            ctx.session.userinfo = session;
        } 
        ctx.response.body = res;
    },


    /**
     * @desc :: UserUpDate
     * @param {ctx} ctx
     * @return {Object} {success : boolean, msg : String}
     */
    'POST /user/upDate' : async ( ctx, next ) => {

        const Upload = require(process.cwd() + `/app/models/Upload`);
        var upload_res = await Upload.save( ctx );
 
        var res = await UserModel.userUpdate( ctx, upload_res );
        ctx.response.body = res;
    },


    /**
     * @desc :: UserLogIn 登录
     * @param {*} ctx 
     * @param {*} next 
     */
    'POST /user/login' : async ( ctx, next ) => {

        let userRes = await UserModel.userLogin( ctx );
        var isLogin = false;
        if( userRes ) {
            var session = await UserController.setSESSION( ctx, userRes );
            ctx.session.userinfo = session;
            isLogin = true;
        }
        ctx.response.body = {isLogin : isLogin};
    },

    /**
     * @desc :: UserLogOut 退出
     * @param {*} ctx 
     * @param {*} next 
     */
    'POST /user/logout' : async ( ctx, next ) => {
        delete ctx.session; // ctx.session = null;
        ctx.response.body = {isLogin : true};
    },

    /**
     * @desc :: Session
     * @param {*} ctx 
     * @param {*} opts 
     */
    async  setSESSION ( ctx, opts ) {
        var d = new Date();
        var UserSession_data = {
            user_name : opts.user_name,
            name : opts.name,
            login_time : d.getTime(),
            login_ip : ctx.ip,
            last_login_time : '',
            last_login_ip : ''
        };
        return UserSession_data;
    }

}

/**
 * @desc :: UserController
 */
module.exports = UserController;


// function getClientIp(req) {
//     return req.headers['x-forwarded-for'] ||
//     req.connection.remoteAddress ||
//     req.socket.remoteAddress ||
//     req.connection.socket.remoteAddress;
// };

// function getClientIp1(req){
//     var ipAddress;
//     var headers = req.headers;
//     var forwardedIpsStr = headers['x-real-ip'] || headers['x-forwarded-for'];
//     forwardedIpsStr ? ipAddress = forwardedIpsStr : ipAddress = null;
//     if (!ipAddress) {
//     ipAddress = req.connection.remoteAddress;
//     }
//     return ipAddress;
// }