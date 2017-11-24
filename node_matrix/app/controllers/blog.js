/**
 * ## @desc :: BlogController
 * blog 主页
 */
var basedir = process.cwd();

const BlogController = {
    /**
     * @desc 博客主页
     */
    'GET /blog/index' : async ( ctx, next ) => {

        var viewModel = {title : '我的博客主页'};

        ctx.response.status = 200;
        ctx.render( 'blog/index', viewModel );
    },


    /**
     * @desc 发帖
     */
    'GET /blog/post' : async ( ctx, next ) => {
        const User_model         = require(process.cwd() + `/app/models/UserMod`);
        const PostType_model     = require(process.cwd() + `/app/models/PostTypeMod`);
        const UserModel          = new User_model();
        const PostTypeModel      = new PostType_model();

        var 
            userinfo    = await UserModel.userInfo( ctx ),
            provinces   = userinfo.provinces.split(','),
            province    = await UserModel.getProByAreaId( provinces[0] ),
            city        = await UserModel.getProByAreaId( provinces[1] ),
            area        = await UserModel.getProByAreaId( provinces[2] );

        userinfo.province    = province['area_name'];
        userinfo.city        = city['area_name'];
        userinfo.area        = area['area_name'];

        var postType = await PostTypeModel.getPostType_list();


        var viewModel = {title : '发帖', UserInfo : userinfo, postType : postType};

        ctx.response.status = 200;
        ctx.render( 'blog/post', viewModel );
    },
}
module.exports = BlogController;