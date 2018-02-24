/**
 * Created by Administrator on 2018/1/15.
 */

var express = require('express');
var router = express.Router();

var Category = require('../models/Category');
var Content = require('../models/Content');

var data;

/*
* 处理通用的数据
* */
router.use(function (req,res,next) {

    data = {
        userInfo:req.userInfo,//把userInfo分配过去---然后在http模板中就可以使用userInfo的变量
        categories:[]//将categories中的值分配给渲染的模板中去使用，让前端能展现数据库后台数据
    }
    //从数据库中读取所有的分类信息，分类信息要借助于category这个模型
    Category.find().then(function(categories) {//读取到的记录实际上是一个数组
       //读取完栏目categories后再把栏目赋值给data.categories
        data.categories = categories;
        //然后进入下一个处理函数
        next();
    });
});


/*
* 首页
* */
router.get('/',function(req,res,next){

    //用data对象存储page limit pages这些数据，方便在后面渲染页面的时候将数据存储进去
    data.category = req.query.category || '';
    data.page =  Number(req.query.page || 1);
    data.limit = 3;
    data.count = 0;
    data.pages = 0;

    var where = {};
    //只有分类id存在--即上排导航对应的分类被点击了，才执行后面的where条件
    if(data.category){
        where.category = data.category
    }
    //读取内容----查询的总条数也是根据where条件相关的-----不同条目下的文章总条数不一样，对应分页不一样
    Content.where(where).count().then(function(count) {

        data.count = count;
        //计算总页数
        data.pages = Math.ceil(data.count / data.limit);//向上取整，避免出现小数---3.5页认为是4页
        //取值不超过pages
        data.page = Math.min(data.page,data.pages);
        //取值不能小于1
        data.page = Math.max(data.page,1);
        var skip = (data.page-1)*data.limit;

        //只有上面的分类id存在--即上排导航对应的分类被点击了，才执行这个where条件
        return Content.where(where).find().limit(data.limit).skip(skip).populate(['category','user']).sort({
            //根据当前的文章发布时间去排序
            addTime: -1
        });
        //读取完成后，内容返回到下面接收
    }).then(function(contents){

        //将接收到的contents赋值给data
        data.contents = contents;
        //console.log(data);

        //    res.render();
//        读取view目录下的指定文件，解析并返回给客户端
//            第一个参数：表示模板的文件，相对于views目录: views/index.html
//            第二个参数：表示传递给模板使用的数据
        //它会找到views底下main目录下的index.html页面

        //console.log(req.userInfo);//打印当前登录信息
        //页面渲染
        res.render('main/index.html',data);//render第二个参数传入的对象就是分配给模板使用的数据---cookies记录登陆状态，前端得保持登陆情况
    });
});

/*
 * 阅读全文,根据传入的文章id进行路由
 */
router.get('/view', function (req, res) {

    var contentId = req.query.contentid || '';

    Content.findOne({
        _id: contentId
    }).then(function (content) {

        data.content = content;

        // 阅读量累加
        content.views++;
        //保存更改
        content.save();
        // console.log(data);
        res.render('main/view.html',data);

    });

});

//把路由返回出去
module.exports = router;