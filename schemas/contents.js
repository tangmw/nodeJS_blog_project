/**
 * Created by Administrator on 2018/1/15.
 */

//定义数据库表存储的结构
//一个schema代表数据库中的一个表

//使用mongoose模块定义结构
var mongoose = require('mongoose');

//内容的表结构----表结构建完后，要在models中新建一个模型
module.exports = new mongoose.Schema({

    //分类信息
    //该字段和其他表中的字段是关联关系，所以不能简单地设置成一个字符串
    //关联字段 - 内容分类的id
    category:{
        type:mongoose.Schema.Types.ObjectId,
        //引用---引用另外一张表的模型---即models
        ref:'Category'   //此ref的值要对应模型类 models中的Content.js
    },

    //内容标题
    title: String,

    //关联字段 - 用户id ---方便看每篇文章的作者是谁
    user:{
        type:mongoose.Schema.Types.ObjectId,
        //引用---引用另外一张表的模型---即models
        ref:'User'   //此ref的值要对应模型类 models中的Content.js
    },

    //添加时间
    addTime: {
        type: Date,
        default: new Date()    //当前时间
    },

    //点击量--阅读量
    views:{
        type: Number,
        default:0
    },

    //简介
    description:{
        type: String,
        default: ''
    },

    //内容
    content:{
        type: String,
        default: ''
    },

    //评论---存储每篇文章对应的评论信息
    comments:{
        type: Array, //类型是一个数组，默认是一个空数组
        default: []
    },



});