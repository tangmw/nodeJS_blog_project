/**
 * Created by Administrator on 2018/1/15.
 * 应用程序的启动（入口）文件
 */
//加载express模块
var express = require('express');
//加载模板处理模块
var swig = require('swig');
//加载数据库模块---后用到mongoose.connect
var mongoose = require('mongoose');
//加载body-parser---用来处理通过ajax的post提交过来的数据
var bodyParser = require('body-parser');
//加载cookie模块，使用cookie保存用户登录状态
var Cookies = require('cookies');

//通过express创建app应用=>等同于Node.js中的http.createServer()
var app = express();

//获取User模型
var User = require('./models/User');

//设置静态文件托管---将文件指向./public目录下
//当用户访问的url以/public开始，那么直接返回对应的 __dirname + 'public'目录下的文件
app.use('/public',express.static( __dirname + '/public'));//设置的静态资源目录

//配置应用模板/////////////////////////////////////////////////////////////////////////
//定义当前应用所使用的模板引擎
//第一个参数：表示模板引擎的名称，同时也是模板文件的后缀--即它的模板文件.html会放在外部文件中
//第二个参数：表示用于解析处理模板应用的方法
app.engine('html',swig.renderFile);

//设置模板文件存放的目录
//第一个参数：必须是views
//第二个参数：是路径目录
app.set('views','./views');

//注册所使用的模板引擎
//第一个参数：必须是view engine
//第二个参数：和app.engine这个方法中定义的模板引擎的名称（第一个参数）是一致的
app.set('view engine','html');

//在开发的过程中，需要取消模板缓存的限制--模板默认有缓存机制，提升搜索新能
swig.setDefaults({cache: false});

//body-parser设置
//用于接收post提交过来的数据，这样就可以直接通过router.post中function里req.body属性就可以得到提交过来的数据
app.use(bodyParser.urlencoded({extended:true}));//设置完此方法后，它会自动在router.post的function中的req对象增加body属性，里面就保存了post提交的数据

//设置cookies---不论什么时候，用户访问我们的网站，都会使用这个中间件
app.use( function(req,res,next){

    //利用cookies方法，将cookies加载进入req对象
    req.cookies = new Cookies(req,res);

    //用JSON解析cookies数据
    req.userInfo = {};
    if(req.cookies.get('userInfo')){
        try{
            req.userInfo = JSON.parse(req.cookies.get('userInfo'));

            //获取当前登录用户的类型，是否是管理员
            User.findById(req.userInfo._id).then(function (userInfo) {
                //增加req isadmin字段属性--强制转换成bool值
                req.userInfo.isAdmin = Boolean(userInfo.isAdmin);
                next();
            })
        }catch(e){//如果报错，则
            next();
        }
    }else{
        next();
    }

} );
/////////////////////////////////////////////////////////////////////////////////////////////
/*
 * 首页
 * 给app绑定一个根路径的路由，
 *   req:request对象
 *   res:response对象
 *   next:函数
 * */
//app.get('/',function(req,res,next){
//    //res.send('<h1>welcome</h1>');
//
//    /*
//    res.render();
//        读取view目录下的指定文件，解析并返回给客户端
//            第一个参数：表示模板的文件，相对于views目录: views/index.html
//            第二个参数：表示传递给模板使用的数据
//    */
//    res.render('index.html');
//});

/*
 * 根据不同的功能划分模块
 * */
app.use('/admin',require('./routers/admin.js'));//后台管理模块--默认为admin.js
app.use('/api',require('./routers/api.js'));//api管理模块
app.use('/',require('./routers/main.js'));//前台展示模块


//通过mongoose方法链接数据库
//协议:mongodb协议，地址：localhost,端口：27018,连接的数据库：blog
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27018/blog',{useMongoClient: true}, function(err){
    if(err){
        console.log('数据库连接失败');
    }else{
        console.log('数据库连接成功');

        //监听http请求
        app.listen(8081);//数据库连接成功后再去启动应用的监听
    }
});




//用户发送http请求 -> url -> 解析路由 -> 找到匹配的规则 -> 执行指定的绑定函数，返回对应内容至用户
///public -> 静态 -> 直接读取指定目录下的文件，返回给用户
//           动态 -> 处理业务逻辑，加载模板，解析模板 -> 返回数据给用户