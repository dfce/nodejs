/**
 * @desc 处理自动加载控制器文件
 * @author { ## Mofei ## }
 */
/** ## @desc 自动扫描、读取指定目录【默认conreoller】下.js文件  */

const fs = require('fs');
const path = require('path');

module.exports = function ( dir ) {
    var baseUrl = process.cwd(); // 默认启动目录

    let 
        controller_dir = dir || path.dirname(__dirname) + '/controller',
        router         = require('koa-router')();

    addController( router, controller_dir );    // 执行加载扫描控制器 
    return router.routes();     //  返回路由
}


/**
 * @desc 扫描控制器
 * @param {router}           路由
 * @param {controller_dir}   指定扫描目录
 */
function addController ( router, controller_dir ) {
    // 同步遍历controller_dir目录
    // var files = fs.readdirSync(`${controller_dir}`);
    var files = fs.readdirSync(`${controller_dir}`);

    // 过滤.js文件
    var js_fiels = files.filter( (f) => {
        return f.endsWith('.js');
    });

    // 处理每个.js文件：
    for ( var f of js_fiels ) {
        // 导入js文件
        let mapping = require(`${controller_dir}/${f}`);
        addMapping( router, mapping );
    }
}

/**
 * @desc 注册路由中间件
 * @todo 扫描路劲下所有方法、以加载顺序优先执行
 * @param {router}  路由
 * @param {mapping} 控制器路径
 */    
function addMapping ( router, mapping ) {
    for ( var url in mapping ) { // 扫描方法
        // console.log('url:==>' + url);
        if ( url.startsWith('POST') ) {
            var path = url.substring(5);
            router.post( path, mapping[url] );
        } else if ( url.startsWith('GET') ) {
            var path = url.substring(4);
            router.get( path, mapping[url] );
        } else {
            console.log(`ERROR : Invalid UL: ${url}`);
        }
    }
}