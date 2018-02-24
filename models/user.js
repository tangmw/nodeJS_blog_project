/**
 * Created by Administrator on 2018/1/17.
 */
var mongoose = require('mongoose');
var usersSchema = require('../schemas/users');

//用mongoose方法创建一个模型---通过表结构对象创建一个模型类
module.exports = mongoose.model('User',usersSchema); //如此，就完成了一个模型类的创建