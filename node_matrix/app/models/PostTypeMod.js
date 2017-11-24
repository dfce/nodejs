/**
 * @desc :: PostTypeModel::
 * @author :: Mofei
 */

const DBModel = require(process.cwd() + `/middlewares/DB-table`);

class PostTypeModel extends DBModel {
    constructor () {
        super('post_type');
    }


    /**
     * @desc :: 获取帖子类型数据
     */
    async getPostType_list () {
        return await this.getList();
    }
}

module.exports = PostTypeModel;