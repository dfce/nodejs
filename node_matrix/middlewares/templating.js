/**
 * ## @desc :: 添加模板【render】处理
 */

const nunjucks = require('nunjucks');

function createEnv ( path, opts ) {
    var 
        autoescape = opts.autoescape === undefined ? true : opts.autoescape,
        noCache = opts.noCache || false,
        watch = opts.watch,
        throwOnUndefined = opts.throwOnUndefined || false,
        env = new nunjucks.Environment(
            new nunjucks.FileSystemLoader ( path || 'views', {
                noCache : noCache,
                watch : watch
            }),{
                autoescape : autoescape,
                throwOnUndefined : throwOnUndefined
            }
        );

    return env;    
}


function templating ( path, opts ) {
    //创建nunjucks 的 env 对象：
    var env = createEnv( path, opts );

    return async ( ctx, next ) => {

        /** ## @desc :: 给ctx绑定render 函数  */
        ctx.render = ( view, model ) => {
            /** ## @desc ::  请求状态处理*/
            if (ctx.status !== 200) {
                view = `common/${ctx.status}`;
            }

            console.log(`path: ==> ${path} ; view: ==> : ${view} ;`);
            //绑定session::
            console.log('Session :: user_name : =>' + (ctx.session.userinfo !== undefined ? ctx.session.userinfo.user_name : 'Session : not set'));
        
            if (ctx.session.userinfo === undefined ||　ctx.session.userinfo == null) {
                ctx.session.view = 0;
            }else{
                ctx.session.view += 1;
            }
            model.userinfo = ctx.session.userinfo;
            //把render后的内容赋值给response.body:
            ctx.response.body = env.render( `${view}.html`, Object.assign( {}, ctx.state || {}, model || {} ) );
            //设置Content-type:
            ctx.response.type = 'text/html';
        };
        //继续处理请求：
        await next();
    };
}

module.exports = templating;