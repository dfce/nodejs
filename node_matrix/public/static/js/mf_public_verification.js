/**
 * 身份证有效性验证
 * @param code
 * @returns {Boolean}
 */

/*
	根据〖中华人民共和国国家标准 GB 11643-1999〗中有关公民身份号码的规定，公民身份号码是特征组合码，由十七位数字本体码和一位数字校验码组成。排列顺序从左至右依次为：六位数字地址码，八位数字出生日期码，三位数字顺序码和一位数字校验码。
	    地址码表示编码对象常住户口所在县(市、旗、区)的行政区划代码。
	    出生日期码表示编码对象出生的年、月、日，其中年份用四位数字表示，年、月、日之间不用分隔符。
	    顺序码表示同一地址码所标识的区域范围内，对同年、月、日出生的人员编定的顺序号。顺序码的奇数分给男性，偶数分给女性。
	    校验码是根据前面十七位数字码，按照ISO 7064:1983.MOD 11-2校验码计算出来的检验码。

	出生日期计算方法。
	    15位的身份证编码首先把出生年扩展为4位，简单的就是增加一个19或18,这样就包含了所有1800-1999年出生的人;
	    2000年后出生的肯定都是18位的了没有这个烦恼，至于1800年前出生的,那啥那时应该还没身份证号这个东东，⊙﹏⊙b汗...
	下面是正则表达式:
	 出生日期1800-2099  (18|19|20)?\d{2}(0[1-9]|1[12])(0[1-9]|[12]\d|3[01])
	 身份证正则表达式 /^\d{6}(18|19|20)?\d{2}(0[1-9]|1[12])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i            
	 15位校验规则 6位地址编码+6位出生日期+3位顺序号
	 18位校验规则 6位地址编码+8位出生日期+3位顺序号+1位校验位
	 
	 校验位规则     公式:∑(ai×Wi)(mod 11)……………………………………(1)
	                公式(1)中： 
	                i----表示号码字符从由至左包括校验码在内的位置序号； 
	                ai----表示第i位置上的号码字符值； 
	                Wi----示第i位置上的加权因子，其数值依据公式Wi=2^(n-1）(mod 11)计算得出。
	                i 18 17 16 15 14 13 12 11 10 9 8 7 6 5 4 3 2 1
	                Wi 7 9 10 5 8 4 2 1 6 3 7 9 10 5 8 4 2 1

	*/
	
	//身份证号合法性验证 
	//支持15位和18位身份证号
	//支持地址编码、出生日期、校验位验证
	        function IdentityCodeValid(code) { 
	            var city={11:"北京",12:"天津",13:"河北",14:"山西",15:"内蒙古",21:"辽宁",22:"吉林",23:"黑龙江 ",31:"上海",32:"江苏",33:"浙江",34:"安徽",35:"福建",36:"江西",37:"山东",41:"河南",42:"湖北 ",43:"湖南",44:"广东",45:"广西",46:"海南",50:"重庆",51:"四川",52:"贵州",53:"云南",54:"西藏 ",61:"陕西",62:"甘肃",63:"青海",64:"宁夏",65:"新疆",71:"台湾",81:"香港",82:"澳门",91:"国外 "};
	            var tip = "";
	            var pass= true;
	            
	            if(!code || !/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[12])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(code)){
	                tip = "身份证号格式错误";
	                pass = false;
	            }
	            
	           else if(!city[code.substr(0,2)]){
	                tip = "地址编码错误";
	                pass = false;
	            }
	            else{
	                //18位身份证需要验证最后一位校验位
	                if(code.length == 18){
	                    code = code.split('');
	                    //∑(ai×Wi)(mod 11)
	                    //加权因子
	                    var factor = [ 7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2 ];
	                    //校验位
	                    var parity = [ 1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2 ];
	                    var sum = 0;
	                    var ai = 0;
	                    var wi = 0;
	                    for (var i = 0; i < 17; i++){
	                        ai = code[i];
	                        wi = factor[i];
	                        sum += ai * wi;
	                    }
	                    var last = parity[sum % 11];
	                    if(parity[sum % 11] != code[17]){
	                        tip = "校验位错误";
	                        pass =false;
	                    }
	                }
	            }
	            //if(!pass) alert(tip);
	            return pass;
	        }
	        

