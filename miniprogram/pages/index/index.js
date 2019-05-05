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

  navy1: function(e) {
    wx.navigateTo({url: '../greeting/greeting',})
  },
  navy2: function (e) {
    wx.navigateTo({ url: '../main/main', })
  },
  navy3: function (e) {
    wx.navigateTo({ url: '../course/course', })
  },
  navy4: function (e) {
    wx.navigateTo({ url: '../evaluation/evaluation', })
  },
  navy5: function (e) {
    wx.navigateTo({ url: '../user/user', })
  },
  navy6: function (e) {
    wx.navigateTo({ url: '../about/about', })
  },
  navy7: function (e) {
    wx.navigateTo({ url: '../liked/liked', })
  },
  navy8: function (e) {
    wx.navigateTo({ url: '../setting/setting', })
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

    wx.cloud.callFunction({
      name: "has_user_existed",
    })
    .then(function(res) {
      res = res.result
      if (res.status == 1) {
        return
      }
      wx.cloud.callFunction({
        name: "create_new_user",
      })
    })
  },

})