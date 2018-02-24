/**
 * Created by Administrator on 2018/1/15.
 */

//做管理员界面
var express = require('express');
var router = express.Router();

//做用户界面，需要与数据库交互，引入用户模型
var User = require('../models/User');
//引入后台管理员添加分类的表结构模型
var Category = require('../models/Category');
//引入内容模型
var Content = require('../models/Content');

router.use(function (req,res,next) {

    //是否为管理员用户判断
    if(!req.userInfo.isAdmin){
        //如果当前用户为非管理员
        res.send('对不起，只有管理员才可以进入后台管理');
        return;
    }
    next();//是管理员用户才可以走到下一步
});

//管理首页
router.get('/', function (req,res,next) {
    //渲染管理员后台首页
    res.render('admin/index.html',{
        //将userinfo信息注入进来
        userInfo: req.userInfo
    });
})

//用户管理
router.get('/user', function (req,res) {

    /*
        用户管理的展示---从数据库中读取所有的用户数据，将数据分配给模板，将模板展示出来

        用户管理分页展示
            用到数据库的limit(Number)：限制获取的数据条数----每一页展示Number条
                       skip(Number)：忽略数据的条数---忽略掉前Number条数据，从Number+1开始取

            【例如】每页显示2条
            1： 1-2   skip:0   -> (当前页-1)*limit(Number)
            2： 3-4   skip:2
            3： 5-6   skip:4
            ...
    */
    //分页取数据库数据---方便后期更改，用变量的形式
    var page = Number(req.query.page || 1);  //利用query方法获取前端用户的get请求中?page=number里请求的当前页，如果用户没有请求，则默认为显示第一页------为避免程序出错，可以加一个判断page传入的是否为数字
    var limit = 10; //每页显示两条数据
    var pages = 0;  //总页数初始化

    //将page参数传到前端之前，先剔除超界的分页情况(小于1或者大于最大页码)---最大页码=总条数/每页显示条数
    //获取数据库中用户数据的总条数
    User.count().then(function (count) {//count返回从数据库查到的总用户条数

        //计算总页数
        pages = Math.ceil(count / limit);//向上取整，避免出现小数---3.5页认为是4页
        //取值不超过pages
        page = Math.min(page,pages);
        //取值不能小于1
        page = Math.max(page,1);

        var skip = (page-1)*limit;  //skip值是根据page值动态变化的

        //读取数据库中用户表里的所有用户记录find函数，然后将它展示出来（then方法）
        User.find().limit(limit).skip(skip).then(function (users) {//异步获取
            //console.log(users);
            //可以将读取到的用户记录传递给模板--所以render函数后面会加对象参数
            res.render('admin/user_index.html',{
                userInfo:req.userInfo,
                users:users,

                //将page也传递到前端去---显示上一页还是下一页必须明确当前是第几页
                page: page,
                pages: pages,
                limit: limit,
                count: count
            });
        });
    });
});

//分类首页
router.get('/category', function (req,res) {

    var page = Number(req.query.page || 1);  //利用query方法获取前端用户的get请求中?page=number里请求的当前页，如果用户没有请求，则默认为显示第一页------为避免程序出错，可以加一个判断page传入的是否为数字
    var limit = 10; //每页显示两条数据
    var pages = 0;  //总页数初始化

    //将page参数传到前端之前，先剔除超界的分页情况(小于1或者大于最大页码)---最大页码=总条数/每页显示条数
    //获取数据库中用户数据的总条数
    Category.count().then(function (count) {//count返回从数据库查到的总用户条数

        //计算总页数
        pages = Math.ceil(count / limit);//向上取整，避免出现小数---3.5页认为是4页
        //取值不超过pages
        page = Math.min(page,pages);
        //取值不能小于1
        page = Math.max(page,1);

        var skip = (page-1)*limit;  //skip值是根据page值动态变化的

        //读取数据库中用户表里的所有用户记录find函数，然后将它展示出来（then方法）
        /*
        *运用sort排序
        *   1：表示升序
        *   -1：表示降序
        *
        *   数据库中的id是按照时间戳的方式赋值的=>越是新的数据，它的时间戳越大，如果要把新的数据放在前面显示的话，那么其实使用降序排列
        * */
        Category.find().sort({_id:-1}).limit(limit).skip(skip).then(function (categories) {//异步获取
            //console.log(users);
            //可以将读取到的用户记录传递给模板--所以render函数后面会加对象参数
            res.render('admin/category_index.html',{
                userInfo:req.userInfo,
                categories:categories,

                //将page也传递到前端去---显示上一页还是下一页必须明确当前是第几页
                page: page,
                pages: pages,
                limit: limit,
                count: count
            });
        });
    });
});

