// miniprogram/pages/index/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    t_status: "origin_status",
    t_coursename: "origin_coursename",
    t_creatorname: "origin_creatorname",
    //tip_tag为自己额外添加的
    tip_tag: ['有趣', '考试水', '没作业', '学分多', '不点名', '难选'],
    //t_star:0
  },

  toMain: function () {
    wx.navigateTo({
      url: '../main/main'
    })
  },//跳转回主页面

  starcourse:function()
  {
    
  },

  onLoad: function (options) {
    var _this = this
    wx.cloud.callFunction({
      name: "get_course",
      data: {
        courseid: "5cb9927581ae24ff5b8dcaf4",
      },
      success: res => {
        console.log("get_course : ", res),
        _this.setData({
          t_status: res.result.status,
          t_coursename: res.result.course.courseName,
          t_creatorname: res.result.course.creatorName,
          t_tip_tag:res.result.course.tip_tag
        })
      }
    })
  },

})