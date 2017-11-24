
        // pic ：： 
        var options = {
                // aspectRatio: 16 / 9,
                preview: '.img-preview',
                ready: function (e) {
                console.log('ready：' + e.type);
                },
                cropstart: function (e) {
                console.log('cropstart：' + e.type, e.detail.action);
                },
                cropmove: function (e) {
                console.log('cropmove：' + e.type, e.detail.action);
                },
                cropend: function (e) {
                console.log('cropend：' + e.type, e.detail.action);
                },
                crop: function (e) {
                    var data = e.detail;
                    console.log(e.type + '; data：-->' + JSON.stringify(data));
                  
                    // dataX.value = Math.round(data.x);
                    // dataY.value = Math.round(data.y);
                    // dataHeight.value = Math.round(data.height);
                    // dataWidth.value = Math.round(data.width);
                    // dataRotate.value = typeof data.rotate !== 'undefined' ? data.rotate : '';
                    // dataScaleX.value = typeof data.scaleX !== 'undefined' ? data.scaleX : '';
                    // dataScaleY.value = typeof data.scaleY !== 'undefined' ? data.scaleY : '';
                },
                zoom: function (e) {
                console.log('zoom:' + e.type, e.detail.ratio);
                }
            };
            var image = document.getElementById('crop-image');
            var cropper = new Cropper(image, options);
            

            var $inputImage = $("#inputImage");

            $("#inputImage").change(function(){
                
                if (window.FileReader) {
                    var 
                        fileReader = new FileReader(),
                        files = this.files,
                        file;

                    file = files[0];
            
                    if (/^image\/\w+$/.test(file.type)) {
                   
                        fileReader.readAsDataURL(file);
                        fileReader.onload = function () {
                            $("#inputImage").val('');
                            $('#showMesage').text('你可以上传新的图片到裁剪框，并轻松下载新裁剪的图像.').removeClass('btn-warning');
                            
                            // $image.cropper("reset", true).cropper("replace", this.result);


                            image.src = uploadedImageURL = URL.createObjectURL(file);
                            console.log(image.data);
                            cropper.destroy();
                            cropper = new Cropper(image, options);
                            inputImage.value = null;
                        }
                    } 
                    else {
                        $('#showMesage').text('请选择图片类型文件上传').addClass('btn-warning');
                    } 

                } else {
                    $("#inputImage").addClass('hide');
                }
            });

            $("#download").click(function() {
                // var sourceCanvas = cropper['getCroppedCanvas']();
                // var canvas = document.createElement('canvas');
                // var context = canvas.getContext('2d');
                // var width = sourceCanvas.width;
                // var height = sourceCanvas.height;


                // // 返回圆角图片
                // canvas.width = width;
                // canvas.height = height;
                // context.beginPath();
                // context.arc(width / 2, height / 2, Math.min(width, height) / 2, 0, 2 * Math.PI);
                // context.strokeStyle = 'rgba(0,0,0,0)';
                // context.stroke();
                // context.clip();
                // context.drawImage(sourceCanvas, 0, 0, width, height, 0, 0, width, height);



                var CroppedCanvas = cropper['getCroppedCanvas']();
                var result = cropper.getCroppedCanvas({width:CroppedCanvas.width, height:CroppedCanvas.height, fillColor : '#fff'});

                var 
                    image = result.toDataURL("image/png"),
                    the_date = new Date(),
                    name =  the_date.getFullYear() + '' + (the_date.getMonth() + 1) + '' + the_date.getDate() + '_' + image.substr(22, 10) + '.png';
                    
                // $("#download a").attr({'href' : image, 'download' : name});

                // var w=window.open('about:blank','image from canvas');  
                // w.document.write("<img src='"+image+"' alt='from canvas'/>");

                window.open(result.toDataURL());
            });

            $("#zoomIn").click(function(e) {
                cropper.zoom(0.1);
            });

            $("#zoomOut").click(function(e) {
                cropper.zoom(-0.1);
            });

            $("#rotateLeft").click(function(e) {
                e.preventDefault();
                // cropper.move(-1, 0);
                cropper.rotate(-45);
            });

            $("#rotateRight").click(function(e) {
                e.preventDefault();
                // cropper.move(0, -1);
                cropper.rotate(45);
            });

            $("#setDrag").click(function(e) {
                e.preventDefault();
                // cropper.setDragMode('move');
                // cropper.move(-10, -10);
                // cropper.move(10, -10);
            });