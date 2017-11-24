/**
 * @desc :: DBMiddleWare
 * anthor :: Mofei
 */
const dbConf = require(process.cwd() + `/app/config/db`);

const db = dbConf['production'];
const mysql = require('mysql');

const pool = mysql.createPool({
    connectionLimit : 10,  
    host            : db.host,
    user            : db.username,
    password        : db.password,
    database        : db.database
});


const DBMiddle = {
    query : function ( sql, values ) {
        console.log('query -> Sql : ' + sql);
        return new Promise (( resolve, reject ) => {
            pool.getConnection ( function ( err, connection ) {
                if ( err ) {
                    resolve( err );
                } else {
                    connection.query( sql, values, (err, rows ) => {
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
    },
    

    /**
     * @desc :: async function getList
     * @param       sql the query string
     * @return      the select Array or Object
     */
    getList : async function ( sql ) {
        let result = await DBMiddle.query(sql);

        if (!(Array.isArray(result) && result.length > 0)) result = null;
        if (Array.isArray(result) && result.length == 1) result = result[0];

        return result;
    },


    /**
     * @desc :: async function select
     * @param       tabName the table name
     * @param       conditions is Array or Object or String
     * @param       options is Array or Object or String
     * @return      the select Array or Object
     */
    select : async function ( tabName, conditions, options ) {
        var colums_string = await DBMiddle.colums_string( tabName, options );
        var where_string = await DBMiddle.where_string( conditions );

        let sql =  `SELECT ${colums_string} FROM ${tabName} ${where_string}`;
        var result = await DBMiddle.getList( sql );

        return result;
    },

    /**
     * @desc :: async function insert 
     * @param       tabName the table name
     * @param       data is Array or Object
     * @return      object {"fieldCount":0,"affectedRows":1,"insertId":1,"serverStatus":2,"warningCount":0,"message":"","protocol41":true,"changedRows":0}
     */
    insert : async function ( tabName, data ) {
        var insert_string = await DBMiddle.insert_string( data );
        let sql = `INSERT INTO ${tabName} ${insert_string}`;

        var res = await DBMiddle.query( sql );
        return res;
    },


    /**
     *  @desc :: function insert_string
     *  @param      data is Array or Object
     *  @return     string  the insert keys and values
     */
    insert_string : function ( data ) {
        var fields = '(', values = '(';

        if(data) {
            for ( var key in data ) {
                fields += '`' + key + '`,';
                values += `"${data[key]}",`;
            } 
        }
        fields = fields.length > 1 ? fields.substring(0, fields.length-1) + `)` : fields + `)`;
        values = values.length > 1 ? values.substring(0, values.length-1) + `)` : values + `)`;

        var insert_string = `${fields} VALUES ${values}`;
        return insert_string;
    },

    /**
     * @desc :: async function update
     * @param       tabName  the update table name
     * @param       where Array or Object or String the update conditions [[key,value,type]] 必须为二维数组 暂只支持 AND 操作
     * @param       data Array or Object the update data 
     * @return      object
     */
    update : async function ( tabName, where, data ) {
 
        var update_string = await DBMiddle.update_string( data );
        if(!update_string) return false;
        var where_string = await DBMiddle.where_string( where );
        let sql = `UPDATE ${tabName} SET ${update_string} ${where_string}`;

        var res = await DBMiddle.query( sql );

        return res;
    },

    /**
     *  @desc :: function update_string
     *  @param      data is Array or Object
     *  @return     string  the update set key=value
     */
    update_string : function ( data ) {
        var update_string = "";

        if(data) {
            for ( var key in data ) {
                update_string += '`' + key + '`="'+data[key]+'",';              
            } 
        }
        update_string = update_string.length > 1 ? update_string.substring(0, update_string.length-1) : 'false';

        return update_string;
    },

    /**
     * @desc :: function delete
     * @param       tabName  the update table name
     * @param       where Array or Object or String the update conditions [[key,value,type]] 必须为二维数组 暂只支持 AND 操作
     * @return      object
     */
    delete : async function ( tabName, where ) {
        var where_string = await DBMiddle.where_string( where );
        let sql = `DELETE FROM ${tabName} ${where_string}`;

        var res = await DBMiddle.query( sql );

        return res;
    },

    /**
     * @desc :: function drop
     * @return 
     */
    drop : async function () {

    },

    /**
     *  @desc :: function colums_string
     *  @param      tabname is the tabName
     *  @param      data is Array or Object
     *  @return     string  the wheres
     */
    colums_string : function ( tabname, data ) {
        // string ::
        if( !data || !Array.isArray(data)) return '*';
        if (typeof data === "string") return data;

        // object ::
        var colums_string = "";

                
        if( Array.isArray(data) ) {
            for ( var key of data ) {
                colums_string += ('`' + tabname + '`.' + key + ',');   
            }
        }

        colums_string = colums_string.length > 1 ? " " + colums_string.substring(0, colums_string.length-1) : '';
        return colums_string;
    },


    /**
     *  @desc :: function where_string
     *  @param      where is Array or Object
     *  @return     string  the wheres
     */
    where_string : function ( where ) {
        // string ::
        if (typeof where === "string") return " WHERE 1=1 AND " + where;

        // object Or Array::
        // where = [["name","mofei","<="],["password","123456"],["user_name","%m","like"],["id",1]];
        // where = [["user_name","%m","like"]];
        // where = {user_name:"Mofei",pawssword:"123456"};



        var where_string = "";

        if(where) {
            if( Array.isArray(where) ) {
                for ( var key of where ) {
                    var query_builder = DBMiddle._where( key[0], key[1], key[2] == undefined ? '=' : key[2] );            
                    where_string += `${query_builder} AND `;      
                }
            } else {
                for ( var key in where ) {    
                    var query_builder = DBMiddle._where( key, where[key], '=' );            
                    where_string += `${query_builder} AND `; 
                }
            }
        }
        where_string = where_string.length > 1 ? " WHERE 1=1 AND " + where_string.substring(0, where_string.length-5) : '';
        // console.log('where_string:' + where_string);
        return where_string;
    },

    /**
     *  @desc :: function where_string
     *  @param      where is Array or Object
     *  @return     string  the query_builder
     */
    _where : function ( key, value, type ) {
        var query_builder = '';
        query_builder = `${key} ${type} "${value}"`;
        return query_builder;
    },



    // pool.end();
}
module.exports = DBMiddle;