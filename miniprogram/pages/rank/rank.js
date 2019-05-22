// miniprogram/pages/rank/rank.js

var rank_courses = [], rank_start = 0, rank_over = 0, over_show = 0; 

Page({

  /**
   * 页面的初始数据
   */
  data: {
    courses: [],

  },

  preset: function() {
    rank_courses = [];
    rank_start = rank_over = over_show = 0;
  },

  into_coursePage(event) {
    var t_courseid = event.currentTarget.dataset.courseid;
    var page_to = "../course/course?courseid=";
    page_to += t_courseid;
    wx.navigateTo({ url: page_to });
  },

  loadlist: function () {
    if (rank_over){
      if (over_show == 0){
        over_show = 1;
        wx.showToast({
          title: "到底了",
        })
      }
      return ;
    }
    else{
      wx.showLoading({
        title: "加载中",
      })
    }
    wx.cloud.callFunction({
      name: "get_courses_many",
      data: { 
        start: rank_start,
        sortby: "popularity",
      },
      success: res => {
        if (res.result.status == 0) {
          wx.hideLoading();
          console.error(res.result.errMsg);
          return ;
        }
        var t_courses = res.result.courses;
        var las_len = rank_courses.length;
        for (var i = 0; i < t_courses.length; ++i) {
          rank_courses.push(t_courses[i]);
        }
        this.setData({
          courses: rank_courses,
        })
        rank_over = res.result.over;
        if (rank_over == 0)
          rank_start += 20;
        wx.hideLoading();
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.preset();
    this.loadlist();
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
    this.loadlist();
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