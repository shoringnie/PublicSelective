// miniprogram/pages/search/search.js

var list_start = 0, select_start = 0, list_over = 0, cur_select = 0, select_key = "";
var tot_courses = [], select_courses = [];

Page({

  /**
   * 页面的初始数据
   */
  data: {
    written_text: "origin_state",
    tip_tag: ['有趣', '考试水', '没作业'],
    search_tag: "Your teacher is like Liu Cong",
    t_state: "false",
    courses: [],
  },

  onClose() {
    this.setData({ show: false });
  },

  /**
   * 生命周期函数--监听页面加载
  */

  loadlist: function () {
    if (list_over == 1)
    {
      wx.showToast({
        title: "到底了",
      })
      return;
    }
    else
    {
      wx.showToast({
        icon: "loading",
        title: "加载中",
      })
    }
    var that = this, temp_start, temp_key="";
    if (cur_select) 
      temp_start = select_start, temp_key = select_key;
    else
      temp_start = list_start;
    wx.cloud.callFunction({
      name: "get_courses_many",
      data: {
        selector: {keyword:temp_key},
        start: temp_start,
      },
      success: res => {
        console.log("get_courses_many : ", res);
        if (cur_select){
          for (var i = 0; i < res.result.courses.length; ++i) {
            select_courses.push(res.result.courses[i]);
          }
          that.setData({
            courses: select_courses,
          })
        }
        else{
          for (var i = 0; i < res.result.courses.length; ++i) {
            tot_courses.push(res.result.courses[i]);
          }
          that.setData({
            courses: tot_courses,
          })
        }
        list_over = res.result.over;
        if (list_over == 0){
          if (cur_select)
            select_start = select_start+20;
          else
            list_start = list_start+20;
        }
      }
    })
  },

  onLoad: function (options) {
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

  },

  onSearch: function (event) {
    console.log("ok_onSearch");
    console.log("list_start:", list_start);
    cur_select = 1, select_key = event.detail;
    select_start = 0, select_courses = [];
    this.loadlist();
    this.setData({
      written_text: event.detail
    })
  },

  onCancel: function () {
    cur_select = 0, select_key = "";
    this.loadlist();
  },

  onTag: function (event) {
    console.log("onTag :", event)
    this.setData({
      search_tag: event.target.dataset.key
    })
  },

  onChange(event) {
    this.setData({
      activeNames: event.detail
    });
  }

  
})