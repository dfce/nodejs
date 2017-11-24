/**
 * @desc :: PostModel::
 * @author :: Mofei
 */

const DBModel = require(process.cwd() + `/middlewares/DB-table`);

class PostModel extends DBModel {
    constructor () {
        super('post');
    }


    /**
     * @desc :: 获取帖子类型数据
     */
    async getPostType () {
        // let 
        // var postType = await ;
        // return postType;
    }
}

module.exports = PostModel;