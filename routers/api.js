/**
 * Created by Administrator on 2018/1/15.
 */

var express = require('express');
var router = express.Router();
//引入model文件夹中的user.js，通过模型类来操纵数据库
var User = require('../models/User')
var Content = require('../models/Content')

//定义一个统一的返回格式
var responseData;

router.use(function(req,res,next){
    responseData = {
        code:0,    //代表无任何错误
        message:''
    }
    next();
});


/*
* 增加一个路由：接收前端注册信息数据
*   注册逻辑：（基础简单的）
*       1、用户名不能为空
*       2、密码不能为空
*       3、两次输入密码必须一致
*             （需要数据库参与的）
*       1、用户是否已经被注册
*           数据库的查询
* */
router.post('/user/register',function(req,res,next){

    //console.log(req.body);//在app.js中加载了body-parser，并做了设置，因此req下就有了body属性用来接收post来的数据
    //将返回的数据放到变量里面
    var username = req.body.username;
    var password = req.body.password;
    var repassword = req.body.repassword;

    //用户名是否为空：
    if( username == '' ){
        responseData.code = 1;
        responseData.message = '用户名不能为空';
        res.json(responseData);//把对象转成json格式再返回给前端
        return;//终止后续代码的执行
    }
    //密码不能为空
    if( password == ''){
        responseData.code = 2;
        responseData.message = '密码不能为空';
        res.json(responseData);
        return;
    }
    //两次输入的密码不一致
    if( password != repassword ){
        responseData.code = 3;
        responseData.message = '两次输入的密码不一致';
        res.json(responseData);
        return;
    }

    //基于数据库的验证---验证用户名是否已经被注册了
    //如果数据库中已经存在和我们要注册的用户名同名的数据，表示该用户名已经被注册了
    User.findOne({ //findOne是moogose的API函数http://mongoosejs.com/docs/api.html#model_Model.findOne
        username: username
    }).then(function( userInfo ){//此返回值表示查到的用户数据
        //console.log(userInfo);//返回为空，说明数据库中没有当前的用户数据
        if( userInfo ){//表示数据库中有该记录
            responseData.code = 4;
            responseData.message = '用户名已注册';
            res.json(responseData);
            return;
        }
        //用户名没有注册的情况----则保存用户名信息到数据库中-----不需要直接操作数据库，而是操作../models/User中的类，通过这个构造函数，创建出一个类出来
        var user = new User({
            username: username,
            password: password
        });//通过给这个对象加上username属性和password属性，调用对象下的save方法，就可以保存到数据库---即通过操纵对象来操纵数据库的
        return user.save();
    }).then(function(newUserinfo){//至此，新用户已添加进入数据库，下面将新用户在数据库中的信息返回给前端
        //console.log(newUserinfo);
        //代表这注册成功
        responseData.message = '注册成功';
        res.json(responseData);
    });
});

router.post('/user/login',function(req,res){

    var username = req.body.username;
    var password = req.body.password;

    if( username == '' || password == '' ){
        responseData.code = 1;
        responseData.message = '用户名或密码不能为空';
        res.json(responseData);
        return;
    }

    //查询数据库中相同用户名和密码的记录是否存在，如果存在，则登陆成功
    User.findOne({
        username: username,
        password: password
    }).then(function(userInfo){
        if(!userInfo){//输入的用户名和密码在数据库中找不到
            responseData.code = 2;
            responseData.message = '用户名或密码错误';
            res.json(responseData);
            return;
        }
        //用户名和密码是正确的
        responseData.message = '登陆成功';
        //返回当前用户的登陆信息-----交给前端显示
        responseData.userInfo = { //将数据库中找到的用户信息传到responseData的userInfo对象中
            _id: userInfo._id,
            username: userInfo.username
        }
        //发送cookies信息到浏览器，浏览器收到cookies信息会保存起来，以后只要访问站点，每次都可以通过这个cookies信息通过头信息的方式发送给服务端，服务端得到cookies信息，通过它来验证是否为登陆状态
        req.cookies.set('userInfo',JSON.stringify({
            _id: userInfo._id,
            username: userInfo.username
        }));//装成字符串存到userInfo里面
        res.json(responseData);
        return;
    })
});

/*
* 退出
* */
router.get('/user/logout', function (req,res) {
    req.cookies.set('userInfo',null);//将cookies信息清除
    res.json(responseData);
});

/*
* 获取指定文章的所有评论
* */
router.get('/comment', function (req,res) {

    //传递当前这篇文章的id
    //使用get方式传的，所以是query
    var contentId = req.query.contentid || '';

    //通过id查询这篇文章
    Content.findOne({
        _id: contentId
    }).then(function (content) {
        responseData.data = content.comments;//将content.comments内容放到data里
        res.json(responseData);
    })

});


/*
* 用于留言评论提交---使用不刷新页面的ajax方式
* */
//用AJAX 的post方式提交，提交到/comment/post接口上
router.post('/comment/post', function (req,res) {

    //前端还得传过来当前文章的id，这样我才知道我评论的是哪篇文章的
    var contentId = req.body.contentid || '';

    var postData = {
       //评论信息中需要显示评论人信息、评论时间、评论内容
       username: req.userInfo.username,
       postTime: new Date(),
       content: req.body.content//通过前端传过来，定义一个字段---body.content
    };
    //查询当前这篇内容的信息----查询出来之后就得到了这篇文章的内容--content信息里
    Content.findOne({
        _id: contentId
    }).then(function (content) {
        content.comments.push(postData);//因为comments字段是一个数组，因此可以把数据直接push进去
        return content.save();//保存数据到数据库中  return后再来接收一下 then
    }).then(function (newContent) {//newContent是content.save()后的保存数据---
        responseData.message = '评论成功';
        responseData.data = newContent;//将数据原封不动地返回给前端
        res.json(responseData);//通过json的方式直接向前端返回数据
    });
});


//把路由返回出去
module.exports = router;