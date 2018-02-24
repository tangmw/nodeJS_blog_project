/**
 * Created by Administrator on 2018/1/15.
 */

//定义数据库表存储的结构
//一个schema代表数据库中的一个表

//使用mongoose模块定义结构
var mongoose = require('mongoose');

//分类的表结构----表结构建完后，要在models中新建一个模型
module.exports = new mongoose.Schema({

    //分类名称
    name: String

});