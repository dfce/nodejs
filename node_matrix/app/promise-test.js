/**
 * ## @desc :: 测试 Promise 执行、返回结果：顺序同时进行、返回不依先后，只管结束先后,先完成 先返回
 */
var i = 1;
var promise = new Promise(function(resolve){
  console.log('promise1 begin');
  if (i === 1){
    var sss = setInterval(function(){
      console.log('promise1');
    	resolve(i);
       i = 2;
       clearInterval(sss);
    },8000);
   
  }else{
    resolve(i);
  }
});
promise.then(function(value){
    console.log(value);
}).catch(function(error){
    console.error(error);
});

var promise2 = new Promise(function(resolve){
  console.log('promise2 begin');
  if (i === 1){
    var sss = setInterval(function(){
      console.log('promise2');
    	resolve(i);
       i = 2;
       clearInterval(sss);
    },3000);
   
  }else{
    resolve(i);
  }
});
promise2.then(function(value){
    console.log(value);
}).catch(function(error){
    console.error(error);
});