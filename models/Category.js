/**
 * Created by Administrator on 2018/1/17.
 */

var mongoose = require('mongoose');
var categoriesSchema = require('../schemas/categories');
//创建表结构模型
module.exports = mongoose.model('Category', categoriesSchema);//如此，就完成了一个模型类的创建

//后台就可以创建引用该表结构模型了