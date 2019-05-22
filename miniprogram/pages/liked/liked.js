// miniprogram/pages/about/about.js

var like_courses = [], like_start = 0, like_over = 0, over_show = 0;
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    courses: [],

    t_empty: false,

    chinese_number: ['日', '一', '二', '三', '四', '五', '六', '七', '八', '九'],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  loadlist: function () {
    var that = this
    if (like_over)
    {
      if (over_show == 0)
      {
        over_show = 1;
        wx.showToast({
          title: "到底了",
        })
      }
      return ;
    }
    else {
      wx.showLoading({
        title: "加载中",
      })
    }
    wx.cloud.callFunction({
      name: "get_star_courses",
      data: {
        start: like_start,
        end: like_start+20,
      },
      success: res => {
        if (res.result.status == 0) {
          wx.hideLoading()
          console.error(res.result.errMsg)
          if (like_start == 0 && res.result.errMsg == "get_star_courses: invalid start") {
            that.setData({t_empty: true})
          }
          return
        }
        var t_courses = res.result.courses;
        var las_len = like_courses.length;
        for (var i = 0; i < t_courses.length; ++i){
          like_courses.push(t_courses[i]);
          like_courses[las_len + i].ban = 0;
        }
        this.setData({
          courses: like_courses,
        })

        like_over = res.result.over;
        if (like_over == 0)
          like_start += 20;
        wx.hideLoading()
      }
    })
    console.log("finish");
  },

  star_remove(event) {
    var t_courseid = event.currentTarget.dataset.courseid;
    var t_index = event.currentTarget.dataset.index;
    like_courses[t_index].ban = 1;
    const str = "courses[" + t_index + "].ban"
    this.setData({
      [str]: 1,
    })
    var flag = false
    for (var i in like_courses) {
      if (like_courses[i].ban == 0) {
        flag = true
        break
      }
    }
    if (!flag) {
      this.setData({t_empty: true})
    }
    app.globalData.delStarFromLiked.push(t_courseid)
    wx.cloud.callFunction({
      name: "remove_star2",
      data: { courseid: t_courseid, },
      success: res => {}
    })
  },

  sup_courseindex: "",
  sup_cancel_star() {
    like_courses[this.sup_courseindex].ban = 1
    const str = "courses[" + this.sup_courseindex + "].ban"
    this.setData({[str]: 1})
    app.globalData.delStarFromLiked.push(like_courses[this.sup_courseindex].courseid)
  },

  into_coursePage(event) {
    var t_courseid = event.currentTarget.dataset.courseid;
    this.sup_courseindex = event.currentTarget.dataset.index
    var page_to = "../course/course?courseid=";
    page_to += t_courseid;
    page_to += "&from=liked"
    wx.navigateTo({ url: page_to })
  },

  onLoad: function (options) {
    like_courses = [], like_start = 0, like_over = 0, over_show = 0;
    this.loadlist();
    app.globalData.delStarFromLiked = []
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      path: "/pages/main/main",
    }
  }
})