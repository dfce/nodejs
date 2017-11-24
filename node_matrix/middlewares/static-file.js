/**
 * ## @desc :: 静态资源文件加载处理
 */

const path = require('path');
const mime = require('mime');
const fs   = require('mz/fs');

/**
 * 
 * @param {*} url : 类似 '/static/'
 * @param {*} dir : 类似 __dirname + '/static'
 */
function staticFiles ( url, dir ) {
    return async ( ctx, next ) => {
        let fpath = ctx.request.path;
        // 判断是否以指定的url开头:
        if ( fpath.startsWith( url ) ) {
            // 获取文件完整路径:
            let fp = path.join( dir, fpath.substring(url.length) );
            // 判断文件是否存在:
            if (await fs.exists( fp )) {
                ctx.response.type = mime.lookup( fpath);// 查找文件的mime:
                ctx.response.body = await fs.readFile( fp );// 读取文件内容并赋值给response.body:
            } else {
                ctx.response.status = 404;// 文件不存在:
            }
        } else {
            await next();// 不是指定前缀的URL，继续处理下一个middleware:
        }
    }
}

module.exports = staticFiles;