/**
 * 省市地址联动查询
 * @param area_id
 * @returns {oblect/boolean(false)}
 */      
            function verifi_provinces(area_id){
	        	var provinces = false;
	        	$.ajax({
	        		url:'/user/getarea',
					type:'post',
					dataType:'json',
					async:false,
					data:{area_id:area_id},
					success:function(data){                       
                        if (data.success && data.res) {
                            provinces = data.res;
                        } else {
                            // swal({
                            //     title : "",
                            //     text : "地区参数获取错误，请刷新重试或联系管理员",
                            //     type : "warning",
                            //     // timer : 1200,
                            //     showConfirmButton : true,
                            //     confirmButtonText : "刷新"
                            // },function(){
                            //     // window.location.reload()
                            // });
                        }					
					},
					error:function(data){
						//alert('数据错误');
						// provinces = false;
					}
	        	})
	        	return provinces;
	        }


	        
	        
/**
 * 年
 * @param int offset （需要查询年数）
 * @param boolean limit	  （true 当前年前后；false 当前年前）
 * @returns {Array}
 */     
	        
	        function loadYear(offset,limit){
	        	var years = new Array();
	        	myDate = new Date();
	        	year = myDate.getFullYear();
	        		        	
	        	var offset_i = offset;
	        	if(!limit){
	        		year += offset;
	        		offset_i += offset;
	        	}
	        		        	
	        	for(offset_i ; offset_i >=0 ; offset_i--){
	        		years[offset_i] = year-offset_i;
	        	}
	        	
	        	return years;
	        }

/**
 * 年（闰）月份天数返回
 * @param year
 * @param month
 * @returns
 */	        
	        
	        function loadDay(year,month){
	        	//是否闰年 是返回1不是返回0
	        	var is_leap = (year%100==0?res=(year%400==0?1:0):res=(year%4==0?1:0));
	        	//月排序获取月天数
	        	var m_days=new Array(31,28+is_leap,31,30,31,30,31,31,30,31,30,31); //各月份的总天数
	        	//alert(m_days);
	        	return m_days[month-1];
	        }
	        


/**
 * 手机号码: 
 * 13[0-9], 14[5,7], 15[0, 1, 2, 3, 5, 6, 7, 8, 9], 17[6, 7, 8], 18[0-9], 170[0-9]
 * 移动号段: 134,135,136,137,138,139,150,151,152,157,158,159,182,183,184,187,188,147,178,1705
 * 联通号段: 130,131,132,155,156,185,186,145,176,1709
 * 电信号段: 133,153,180,181,189,177,1700
 * @param phoneNumber
 * @returns {Boolean}
 */
	        function isMobileNumber(phoneNumber){

	        	if(!/^\d{11}$/.test(phoneNumber)) return false;
	        	
	        	var mobile = /^1(3[0-9]|4[57]|5[0-35-9]|8[0-9]|70)\d{8}$/;
	        	
//	        	var china_mobile = /^1(3[4-9]|4[7]|5[0-27-9]|7[8]|8[2-478])\d{8}$)|(^1705\d{7}$/;
//	        	var china_unicom = /^1(3[0-2]|4[5]|5[56]|7[6]|8[56])\d{8}$)|(^1709\d{7}$/;
//	        	var china_telecom = /^1(33|53|77|8[019])\d{8}$)|(^1700\d{7}$/;
	        	
	        	if(!mobile.test(phoneNumber)) return false;
	        	
	        	return true;
	        }

