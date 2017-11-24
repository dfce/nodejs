/**
 * ## @desc :: 项目入口文件
 */

const Koa = require('koa');

const session = require('koa-session2');
const Store = require("../middlewares/store");
// const requestIp = require('request-ip');
const app = new Koa();

let port = 8081;


// const bodyParser = require('koa-bodyparser');

const koaBody = require('koa-body')({multipart : true});
//formLimit : "5mb", jsonLimit : "5mb", textLimit : "5mb" 

/** ## @desc :: 【导入middleware中间件】*/
const controller = require('../middlewares/controller');
const templating = require('../middlewares/templating');

const isProduction = process.env.NODE_ENV === 'production';

// koa-seassion2::
// redis::
app.keys = ['davinci-12354'];
app.use(session({
    key : "sessionId",
    store : new Store(),
    overwrite: true,
    signed: true,
    maxAge : 120*60*1000
}));

// 本地储存::
// app.keys = ['davinci-12354'];
// app.use(session({
//     key: 'koa-sessionId',
//     maxAge: 20000,//2*60*1000,
//     overwrite: true,
//     httpOnly: true,
//     signed: true,
//     rolling: false,
// }, app));



// log request URL::
app.use( async ( ctx, next ) => {
    let ctx_method = ctx.request.method, ctx_url = ctx.request.url;
    // console.log(`${__filename} ： Process ={ method: ==> ${ctx_method} ;   url: ==> ${ctx_url} ...}`);

    //关闭 nodejs 默认访问 favicon.ico
    if ( !ctx_url.indexOf ('favicon.ico')) {
        console.log('关闭nodejs 默认访问 favicon.ico... ...');
        return;
    }

    var 
        start = new Date().getTime(),
        execTime;
    await next();

    execTime = new Date().getTime() - start;

    // console.log(`app Response time : => {${execTime}}`);
    ctx.response.set('X-Response-Time', `${execTime}ms`);

    // requestIp::
    // const clientIp = requestIp.getClientIp(ctx.request); 
    // console.log('clientIp :===>' + clientIp);
});

// static fiel support:
if ( !isProduction ) {
    let staticFills = require('../middlewares/static-file');
    app.use(staticFills( `/public/static/`,  process.cwd() + `/public/static`));
}

// parser request body:
// app.use(bodyParser());
app.use(koaBody);

// add nunjucks as view:
app.use(templating(`${__dirname}/views`, {
    noCatch : !isProduction,
    watch : !isProduction
}));

// controller:
app.use(controller());


app.listen(port);

console.log(`${__filename} ： run app started at prot : ${port}`);