//分类添加
router.get('/category/add', function (req,res) {
    res.render('admin/category_add.html',{
        userInfo: req.userInfo
    });
});

//分类的保存--接收前端提交过来的表单数据
//以get方式访问的话，将会给它一个界面；以post方式访问的话，告诉它接收的是表单提交过来的数据
//需要将表单提交过来的数据进行保存，保存到分类的表结构---categories.js
router.post('/category/add', function (req,res) {

    //console.log(req.body);
    //当提交过来的数据不满足要求时，让它跳转到一个错误页面--如果用ajax则可以显示错误提示，这里用的是网页路由，所以是跳转页面报错的形式
    var name = req.body.name || '';
    if( name == '' ) {
        //跳转到错误页面----往错误页面中传递一些参数用于细化提示具体是哪个信息出错
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '名称不能为空',
            //传入url指明进入错误页面后需要跳转到的指定url页面
            //url:
        });
        return;   //这里错了就不再需要往下走了
    }
        //数据库中是否存在已同名的分类名称
        // 需要通过数据库查询来看一下数据库中是否有相同name的数据存在
        //需要引入上面的Category模型
        //通过Category里的name方法来查询name值为name的记录
        Category.findOne({
            name: name
        }).then(function (rs) {//rs为从数据库中找到分类的结果，如果存在，则找到，说明数据库中有相同的分类名称；如果不存在，则没找到
            if(rs){
                //表示数据库中已经存在该分类了---应返回前端一个错误信息
                res.render('admin/error.html',{
                    userInfo: req.userInfo,
                    message: '该分类已经存在'
                });
                return Promise.reject();
            }else {//else完后与if一样，返回的是一个promis对象
                //表示数据库当中是不存在该分类，可以保存
                //创建一个category实例对象，再把name传入进去，然后调用它的save方法进行保存
                return new Category({
                    name: name
                }).save();
            }
        }).then(function (newCategory) {//保存到数据库中一个新的记录对象
            //返回前端正确的信息
            res.render('admin/success',{
                userInfo: req.userInfo,
                message: '分类保存成功',
                url: '/admin/category'//跳转到分类的添加页面
            });
        });
});

/*
* 分类修改
* */
router.get('/category/edit', function (req,res) {

    //获取要修改的分类信息，并且在前端用表单的形式展示出来
    //得到传入过来的id
    var id = req.query.id || '';  //获取不到id就为空
    //获取要修改的分类信息
    Category.findOne({
        _id: id   //左边数据库中的_id值是否与找到的请求文件中传上来的id值一样
    }).then(function (category) {
        if(!category){//category不存在，说明没有这个分类信息
            res.render('admin/error',{
                userInfo: req.userInfo,
                message: '分类信息不存在'
            });
        }else{//分类信息是存在的
            res.render('admin/category_edit',{
                userInfo: req.userInfo,
                category: category
            });
        }
    });
});

