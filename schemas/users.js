/**
 * Created by Administrator on 2018/1/15.
 */

//定义数据库表存储的结构
//一个schema代表数据库中的一个表

//使用mongoose模块定义结构
var mongoose = require('mongoose');

//定义用户的表结构，并且能对外提供----通过schema创建一个表结构对象
module.exports = new mongoose.Schema({
    //每一个属性代表一个字段，这里设置两个字段：用户名和密码
    username: String,
    password: String,
    //是否是管理员字段设置
    //管理员验证信息不要放在cookies中，每次刷新页面的时候都要检测一下，防止进坑
    isAdmin:{
        type: Boolean,
        default: false   //初始情况下是非管理员用户--普通用户
    }
});