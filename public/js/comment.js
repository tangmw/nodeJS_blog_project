/**
 * Created by Administrator on 2018/1/24.
 */

//此js为前端的js

var perpage = 2; //每页评论显示两条
var page = 1;//定义当前页数，默认情况下是第一页
var pages = 0;//定义总页数，初始化为0
var comments = []; //全局的评论列表

//当点击评论提交按钮的时候，就发送一个ajax请求给后端----后端的post接收请求已经写在api.js文件里了
//提交评论---对照api.js里的router.post('/comment/post'函数
$('#messageBtn').on('click', function () {
    $.ajax({
        type:'POST',
        url: '/api/comment/post',
        data:{
            contentid:$('#contentId').val(),
            content:$('#messageContent').val()
        },
        //成功后的内容，返回的数据responseData
        success: function(responseData){
            //console.log(responseData);//responseData就是提交评论后后端返回的json数据
            //提交评论成功后做的事情

            //将评论栏的文字内容清空
            $('#messageContent').val('');
            comments = responseData.data.comments.reverse();
            renderComment();//把数组反转一下再来显示
        }
    })
})

//每次页面重载的时候获取一下该文章的所有评论
//默认采用get方式--可以不传
$.ajax({
    url: '/api/comment',
    data:{
        contentid:$('#contentId').val()
    },
    //成功后的内容，返回的数据responseData
    success: function(responseData){
        comments = responseData.data.reverse();
        renderComment();//把数组反转一下再来显示
    }
});

//上一页下一页添加点击事件---采用delegate事件委托的方式
//第一个委托的是a，第二个委托的事件是click
//找到class标签为pager下的所有a标签---最终判断是上一页的a还是下一页的a通过它们各自的class标签可以判别
$('.pager').delegate('a','click', function () {
    if($(this).parent().hasClass('previous')){
        page--;
    }else{
        page++;
    }
    //对分页数据进行重新渲染------comments从哪儿来？？？------解决方案是将comments做成全局变量
    renderComment();
});


//通过后端返回的post请求文件里的comment数组，去渲染评论列表---由数据渲染列表
//根据所有评论comments
function renderComment(){

    $('#messageCount').html(comments.length);

    //算出总页数
    pages = Math.max(Math.ceil(comments.length / perpage),1);//总页数=评论总条数/每页显示多少条，对它向上取整

    //开始算每页显示多少评论数---在下面的for循环控制显示条数
    var start = Math.max(0,(page-1)*perpage);
    var end = Math.min(start + perpage,pages);

    //获取前端评论分页的li
    var $lis = $('.pager li');
    //填充第二个li里的内容
    $lis.eq(1).html( page+' / '+pages );

    if( page <= 1 ){
        page = 1;
        $lis.eq(0).html('<span>没有上一页了</span>');
    }else{
        $lis.eq(0).html('<a href="javascript:;">上一页</a>');
    }
    if( page >= pages ){
        page = pages;
        $lis.eq(2).html('<span>没有下一页了</span>>');
    }else{
        $lis.eq(2).html('<a href="javascript:;">下一页</a>');
    }

    //当没有评论时显示没有评论提示
    if(comments.length == 0){
        $('.messageList').html('<div class="messageBox"<p>还没有评论</p></div>');
    }else{
        //根据当前所有的评论的内容去渲染里面的评论
        var html = '';
        for(var i=start;i<end;i++){
            html += '<div class="messageBox">'+
                '<p class="name clear"><span class="fl">'+comments[i].username+'</span><span class="fr">'+formatData(comments[i].postTime)+'</span></p><p>'+comments[i].content+'</p>'+
                '</div>'
        }
        //console.log($('messageList').html);
        //将上述渲染的html放到messageList中
        $('.messageList').html(html);
    }
}

//格式化时间
function formatData(d){
    //console.log(typeof d);//在前端的console展示类型
    var date1 = new Date(d);//将string类型变成对象类型
    //
    return date1.getFullYear()+'年'+(date1.getMonth()+1)+'月'+date1.getDate()+'日'+ date1.getHours()+':'+date1.getMinutes()+':'+date1.getSeconds()  ;
}