/**
 * @desc :: 文件流处理 Model
 *          支持单文件、批量上传、与删除；【后续： 单文件、批量下载】
 * @author {Mifei}
 */
const fs = require('fs');
const Upload = {
    
    /**
     * @desc 定义文件上传
     */
    save : async  ( ctx ) => {
        var files = ctx.request.body.files;
        

            // files = {
            //     // "file_d" : {
            //     //     "size": 14628,
            //     //     "path": "C:\\Users\\111\\AppData\\Local\\Temp\\upload_3790f56dda1979eef1bf87d709f7c530",
            //     //     "name": "blob",
            //     //     "type": "image/png",
            //     //     "mtime": "2017-08-02T06:03:02.672Z"
            //     // },
            //     "file_a" : files.file_a,
            //     "file_b" : files.file_a,
            //     "file_c" : files.file_a
            // }

        /** @desc :: 删除历史文件  */
        if ( ctx.request.body.fields.remOld ) {
            Upload.fsRemOld ( ctx.request.body.fields.remOld );
        }    

        /** @desc :: 保存新文件  */
        Upload.fsReadStream( files );
        return Upload.RtnInfo;
    },


    /**
     * @desc :: 递归删除文件直至目录; 【文件移动到tmp目录后直接删除（后续处理）】
     * @param {Dir or pathName} remOld
     */
    fsRemOld : async ( remOld ) => {
        console.log('remOld : ' + remOld);
         var 
            remOldPath = process.cwd() + remOld,
            stat = fs.statSync( remOldPath );

         var stat = fs.statSync( remOldPath );
        // ** 如果是目录 递归删除文件直至目录; 文件移动到tmp目录后直接删除
         if ( stat.isDirectory() ) {
            var files = fs.readdirSync( remOldPath );
            
            for ( var f of files ) {
                Upload.fsRemOld( remOld + '/' + f );
            }
            fs.rmdirSync( remOldPath );

         } else if ( stat.isFile() ) {
            fs.unlinkSync( remOldPath );
         }
    },

    /**
     * @todo {批量处理文件上传、流写入}
     * @desc {pipe} :: 文件流读取
     * @param {file} file
     * @return {Object} {success : Boolean, file_name : string}
     */
    fsReadStream : ( files ) => {
        var fileNames = [],i = 0;
        // ##　@todo :: 
        for (var f in files) {

            var _fsTestIng = Upload.fsTestIng( files[f] );
            // ** 文件检测完成 ； 写入成功【返回成功写入返回文件名组】、失败【返回失败删除已写入文件】
            if ( _fsTestIng ) {

                var fParam = 'binary';

                var fWritePath = process.cwd() + _fsTestIng.wPath + _fsTestIng.fName;
                Upload.fsRWrite( files[f].path, fWritePath, fParam);

                if ( true ) {
                    Upload.RtnInfo.RtnSuc = true;
                    Upload.RtnInfo.RtnMsg = '上传成功';
                    fileNames[i] = _fsTestIng.wPath + _fsTestIng.fName;
                    Upload.RtnInfo.Result = fileNames;
                } else {
                    Upload.RtnInfo.RtnSuc = false;
                    Upload.RtnInfo.RtnMsg = '上传失败';
                    return Upload.RtnInfo;
                }
                i++;
            }             
        }
        
        Upload.RtnInfo.RtnSuc = true;
        Upload.RtnInfo.Rtnmsg = '没有需要处理的文件';
        return Upload.RtnInfo; 
    },

    /**
     * @todo {文件数据检测,设置当前 RtnInfo[RtnMsg]}
     * @desc  testing file
     * @param {file}
     * @return {Boolean OR Object} 
     */
    fsTestIng : ( f ) => {
        var stat = fs.statSync(f.path);

        // ## 检测文件类型：：
        var 
            pattern  =  /\w+\/(\w+)/gi,
            pregArr  = pattern.exec( f.type ),
            fType    = pregArr[1],
            fSize    = f.size,
            fName = '';
        
        if ( !stat.isFile() ) {
            Upload.RtnInfo.RtnMsg = `上传的不是文件`;
            return false; 
        }

        if ( !Upload.UpTestIng.UpTypes.indexOf( fType ) ) {
            Upload.RtnInfo.RtnMsg = `不支持上传${fType}类型的文件`;
            return false;
        } 
        
        // ## 检测文件大小
        var UpMaxSize = Upload.UpTestIng.UpSize( fType ).Size;
        if ( fSize > UpMaxSize || stat.size > UpMaxSize) {
            var maxSize = UpMaxSize / (1024*1024);
            Upload.RtnInfo.RtnMsg = `上传文件超过允许最大${maxSize}M范围`;
            return false;
        }

        // ## 检测上传目录是否存在
        var 
            wpath = Upload.UpTestIng.UpSize( fType ).wpath,
            the_date = new Date(),
            name_fix = the_date.getFullYear() + '' + (the_date.getMonth() + 1) + '' + the_date.getDate() + '' + the_date.getTime();

        if ( !Upload.fsExistsSync( process.cwd() + wpath ) ) {
            fs.mkdirSync( process.cwd() + wpath, 0777 );
        }  
        

        return {wPath : wpath, fName : name_fix  + f.path.split('_')[1] +  '.' + fType};
    },

    /**
     * @desc {文件留读取写入}
     * @param {f_Rpath} f_Rpath 
     * @param {f_Wpath} f_Wpath
     * @param {f_param} f_param
     */
    fsRWrite : ( f_Rpath, f_Wpath, f_param ) => {
        var 
            rs = fs.createReadStream( f_Rpath, f_param),
            ws = fs.createWriteStream( f_Wpath, f_param);

        // rs.pipe(ws);
        rs.on('data', function( chunk ) {
            if ( ws.write(new Buffer(chunk, f_param)) === false  ) {   //  如果没有写完，暂停读取流
                rs.pause();
            }
        });
        
        ws.on('drain', function(){     // 写完后，继续读取
            rs.resume();
        });

        rs.on('error', function (err) {
            console.log('------》ERROR: rs' + err);
        });

        ws.on('error', function (err) {
            console.log('=======》ERROR: ws' + err);
        });

    },

    /**
     * @desc 定义上传数据参数验证：：
     * @return {Object}
     */
    UpTestIng : {
        UpTypes : ['zip','rar','application/octet-stream','application/x-zip-compressed', 'jpg' , 'bmp' , 'gif', 'png'],
        UpSize  : ( utype ) => {      
                var 
                    unit = 1024 * 1024, 
                    basePath = '/public/static/uploads',
                    res = {Size : 0, wpath : ''};

                switch ( utype ) {
                    case 0:
                    case 1:
                        res.Size = 5 * unit;
                        res.wpath = basePath + '/rar/';
                        break;

                    case 2:
                    case 3:
                    res.Size = 5 * 1024 * unit;
                    res.wpath = basePath + '/video/';
                    break;
                        
                    default :
                        res.Size = 2 * unit;
                        res.wpath = basePath + '/image/';
                        break;
                }
                return res;
        }
       
    },
    /**
     * @desc 返回结构
     */
    RtnInfo : {
        RtnSuc : false,
        RtnMsg : '上传失败',
        Result : ''
    },


    /**
     * @todo {检测是否目录}
     * @desc {fs.exists 废弃了，推荐用fs.stat 和fs.access来实现}
     * @param {wpath} path 
     */
    fsExistsSync : ( wpath ) => {
        try{
            fs.accessSync( wpath );
        } catch ( e ) {
            return false;
        }
        return true;
    },







    fsRead : ( files ) => {
        var 
            fs = require('fs'),
            files = files.file_a,
            
            the_date = new Date(),
            name_path =  the_date.getFullYear() + '' + (the_date.getMonth() + 1) + '' + the_date.getDate(),
            files_name = name_path + files.path.split('_')[1] + '.' +  files.type.replace('image/', ''),
            _fs_rpath = files.path;

        console.log('_fs_rpath : ' + JSON.stringify(files, null, 2));
        console.log('files_name : ' + files_name);

        // var rs = fs.createReadStream(_fs_rpath, 'utf-8');
        var rs = fs.createReadStream(_fs_rpath, 'binary');

        _fs_wpath =  process.cwd() + '/public/static/uploads/' + files_name + '.png';

        // var ws = fs.createWriteStream(_fs_wpath, 'utf-8');
        var ws = fs.createWriteStream(_fs_wpath, 'binary');

        // rs.pipe(ws);
        var count = 0;

        rs.on('data', function (chunk){          
            console.log(`第${count}次读取；长度 ：${chunk.length}`);
            // ws.write(new Buffer(chunk, 'utf-8'));
            // ws.write(new Buffer(chunk, 'binary'));
            
            //if ( ws.write(new Buffer(chunk, 'binary')) === false  ) {   //  如果没有写完，暂停读取流
            if ( ws.write(new Buffer(chunk, 'binary')) === false ) {
                console.log('pause : ' + count);
                rs.pause();
            }
            count++;
        });


        rs.on('end', function(){
            ws.end();
        });

        ws.on('drain', function(){     // 写完后，继续读取
            // console.log(count + 'drain event fired.');
            rs.resume();
        });


        rs.on('error', function (err) {
            console.log('ERROR: rs' + err);
        });

        ws.on('error', function (err) {
            console.log('ERROR: ws' + err);
        });






    //     readStream.on('data', function(chunk) {

    //         passedLength += chunk.length;

    //         if (writeStream.write(chunk) === false) {
    //             readStream.pause();
    //         }
    //     });

    //     readStream.on('end', function() {
    //         writeStream.end();
    //     });

    //     writeStream.on('drain', function() {
    //         readStream.resume();
    //     });

    //     setTimeout(function show() {
    //         var percent = Math.ceil((passedLength / totalSize) * 100);
    //         var size = Math.ceil(passedLength / 1000000);
    //         var diff = size - lastSize;
    //         lastSize = size;
    //         out.clearLine();
    //         out.cursorTo(0);
    //         out.write('已完成' + size + 'MB, ' + percent + '%, 速度：' + diff * 2 + 'MB/s');
    //         if (passedLength < totalSize) {
    //             setTimeout(show, 500);
    //         } else {
    //             var endTime = Date.now();
    //             console.log();
    //             console.log('共用时：' + (endTime - startTime) / 1000 + '秒。');
    //         }
    //     }, 500);
    }
}

module.exports = Upload;