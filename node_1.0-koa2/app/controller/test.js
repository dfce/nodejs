/**
 * @desc 测试
 */

const TestController = {
    /**
     * @desc 测试wap 页面
     * @todo {/test/apphtml}
     */
    'GET /test/apphtml' : ( ctx, next) => {

        console.log(ctx);
        var viewModel = {title : '向向AR:验证活动码', UserInfo : {}};
        ctx.status = 200;
        ctx.render('act/apptest', viewModel );
    },
}

module.exports = TestController;