/*
* 分类的修改保存
* */
//因为管理员在category_edit.html界面中提交分类修改数据时使用表单的post方式提交，因此后端在接收前端提交的post请求数据时也应该采用post方式接收
//增加路由，用post方式接收
router.post('/category/edit', function (req,res) {

    //获取要修改的分类信息，并且在前端用表单的形式展示出来
    //得到传入过来的id
    var id = req.query.id || '';  //获取不到id就为空
    //获取post提交过来的名称
    var name = req.body.name; //获取前端name标签的数据

    //获取要修改的分类信息
    Category.findOne({
        _id: id   //左边数据库中的_id值是否与找到的请求文件中传上来的id值一样
    }).then(function (category) {
        if(!category){//category不存在，说明没有这个分类信息
            res.render('admin/error',{
                userInfo: req.userInfo,
                message: '分类信息不存在'
            });
            return Promise.reject();
        }else{//分类信息是存在的
            //当用户没有做任何的修改提交的时候，要判断当前是否有修改，可以放在前端去做
            if( name == category.name){//说明用户没有做任何修改
                res.render('admin/success',{
                    userInfo: req.userInfo,
                    message: '修改成功',
                    url: '/admin/category'//跳转到分类的添加页面
                });
                return Promise.reject();
            }else{//当前用户对分类名做了修改
                //判定要修改的分类名称是否已经在数据库中存在了
                return Category.findOne({
                    _id: {$ne:id},  //数据库中的id与前端提交的分类名id不相同，但是名字是一样的。说明数据库中已经存在一条与我即将修改的名称一样的分类数据了，这个时候是不允许它修改的
                    name: name
                });
            }
        }
    }).then(function (sameCategory) {
        if(sameCategory){
            //表示当前数据库中已有同名的数据存在了
            res.render('admin/error',{
                userInfo: req.userInfo,
                message: '数据库中已经存在同名分类'
            });
            return Promise.reject();
        }else{  //数据库中不存在同名的而且没在之前return的，就说明可以保存了
            //使用category中的update方法更新保存数据
            return Category.update({
                _id: id
            },{
                name:name
            });
        }
    }).then(function () {
        res.render('admin/success',{
            userInfo: req.userInfo,
            message: '修改成功',
            url: '/admin/category'//跳转到分类的添加页面
        });
    });
});
/*
* 分类删除
* */
router.get('/category/delete', function (req, res) {

    //获取要删除的分类的id
    var id = req.query.id || '';

    //调用remove方法
    Category.remove({
        _id : id   // 条件就是id，删除数据库中该id下的信息
    }).then(function () {
        res.render('admin/success',{
            userInfo: req.userInfo,
            message: '删除成功',
            url: '/admin/category'//跳转到分类的添加页面
        });
    });
});
/*
* 内容首页
* */
router.get('/content', function (req,res) {

    var page = Number(req.query.page || 1);
    var limit = 10;
    var pages = 0;

    Content.count().then(function (count) {//count返回从数据库查到的总用户条数

        //计算总页数
        pages = Math.ceil(count / limit);//向上取整，避免出现小数---3.5页认为是4页
        //取值不超过pages
        page = Math.min(page,pages);
        //取值不能小于1
        page = Math.max(page,1);

        var skip = (page-1)*limit;
        //populate('category')对应的是schemas中的categories表结构,通过此句可以读取到关联表的属性，从而可以把属性中的某一个信息传送到前端展示
        Content.find().sort({_id:-1}).limit(limit).skip(skip).populate(['category','user']).sort({
            addTime: -1
        }).then(function (contents) {//异步获取

            //console.log(contents);//打印出来的信息中content中包含category表结构里的属性

            res.render('admin/content_index.html',{
                userInfo:req.userInfo,
                contents:contents,

                page: page,
                pages: pages,
                limit: limit,
                count: count
            });
        });
    });
});

/*
 * 内容添加页面
 * */
