/**
 * Created by Administrator on 2018/1/17.
 */

var mongoose = require('mongoose');
var contentssSchema = require('../schemas/contents');
//创建表结构模型
module.exports = mongoose.model('Content', contentssSchema);//如此，就完成了一个模型类的创建

//后台就可以创建引用该表结构模型了