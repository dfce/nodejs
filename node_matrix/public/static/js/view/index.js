window.onload = function () {
            $('.file-box').each(function() {
                animationHover(this, 'pulse');
            });
        

            // Login 、Page toggle  
             /** ## @desc:: 修改BootStrap Modal 默认margin-top : 30px; 属性为margin : auto; **/
            $('#userLogInModal,#userRegModal').on('show.bs.modal', function (e) {  
                // 关键代码，如没将modal设置为 block，则$modala_dialog.height() 为零
                $(this).css('display', 'block');

                var this_modal = $(this), modalHeight = $(window).height() / 2 - this_modal.find('.modal-dialog').height() / 2;
                $(this).find('.modal-dialog').css({'margin-top': modalHeight});      
            });  

            //LogIn Ajax ::
            $('#userLogInModal').keydown(function(e){
                if(e.keyCode == 13) userLogIn_fn ();
            });
            $('#userLogInModal .btn.btn-primary').click(function(){
               userLogIn_fn ();
            });
            
            // UserReg
            $('#userRegModal').keydown(function(e){
                if(e.keyCode == 13) userReg_fn ();
            });
            $('#userRegModal .btn.btn-primary').click(function(){
                userReg_fn ();
            });

            // LogOut
            $('#userLogOut').click(function(){
                userLogOut_fn ()
            });


            function userLogIn_fn () {
                $('#userLogInModal form input').each(function(){
                    userDataVerify($(this).attr('name'),$(this));
               });
               var errLen = $('#userLogInModal form .help-block.label-warning').length;
               if (!errLen) {
                  var 
                    userName = $('#userLogInModal form input[name="userName"]').val(), 
                    password = $('#userLogInModal form input[name="password"]').val();

                    $.ajax({
                        url:'/user/login',
						//dataType:'json',
						type:'POST',
						async: false,
						data:{userName:userName,password:password},
						success:function(data){
                            if (data && data.isLogin) {
                                swal({
                                        title: "提示：",
                                        text: "登录成功!",
                                        showConfirmButton : false,
                                        timer : 800,
                                        type: "success"
                                    },
                                    function(){
                                        window.location.reload();
                                    });
                            } else {
                                swal({
                                    title: "提示：",
                                    text: "账号或密码错误!",
                                    type: "warning"
                                });
                            }
						},
                        error:function(err){
                            swal({
                                title: "提示：",
                                text: "账号或密码错误!",
                                type: "error"
                            });
                        }
                    });
               }
            }


            function userReg_fn () {
                $('#userRegModal form input').each(function(){
                    userDataVerify($(this).attr('name'),$(this));
               });
               var errLen = $('#userRegModal form .help-block.label-warning').length;
               if (!errLen) {
                   var regDate = {
                        userName : $('#userRegModal form input[name="userName"]').val(),
                        password : $('#userRegModal form input[name="password"]').val(),
                        repass   : $('#userRegModal form input[name="repass"]').val(),
                        phoneNum : $('#userRegModal form input[name="phoneNum"]').val(),
                        eMail    : $('#userRegModal form input[name="eMail"]').val()
                    };

                    $.ajax({
                        url: '/user/singin',
						//dataType:'json',
						type: 'POST',
						async: false,
						data: regDate,
						success:function(data){
                            if (data && data.res) {
                                swal({
                                        title: "恭喜!",
                                        text: "注册成功!",
                                        showConfirmButton : false,
                                        timer : 800,
                                        type: "success"
                                    },
                                    function(){
                                        window.location.reload();
                                    });
                            } else {
                                swal({
                                    title: "提示：",
                                    text: data.msg,
                                    type: "warning"
                                });
                            }
						},
                        error:function(err){
                            swal({
                                title: "提示：",
                                text: err,
                                type: "error"
                            });
                        }
                    });
               }
            }


            function userLogOut_fn () {
                $.ajax({
                    url : '/user/logout',
                    type : 'POST',
                    async : true,
                    data : {action:"logout"},
                    success : function (data){
                        if (data) {
                            swal({
                                    title: "提示：",
                                    text: "已退出!",
                                    showConfirmButton : false,
                                    timer : 800,
                                    type: "success"
                                },
                                function(){
                                    window.location.reload();
                                });
                        } else {
                            swal({
                                title: "提示：",
                                text: "账号或密码错误!",
                                type: "warning"
                            });
                        }
                    },
                    error : function (err) {
                        swal({
                            title: "提示：",
                            text: err,
                            type: "error"
                        });
                    }
                });
            }

            function userLogInVerifi () {
                $('#userLogInModal form input').blur(function(){
                    console.log($(this).attr('name'));
                    userDataVerify($(this).attr('name'),$(this));
                });
            };
            function userRegVerifi () {
                $('#userRegModal form input').blur(function(){
                    console.log($(this).attr('name'));
                    userDataVerify($(this).attr('name'),$(this));
                });
            };
            userLogInVerifi();
            userRegVerifi();
}