router.get('/content/add', function (req,res) {

    //读取分类信息---动态添加到内容分类下拉菜单中---按添加时间戳降序排列--新添加的放上面
    Category.find().sort({_id:-1}).then(function (categories) {

        //渲染首页
        res.render('admin/content_add.html',{
            userInfo: req.userInfo,
            categories: categories
        });
    });
});

/*
* 内容保存
*   由于前端是用post方式提交的表单数据，因此这里的路由也设置为post方式返送给后端
* */
router.post('/content/add', function (req,res) {

    //console.log(req.body);
    //将获取到的信息保存到数据库当中

    //获取到输入的内容信息判断是否为空
    if(req.body.category == ''){
        res.render('admin/error.html',{
            userInfo: req.userInfo,
            message: '内容分类不能为空'
        });
        return;
    }
    //验证标题
    if(req.body.title == '' ){
        res.render('admin/error.html',{
            userInfo: req.userInfo,
            message: '标题不能为空'
        });
        return;
    }

    //如果验证通过了就要保存提交过来的数据
    //保存数据到数据库---新建content对象,将通过body属性获得的前台数据保存到content对象中，调用save方法进行保存
    new Content({
        category:req.body.category,
        title: req.body.title,
        user: req.userInfo._id.toString(),
        description: req.body.description,
        content: req.body.content
    }).save().then(function (rs) {
            res.render('admin/success.html',{
                userInfo: req.userInfo,
                message: '内容保存成功',
                url:'/admin/content'
            });
        });
});

/*
* 内容修改
* */
router.get('/content/edit', function (req,res) {

    //获取前端要修改内容的id
    var id = req.query.id || '';

    //读取分类信息----从另一个表结构中读取
    //读取分类信息---动态添加到内容分类下拉菜单中---按添加时间戳降序排列--新添加的放上面

    var categories = [];

    Category.find().sort({_id:1}).then(function (rs) {

        categories = rs;

        //从数据库中找从前端获取的id号的内容
        return Content.findOne({
            _id: id
        }).populate('category');//将前端对应id所属的categories结构类的数据也传上来
    }).then(function (content) {//content为读取出来的内容信息------查找到之后再来处理

        //console.log(content);   //用find()查询后打出来的content是一个数组，要想获取它的元素在数据库查询时应该用findOne

        if(!content){
            res.render('admin/error',{
                userInfo: req.userInfo,
                message: '编辑内容不存在'
            });
            return Promise.reject();
        }else{//内容存在的话去渲染页面
            res.render('admin/content_edit.html',{
                userInfo: req.userInfo,
                categories: categories,
                content: content
            });//将数据传到渲染的页面中去
        }
    });
});

/*
 * 保存内容修改
 * */
router.post('/content/edit', function (req,res) {

    var id = req.query.id || '';
    if(req.body.category == ''){
        res.render('admin/error.html',{
            userInfo: req.userInfo,
            message: '内容分类不能为空'
        });
        return;
    }
    //验证标题
    if(req.body.title == '' ){
        res.render('admin/error.html',{
            userInfo: req.userInfo,
            message: '标题不能为空'
        });
        return;
    }
    //update两个参数----一个是条件，一个是要保存的内容
    Content.update({//条件
        _id: id
    },{//要保存的内容
        category: req.body.category,
        title: req.body.title,
        description:req.body.description,
        content: req.body.content
    }).then(function () {
        res.render('admin/success',{
            userInfo: req.userInfo,
            message: '内容保存成功',
            url: '/admin/content/edit?id='+id
        })
    });
});

/*
 * 内容的删除
 * */
router.get('/content/delete', function (req,res) {

    var id = req.query.id || '';

    //remove操作--直接删除
    //调用remove方法
    Content.remove({
        _id : id   // 条件就是id，删除数据库中该id下的信息
    }).then(function () {
        res.render('admin/success',{
            userInfo: req.userInfo,
            message: '内容删除成功',
            url: '/admin/content'//跳转到分类的添加页面
        });
    });

});



//把路由返回出去
module.exports = router;