/**
 *	常用正则 :: 
 */
 			function  CommonRegular () {
				let CommonRegular = {
					varChar : /^[\u4e00-\u9fa5]{2,10}$/,
					isMobileNumber : /^1(3[0-9]|4[57]|5[0-35-9]|8[0-9]|70)\d{8}$/,
					isEmail : /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/,
					account : /^([a-zA-Z0-9]|[\.\_\@]|[a-zA-Z0-9]){4,20}$/,
					password : /^(\w){6,20}$/
				};
				return CommonRegular;
			}




/**
 * 用户注册、登录【数据】输入验证：
 * 基础类型、长度、格式验证
 */			
 			function userDataVerify ( name,  obj ) {
				var htmlVal = '※ 请输入';
                var htmlClass = false;
				var iptVal = obj.val();
				name = name === undefined || name.toLowerCase();
                if(obj.val() !=''){
                    switch(name){
                        case 'full_name':
                            var full_name = obj.val();
                            var patrn = /^[\u4e00-\u9fa5]{2,10}$/;   
                            if (patrn.exec(full_name)){
                                htmlVal	= '';htmlClass = true;
                            }else{
                                htmlVal	= '必须为2-10个中文字符';
                            }
                            break;
                        case 'card_id':
        					var IDCard = obj.val();
        					var res = IdentityCodeValid(IDCard)
        					
        					if(res){
                                htmlVal	= '';htmlClass = true;
        					}else{
        						htmlVal	= '× 身份证号不正确'
        					}
                            break;
                        case 'address':
                            var addres = obj.val();
                            if(addres.length<=50){
                                htmlVal	= '';htmlClass = true;
                            }else{
                                htmlVal	= '详细地址不超过50个字符'
                            }                          
                            break;
                        case 'qq':
                            var qq = obj.val(); 
                            var patrn = /^(\d){4,12}$/;  
                            if (!patrn.exec(qq)){
                                htmlVal	= 'QQ错误';
                            }else{
                                htmlVal	= '';htmlClass = true;
                            } 	
                            break;
						case 'telephone':
                            var telephone = obj.val(); 
                            if (!CommonRegular().isMobileNumber.exec(telephone)){
                                htmlVal	= '只支持中国大陆手机号';
                            }else{
                                htmlVal	= '';htmlClass = true;
                            } 	
                            break;	
						case 'username':
							var userName = 	obj.val();
							if (!CommonRegular().account.exec(userName)){
                                htmlVal	= '账号格式错误';
                            }else{
                                htmlVal	= '';htmlClass = true;
                            } 	
                            break;
						case 'password':
							var password = obj.val();
							if(!CommonRegular().password.exec(password)){
								htmlVal	= '密码错误';
							}else{
								htmlVal	= '';htmlClass = true;
							}
							break;
						case 'repass':
							var 
								repass = obj.val(),
								password = obj.parents('.form-horizontal.form').find('input[name="password"]').val();

							console.log(repass +'=='+ password);
							if(!CommonRegular().password.exec(repass) || repass != password){
								htmlVal	= '两次密码不一样';
							}else{
								htmlVal	= '';htmlClass = true;
							}
							break;
						case 'phonenum':
							var phoneNum = obj.val();
							if(!CommonRegular().isMobileNumber.exec(phoneNum)){
								htmlVal	= '手机号错误';
							}else{
								htmlVal	= '';htmlClass = true;
							}
							break;
						case 'email':
							var eMail = obj.val();
							if(!CommonRegular().isEmail.exec(eMail)){
								htmlVal	= '邮箱格式错误';
							}else{
								htmlVal	= '';htmlClass = true;
							}
							break;			
                    }
                }
                
				if(htmlClass){
                    obj.next('.help-block.m-b-none').html(htmlVal).removeClass('label-warning').addClass('label-success');
                }else{
                    obj.next('.help-block.m-b-none').html(htmlVal).removeClass('label-success').addClass('label-warning');
                }
			}