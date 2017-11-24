/**
 * @desc :: Connection 创建数据连接
 * @author { ## Mofei ## }
 * @return {Pool}
 */
    const dbConf = require(process.cwd() + `/app/config/db`);


    const config = dbConf['production'];
    const mysql = require('mysql');

    class Connection {
        constructor (config) {
            this.config = config;
        }

        getPools () {
            let pool = mysql.createPool({
                connectionLimit : this.config.connectionLimit,           //一次创建的最大连接数。（默认值：10,  
                host                : this.config.host,                  //连接的数据库的主机名
                // port             ：'',                                //要连接的端口号。（默认值：3306）
                // localAddress     ：'',                                //用于TCP连接的源IP地址。（可选的）
                // socketPath       ：'',                                //连接到unix域套接字的路径。在使用时host 和port被忽略。
                user                : this.config.username,
                password            : this.config.password,
                database            : this.config.database,
                debug               : this.config.debug,                //将协议详细信息打印到stdout 默认：{false}
                multipleStatements  : this.config.multipleStatements    //是否支持多个sql语句连接查询 默认：{false}
            });
            return pool;
        }
    }



/**
 * @desc :: DB_table MiddleWare
 * @return {Object} DB_table
 */
    class DB_table {

        constructor (table) {
            console.log(`tableName  ===> : ${table}`);
            this.table = table || '';
        }

        /**
         * @desc :: _query
         * @param {String} sql 
         * @param {Array or Object} values 
         */
        async _query ( sql, values ) {
            const Pool = new Connection(config).getPools();
            
            sql = sql || this.sql;

            // console.log('fields：' + this.fields);
            // console.log('where：' + this.where);
            // console.log('order：' + this.order);
            // console.log('group：' + this.group);
            // console.log('limit：' + this.limit);
            // console.log('offset：' + this.offset);
            console.log(`sql : --> ${sql}`);

            return new Promise ( ( resolve, reject ) => {
                Pool.getConnection ( ( err, connection ) => {
                    if ( err ) {
                        resolve( err );
                    } else {
                        connection.query ( sql, values, (err, rows ) => {
                            if ( err ) {
                                reject( err ); 
                            } else {
                                resolve( rows );
                            }
                            connection.release();
                        })
                    }
                 })
            })
        }


        /**
         * @desc :: query
         * @param {String} sql 
         * @param {Array or Object} values 
         */
        async query ( sql ) {
            let result = await this._query( sql );

            if (!(Array.isArray(result) && result.length > 0)) result = null;
            if (Array.isArray(result) && result.length == 1) result = result[0];

            return result;
        }

        /**
         * @desc :: function select
         * @param {String、Object、Array} fields 
         * @param {String、Object、Array} where 
         * @param {String、Object、Array} order 
         * @param {String、Object、Array} group 
         * @param {Number} limit 
         * @param {Number} offset 
         * @return {Object} fatchRows
         */
        async select ( fields, where, order, group, limit, offset ) {

            this._fields( fields );
            this._anWhere( where );
            this._order( order );
            this._group( group );
            this._limit( limit );
            this._offset( offset );

            this.sql = this.fields + this.table + this.where + this.order +  this.group + this.limit + this.offset;

            return await this._query();
        }

        /**
         * @desc :: function getList 查询数据返回 数组[[],[]]，为一时 返回[] 
         * @param {String、Object、Array} fields 
         * @param {String、Object、Array} where 
         * @param {String、Object、Array} order 
         * @param {String、Object、Array} group 
         * @param {Number} limit 
         * @param {Number} offset 
         * @return {Object or Array} 
         */
        async getList ( fields, where, order, group, limit, offset ) {

            this._fields( fields );
            this._anWhere( where );
            this._order( order );
            this._group( group );
            this._limit( limit );
            this._offset( offset );

            this.sql = this.fields + this.table + this.where + this.order + this.group + this.limit + this.offset;

            let result = await this._query();

            if (!(Array.isArray(result) && result.length > 0)) result = null;
            if (Array.isArray(result) && result.length == 1) result = result[0];

            return result;
        }

        async count (  fields, where, group ) {

            this._fields( fields );
            this._anWhere( where );
            this._group( group );

            this.sql = 'SELECT COUNT(1) count FROM (' + this.fields + this.table + this.where + this.group + ') AS c';
            return await this._query();
        }


        /**
         * @desc :: function insert 数据插入
         * @param {Array or Object} data 
         * @return {Object} {"fieldCount":0,"affectedRows":1,"insertId":1,"serverStatus":2,"warningCount":0,"message":"","protocol41":true,"changedRows":0}
         */
        async insert ( data ) {
            this._insert_string( data );

            let sql = `INSERT INTO ` + this.table + this.insert_string;

            return await this._query( sql );
        }


        /**
         * @desc :: function update 数据更新
         * @param {Array or Object} data
         * @param {String、Object、Array} where 
         * @return {Object} {"fieldCount":0,"affectedRows":1,"insertId":1,"serverStatus":2,"warningCount":0,"message":"","protocol41":true,"changedRows":0}
         */
        async update ( data,  where ) {
            this._update_string( data );
            this._anWhere( where );

            let sql = `UPDATE ` + this.table + ` SET ` + this.update_string +  this.where;
            return await this._query( sql );
        }


        /**
         * @desc :: function delete 数据删除
         * @param {String、Object、Array} where 
         * @return {Object} {"fieldCount":0,"affectedRows":1,"insertId":1,"serverStatus":2,"warningCount":0,"message":"","protocol41":true,"changedRows":0}
         */
        async delete ( where ) {
            this._anWhere( where );
            let sql = `DELETE FROM ` + this.table + this.where;

            return await this._query( sql );
        }

        /**
         * @desc :: function insert_string 构造insert_string字符串 
         * @param {Array or Object} data 
         * @return {String} insert_string
         */
        _insert_string ( data ) {
            var fields = '(', values = '(';

            if(data) {
                for ( var key in data ) {
                    fields += '`' + key + '`,';
                    values += `"${data[key]}",`;
                } 
            }
            fields = fields.length > 1 ? fields.substring(0, fields.length-1) + `)` : fields + `)`;
            values = values.length > 1 ? values.substring(0, values.length-1) + `)` : values + `)`;

            this.insert_string = `${fields} VALUES ${values}`;
        }



        /**
         * @desc :: function update_string 构造update_string字符串
         * @param {Array or Object} data 
         * @return {String} update_string
         */
        _update_string ( data ) {
            var update_string = "";

            if(data) {
                for ( var key in data ) {
                    update_string += '`' + key + '`="'+data[key]+'",';              
                } 
            }
            this.update_string = update_string.length > 1 ? update_string.substring(0, update_string.length-1) : '';
        }

        /**
         * @desc :: function fields 构造查询字段字符串，默认*
         * @param {String、Object、Array} fields 
         * @return {String} this.fields
         */
        _fields ( fields ) {
            switch ( typeof fields ) {
                case "string":
                    this.fields = 'SELECT ' + fields + ' FROM ';
                    break;
                case "object":
                    if ( Array.isArray( fields ) ) {
                        var f = '';
                        for ( var key in fields ) {
                            f += fields[key] + ',';
                        }
                        this.fields = f.length > 1 ? 'SELECT ' + f.substring(0, f.length-1) + ' FROM ' : 'SELECT * FROM ';
                    } else {
                        this.fields = 'SELECT * FROM ';
                    }                   
                    break;
                default :
                    this.fields = 'SELECT * FROM ';
                    break;   
            }          
        }

        /**
         * @desc :: function  where 构造查询条件字符串
         * @param {String、Object、Array} where 
         * @return {String} this.where 
         */
        _anWhere ( where ) {
            // string ::
            if (typeof where === "string") return " WHERE 1=1 AND " + where;

            // object Or Array::
            // where = [["name","mofei","<="],["password","123456"],["user_name","%m","like"],["id",1]];
            // where = [["user_name","%m","like"],["user_name","%m","like", "none"]];
            // where = {user_name:"Mofei",pawssword:"123456"};

            var where_string = "";

            if(where) {
                if( Array.isArray(where) ) {
                    for ( var key of where ) {
                        var query_builder = this._where( key[0], key[1], key[2] == undefined ? '=' : key[2], key[3] == undefined ? 'none' : key[3] );          
                        where_string += `${query_builder} AND `;      
                    }
                } else {
                    for ( var key in where ) {    
                        var query_builder = this._where( key, where[key], '=' );            
                        where_string += `${query_builder} AND `; 
                    }
                }
            }

            this.where = where_string = where_string.length > 1 ? " WHERE 1=1 AND " + where_string.substring(0, where_string.length-5) : '';
        }

        /**
         * @desc :: function  orWhere 构造查询条件字符串
         * @param {String、Object、Array} where 
         * @return {String} this.orWhere 
         */
        _orWhere ( where ) {
            // string ::
            if (typeof where === "string") return " WHERE 1=1 AND " + where;

            // object Or Array::
            // where = [["name","mofei","<="],["password","123456"],["user_name","%m","like"],["id",1]];
            // where = [["user_name","%m","like"],["user_name","%m","like","after"]];
            // where = {user_name:"Mofei",pawssword:"123456"};
            var where_string = "";

            if(where) {
                if( Array.isArray(where) ) {
                    for ( var key of where ) {
                        var query_builder = this._where( key[0], key[1], key[2] == undefined ? '=' : key[2], key[3] == undefined ? 'none' : key[3] );            
                        where_string += `${query_builder} OR `;      
                    }
                } else {
                    for ( var key in where ) {    
                        var query_builder = this._where( key, where[key], '=' );            
                        where_string += `${query_builder} OR `; 
                    }
                }
            }

            this.where = where_string = where_string.length > 1 ? " WHERE 1=1 AND " + where_string.substring(0, where_string.length-5) : '';
        }

        /**
         * @desc :: function _where
         * @param  {key}    colum
         * @param  {value}  value
         * @param  {type}   type (=,%,>,<,<=,>=,...)
         * @return {String}   where string  the query_builder
         */
        _where ( key, value, type, side = 'none' ) {
            var query_builder = '';

            // type = like ::
            if ( type == 'like' ) {
                switch ( side ) {
                    case 'none':
                        value = value;
                        break;
                    case 'before':
                        value = '%' + value;
                        break;
                    case 'after':
                        value = value + '%';
                        break;
                    default:
                        value = '%' + value + '%';
                        break;            
                }
            }

            query_builder = `${key} ${type} "${value}"`;
            return query_builder;
        }


        /**
         * @desc :: function order 构造查询排序字符串 默认DESC
         * @param {String、Object、Array}  order 
         * @return {String}  this.order
         */
        _order ( order ) {
            switch ( typeof order ) {
                case "string":
                    this.order = ' ORDER BY ' + order;
                    break;
                case "object":
                    if ( Array.isArray( order ) ) {
                        var f = '';
                        for ( var key in order ) {
                            f += order[key] + ' DESC,';
                        }
                        this.order = ' ORDER BY ' + (f.length > 1 ? f.substring(0, f.length-1) : '');
                    } else {
                        if (order) {
                            var f = '';
                            for ( var key in order ) {
                                if ( ['DESC','ASC'].indexOf( order[key].toUpperCase() ) < 0 ) order[key] = 'DESC';
                                f += key + ' ' + order[key] + ',';
                            }
                            this.order = ' ORDER BY ' + (f.length > 1 ? f.substring(0, f.length-1) : '');
                        } else {
                           this.order = ''; 
                        }
                    }                   
                    break;
                default :
                    this.order = '';
                    break;   
            }
        }

        /**
         * @desc :: function group 构造分组字符串 默认：null
         * @param {String、Object、Array} group 
         * @return {String} this.group 
         */
        _group ( group ) {
            switch ( typeof group ) {
                case "string":
                    this.group = ' GROUP BY ' + group;
                    break;
                case "object":
                    if ( Array.isArray( group ) ) {
                        var f = '';
                        for ( var key in group ) {
                            f += group[key] + ',';
                        }
                        this.group = ' GROUP BY ' + (f.length > 1 ? f.substring(0, f.length-1) : '');
                    } else {
                        this.group = '';
                    }                   
                    break;
                default :
                    this.group = '';
                    break;   
            }
        }


        /**
         * @desc :: function limit 构造limt 检测传值、强转Int
         * @param {Number} limit 
         * @return {Sting} this.limit
         */
        _limit ( limit ) {
            this.limit = '';
            if ( limit && Number( limit ) ) {
                this.limit = ' LIMIT ' + parseInt( limit );
            }
        }

        /**
         * @desc :: function offset 构造offset 检测传值、强转Int
         * @param {Int} offset 
         * @return {String} this.offset
         */
        _offset ( offset ) {
            this.offset = '';
            if ( this.limit && offset && Number( offset ) ) {
                this.offset = ',' + parseInt( offset );
            }
        }



        // setVariable ( before, variable, after) {
        //     var pattern = //;
        //     variable = '  SELECT sss,A,ds=f--;f'
        //     variable = '  SELECT *sss*A,name,pass'
        //     switch ( before ) {
        //         case "SELECT":
        //             // variable = variable.replace( /^[\s]*?\SELECT[\s]+/gmi , '');
        //             // pattern = /([\*|\w*?])/gmi;

        //             pattern = /^\s*SELECT\s+(.*\*|[\w_](,?[\w_]+)+)/gi;
        //             pattern = /^\s*SELECT\s+([\w_](,?[\w_]+)+)/gi;
                 
        //           console.log('variable: ==>' + variable);
        //            console.log('exec: ==>' + pattern.test( variable ));
        //            var match = variable.match( pattern );
        //           console.log('match: ==>' + match + '; len:' + match.length);

        //           for(var k in match) {
        //               console.log('for in => k:' + k + '; ' + match[k]);
        //           }
        //             if ( /\*/gi.exec( variable ) ) {

        //             }
        //             // console.log('variable:' +variable);
        //             break;
        //         case "ORDER BY":
        //             pattern = /^[\s]ORDER BY\s(\w+)/gi;
        //             break;
        //         case "GROUP BY":
        //             pattern = /^[\s]GROUP BY\s(\w+)/gi;
        //             break;           
        //     }

        //     if ( pattern.exec( variable ) ){

        //     }
        // }


    }

    module.exports = DB_table;