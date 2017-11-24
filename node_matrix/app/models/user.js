// @ts-nocheck
const DBModel = require(process.cwd() + `/middlewares/db`);

/**
 *  ## @desc:: UserModel::
 *     @desc:: Anthor :: Mofei
 */
// // UserModel 1::
// function retRes (result) {
//     if ( !(Array.isArray( result ) && result.length > 0) ) result = null;
//     if ( Array.isArray( result ) && result.length == 1 ) result = result[0];
//     return result;
// }


// const User = {
//     getUserList : async  ( options ) => {
//         let sql = `SELECT * from user_info WHERE user_name = '${options.userName}' AND password = '${options.password}'`;

//         let result = retRes (await DBModel.query(sql));

//         return result;
//     },
//     async add ( options ) {
//         let sql =  ``;
//     }
// }


// UserModel 2::
class UserModel {

    static get tab_name(){
        return 'user_users';
    }
    // static set tab_name(val) {
    //     self.tab_name = val;
    //     // UserModel.tab_name = val;
    // }

    static async getUserList( conditions, options = null ) {
        let result = await DBModel.select( 'user_users', conditions, options );
        return result;
    }

    static async add ( options ) {
        let result = await DBModel.insert( 'user_users', options );
        return result;
    }


    static async update ( where, options ) {
 
        let result = await DBModel.update( 'user_users', where, options );
        return result;
    }

    static async delete ( where, options ) {
 
        let result = await DBModel.delete( 'user_users', where );
        return result;
    }
}

module.exports = UserModel;