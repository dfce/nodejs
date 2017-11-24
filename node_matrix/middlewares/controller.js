/**
 * ## @desc :: 处理加载控制器文件
 */

const fs = require('fs');

/** ## @desc :: 自动扫描、读取指定目录【默认conreollers】下.js文件  */

function addControllers (router, controllers_dir) {
    var files = fs.readdirSync(`${controllers_dir}`);

    //过滤.js文件
    var js_files = files.filter ( (f) => {
        return f.endsWith('.js');
    });

    //处理每个.js文件：
    for (var f of js_files) {
        //导入js文件
        let mapping = require(`${controllers_dir}/${f}`);
        // console.log('mapping ===>' + f);
        addMapping(router, mapping);
    }
}


/** ## @desc :: 注册路由中间件 */
/** 路径相同是以加载顺序优先执行 */
function addMapping ( router, mapping ) {
   
    for (var url in mapping) {
        if (url.startsWith('POST')) {
            var path = url.substring(5);
            router.post(path, mapping[url]);
        } else if (url.startsWith('GET')) {
            var path = url.substring(4);
            router.get(path, mapping[url]);
        } else {
            console.log(`ERROR :: Invalid URL: ${url}`);
        }
    }
}


function setCtlFun () {
    
}


module.exports = function (dir) {
    var baseUrl = process.cwd();
    let 
        controllers_dir = dir || `${baseUrl}/app/controllers`,
        router = require('koa-router')();

    addControllers( router, controllers_dir);
    return router.routes();
}