// miniprogram/pages/about/about.js

var like_courses = [], like_start = 0, like_over = 0, over_show = 0;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    courses: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  loadlist: function () {
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
    console.log("load_start : ", like_start);
    wx.cloud.callFunction({
      name: "get_star_courses",
      data: {
        start: like_start,
        end: like_start+20,
      },
      success: res => {
        console.log("load_list : ", res.result.courses);
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
    this.setData({
      courses: like_courses,
    })
    console.log("star_remove : ", );
    wx.cloud.callFunction({
      name: "remove_star",
      data: { courseid: t_courseid, },
      success: res => {}
    })
  },

  into_coursePage(event) {
    var t_courseid = event.currentTarget.dataset.courseid;
    // console.log("show_event : ", event);
    // console.log("into_coursePage : ", t_courseid);
    var page_to = "../course/course?courseid=";
    page_to += t_courseid;
    wx.navigateTo({ url: page_to })
  },

  onLoad: function (options) {
    like_courses = [], like_start = 0, like_over = 0, over_show = 0;
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})