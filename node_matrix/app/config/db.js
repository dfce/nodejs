var config = {
    // 开发环境
    development : {
        connectionLimit      : 10,
        multipleStatements   : false,
        debug                : false,
        dialect              : 'mysql',
        database             : 'matrix',
        username             : 'root',
        password             : '123456',
        host                 : '127.0.0.1',
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
        password             : '123456',
        host                 : '127.0.0.1',
        port                 : 3306
    }
};

module.exports = config;