var config = {
    // 开发环境
    development : {
        connectionLimit      : 10,
        multipleStatements   : false,
        debug                : false,
        dialect              : 'mysql',
        database             : 'matrix',
        username             : 'root',
        password             : 'd253978241',//'123456',
        host                 : '101.132.39.151',//'localhost',
        port                 : 3306
    },
    // 生产环境
    production : {
        connectionLimit      : 10,
        multipleStatements   : false,
        debug                : false,
        dialect              : 'mysql',
        database             : 'matrix',
        username             : 'root',
        password             : 'd253978241',//'123456',
        host                 : '101.132.39.151',//'localhost',
        port                 : 3306
    },
    serviceprot : 8081,
};

module.exports = config;