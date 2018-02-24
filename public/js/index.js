/**
 * Created by Administrator on 2018/1/17.
 */
$(function(){

    var $loginBox = $('#loginBox');
    var $registerBox = $('#registerBox');
    var $userinfo = $('#userInfo');

    // 切换到注册面板
    // 当index.html中的<a href="#" class="colMint">马上注册</a>被点击后，注册面板显示，同时登陆面板隐藏
    $loginBox.find('a.colMint').on('click',function(){
        $registerBox.show();
        $loginBox.hide();
    });

    //切换到登陆面板
    //当index.html中的<a href="#" class="colMint">马上登录</a>被点击后，登陆面板显示，同时注册面板隐藏
    $registerBox.find('a.colMint').on('click',function(){
        $loginBox.show();
        $registerBox.hide();
    });

    // 注册模块
    // 提交注册信息--ajax
    $registerBox.find('button').on('click',function(){
        //通过ajax提交请求
        $.ajax({
            type: 'post',
            url: '/api/user/register',
            data: {
                username: $registerBox.find('[name="username"]').val(),
                password: $registerBox.find('[name="password"]').val(),
                repassword: $registerBox.find('[name="repassword"]').val()
            },
            datatype: 'json',
            success: function(result){
                //console.log(result);
                //返回给前端的提示信息
                $registerBox.find('.colWarning').html(result.message);

                //注册成功，切换到登陆页面，注册失败，则只需要显示提示信息即可--code为0代表成功
                if(!result.code){
                    //注册成功--1s钟后切换到登陆界面
                    setTimeout(function(){
                        $loginBox.show();
                        $registerBox.hide();
                    },1000);
                }
            }
        });
    });

    //登陆模块
    //提交登陆信息---ajax
    $loginBox.find('button').on('click',function(){

        //通过ajax提交请求
        $.ajax({
            type:'post',
            url:'/api/user/login',
            data:{
                username: $loginBox.find('[name="username"]').val(),
                password: $loginBox.find('[name="password"]').val()
            },
            datatype:'json',
            success: function(result){

                $loginBox.find('.colWarning').html(result.message);
                //登陆成功,则重新加载页面
                if(!result.code){
                    window.location.reload();
                }
            }
        });
    });
    //退出
    $('#logout').on('click', function () {
        $.ajax({
            url:'api/user/logout',
            success: function (result) {
                if(!result.code){
                    window.location.reload();
                }
            }
        });
    });

})