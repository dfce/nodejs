/**
 * ## @desc :: HomeController
 */
const HomeController = {
    //官网首页：
    'GET /home/index' : async ( ctx, next ) =>{
        var viewModel = {title:'官网首页'};
        ctx.response.status = 200;
        ctx.render( 'home/welcome', viewModel );
    }
}


module.exports = HomeController;