/**
 * @desc :: UserModel::
 * @author :: Mofei
 */

const DBModel = require(process.cwd() + `/middlewares/DB-table`);

class UserModel extends DBModel {
    constructor () {
        super('user_users');
    }

    /**
     * @desc :: 用户登录查询处理：：
     * @param {ctx.request} ctx 
     * @return {Object or Array} 返回查询结果
     */
    async userLogin ( ctx ) {
        // 密码加密
        const crypto_lib = require(process.cwd() + '/app/libraries/crypto_lib');       
        var password = ctx.request.body.password || '';
        password = crypto_lib.hmac(password);

        var where = {
            user_name : ctx.request.body.userName || '',
            password : password
        };

        return await this.getList(null, where, null, null, 1);       
    }


    /**
     * @desc ::获取挡前登陆用户信息
     * @param {ctx.request} ctx 数据请求
     * @return {Object}
     */
    async userInfo ( ctx ) {
        var 
            userInfo = ctx.session.userinfo,
            user_name = userInfo !== undefined ? userInfo.user_name : '';

        let sql = `SELECT 
                user_name,email,nick_name,telephone,
                sex,card_id,address,qq,birthday,provinces,briefing,pic 
                FROM user_users 
                WHERE user_name='${user_name}'`;
        return await this.query( sql );    
    }

    /**
     * @desc :: 用户注册数据处理
     * @param {ctx.request} ctx 
     * @return {Object} 返回 {res : false、true, msg : ''};
     */
    async userSingn ( ctx ) {
        let res = {res : false , msg : ''};
        var data = {
                    user_name : ctx.request.body.userName || '',
                    password  : ctx.request.body.password,
                    repass    : ctx.request.body.repass || '',
                    telephone : ctx.request.body.phoneNum || '',
                    email     : ctx.request.body.eMail || ''
        };
        if ( data.password == data.repass) {
            // isReg ::
            var where = {user_name : data.user_name};
            var isReg = await this.getList( 'user_name', where);

            if ( !isReg ) {
                // 密码加密
                delete data.repass;
                const crypto_lib = require(process.cwd() + '/app/libraries/crypto_lib');      
                data.password = crypto_lib.hmac(data.password);

                var singinRes = await this.insert( data );

                if ( singinRes.insertId ) { 
                    res.res = true;
                    delete data.password;
                    res.userinfo = data;
                } else { 
                    res.msg = singinRes.message
                }
            } else {
                res.msg = '账号已存在，请换一个';
            }
        } else {
            res.msg = '两次密码不一致';
        }
        return res;
    }


    async userUpdate ( ctx, upload_res ) {
        let res = {success : false , msg : ''};
        if ( !upload_res.RtnSuc ) {
            res.msg = upload_res.RtnMsg;
        } else {

            var ctx_body = ctx.request.body.fields;
            var data = {
                        nick_name    : ctx_body.full_name || '',
                        password     : ctx_body.password,
                        repass       : ctx_body.repass || '',
                        email        : ctx_body.email || '',
                        telephone    : ctx_body.telephone || '',
                        sex          : ctx_body.sex || '',
                        provinces    : ctx_body.provinces || '',
                        briefing     : ctx_body.briefing || ''
            };
            if(upload_res.Result) data.pic = upload_res.Result.join(',');

            if ( data.password == data.repass) {
                // 密码加密
                delete data.repass;                 
                if ( data.password ) {
                    const crypto_lib = require(process.cwd() + '/app/libraries/crypto_lib');
                    data.password = crypto_lib.hmac(data.password);
                } else {
                    delete data.password;
                } 

                var upRes = await this.update( data, {user_name : ctx.session.userinfo.user_name} );

                if ( upRes.affectedRows ) { 
                    res.success = true;
                } else { 
                    res.msg = upRes.message
                }
            } else { res.msg = '两次密码不一致'; }
        }
        
        return res;
    }


    async getProByAreaId ( area_id ) {
        if ( !area_id ) return '';
        let sql = 'SELECT area_name FROM m_sys_areas WHERE area_id = ' + area_id;
        return await this.query(sql);
    }

    /**
     * @desc :: 返回中国 省市区县数据
     * @param {ctx} ctx 
     * @return {Object or FALSE}
     */
    async getProvinces ( ctx ) {

        var data = {area_id : parseInt(ctx.request.body.area_id) || 0};
        if (!data.area_id) return false;
        let sql = 'SELECT * FROM m_sys_areas WHERE parent_id = ' + data.area_id;

        return await this._query(sql);
    }

    // static async getUserList( conditions, options = null ) {
    //     let result = await DBModel.select( 'user_users', conditions, options );
    //     return result;
    // }

    // static async add ( options ) {
    //     let result = await DBModel.insert( 'user_users', options );
    //     return result;
    // }


    // static async update ( where, options ) {
 
    //     let result = await DBModel.update( 'user_users', where, options );
    //     return result;
    // }

    // static async delete ( where, options ) {
 
    //     let result = await DBModel.delete( 'user_users', where );
    //     return result;
    // }
}

module.exports = UserModel;