// miniprogram/pages/index/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    t_status: "origin_status",
    t_coursename: "origin_coursename",
    t_creatorname: "origin_creatorname"
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
          t_creatorname: res.result.course.creatorName
        })
      }
    })
  },

})