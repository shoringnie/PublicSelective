// miniprogram/pages/search/search.js

var list_start = 0, select_start = 0, list_over = 0, cur_select = 0, select_key = "", over_show = 0;
var tot_courses = [], select_courses = [];
var dict = {}, like = 0;
var user, like_set = new Set ();
const time_picker_content = {
  '星期几' : ['全部时间', '周一', '周二', '周三', '周四', '周五', '周六'],
  '第几节': ['全部时间', '第一节', '第二节', '第三节', '第四节', '第五节', '第六节', '第七节', '第八节', '第九节'],
};
const sort_picker_content = {
  '排序方式' : ['默认排序', '综合评分', '考察难度', '干货程度']
}
const campus_picker_content = {
  '校区' : ['全校区', '东校园', '南校园', '北校园', '珠海校区', '深圳校区']
}
var select_wday = -1, select_time = -1, select_campus = "", select_sort = 0;
var to_sort = ['NAN', 'overall', 'difficulty', 'hardcore'];
var server_status = 0;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    chinese_number: ['日','一','二','三','四','五','六','七','八','九'],
    is_like: 0,
    written_text: "origin_state",
    tip_tag: ['有趣', '考试水', '没作业'],
    search_tag: "Your teacher is like Liu Cong",
    t_state: "false",
    courses: [],
    cur_list_course: "",
    //时间筛选器
    time_show: false,
    time_text: "全周·全天",
    time_picker: [
      {
        values: time_picker_content['星期几'],
        className: 'column1',
        defaultIndex: 0
      },
      {
        values: time_picker_content['第几节'],
        className: 'column2',
        defaultIndex: 0
      }
    ],
    //校区筛选器
    campus_show: false,
    campus_text: '全校区',
    campus_picker: [
      {
        values: campus_picker_content['校区'],
        className: 'column1',
        defaultIndex: 0
      }
    ],
    //排序筛选器
    sort_show: false,
    sort_text: '默认排序',
    sort_picker: [
      {
        values: sort_picker_content['排序方式'],
        className: 'column1',
        defaultIndex: 0,
      }
    ],
    sort_order: 1, //升降序
    course_number: 1, //课程总数
  },

  onClose() {
    this.setData({ show: false });
  },

  loadlist: function () { //载入列表函数
    //判断是否到底
    if (list_over == 1)
    {
      if (!over_show)
      {
        over_show = 1;
        wx.showToast({
          title: "到底了",
        })
      }
      return;
    }
    else
    {
      wx.showLoading({
        title: "加载中",
      })
    }
    var that = this, temp_start, temp_key="";
    if (cur_select) 
      temp_start = select_start, temp_key = select_key;
    else
      temp_start = list_start;
    var temp_selector = {keyword: temp_key, wday: select_wday, time: select_time, campus: select_campus};
    if (select_wday == -1) delete temp_selector.wday;
    if (select_time == -1) delete temp_selector.time;
    if (select_campus == "") delete temp_selector.campus;
    // console.log("loadlist : ", temp_selector);
    // console.log("sort_order : ", this.data.sort_order);

    var temp_picker = {selector: temp_selector, start: temp_start, sortby: to_sort[select_sort], order: this.data.sort_order};
    if (select_sort == 0) delete temp_picker.sortby;
    //筛选项
    wx.cloud.callFunction({
      name: "get_courses_many",
      data: temp_picker,
      success: res => {
        // console.log("res :", res);
        if (cur_select){
          var las_len = select_courses.length;
          for (var i = 0; i < res.result.courses.length; ++i) {
            select_courses.push(res.result.courses[i]);
            select_courses[las_len+i].star = like_set.has(res.result.courses[i].courseid);
          }
          that.setData({
            courses: select_courses,
          })
        }
        else{
          var las_len = tot_courses.length;
          for (var i = 0; i < res.result.courses.length; ++i) {
            tot_courses.push(res.result.courses[i]);
            tot_courses[las_len+i].star = like_set.has(res.result.courses[i].courseid);
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
        server_status = 0;
        this.setData({
          course_number: res.result.courses.length,
        })
        wx.hideLoading()
      }
    })
  },

  onLoad: function (options) {//首次载入列表
    var that = this;
    wx.cloud.callFunction({
      name: "has_user_existed",
      success: res => {
        res = res.result
        if (res.status == 0) {
          wx.redirectTo({
            url: "../authorization/authorization",
          })
        }
      }
    })
    wx.cloud.callFunction({
      name: "get_user",
      data: {

      },
      success: res=> {
        user = res.result.user;
        for (var i = 0; i < user.stars.length; ++i)
          like_set.add(user.stars[i]);
        this.loadlist();
      }
    })
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

  onChange(event) {
    this.setData({
      activeNames: event.detail
    });
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

  search_onSearch: function (event) { //搜索触发后
    // console.log("ok_onSearch");
    // console.log("select_key:", event.detail);
    cur_select = 1, select_key = event.detail;
    select_start = 0, select_courses = [], list_over = 0;
    this.loadlist();
    this.setData({
      written_text: event.detail
    })
  },

  select_clear: function() { //筛选栏初始化
    this.setData({
      time_text: "全周·全天",
      campus_text: "全校区",
      sort_text: "默认排序",
    })
    select_wday = -1, select_time = -1, select_campus = "", select_sort = 0;
  },

  search_onCancel: function () { //取消一切限制
    // if (!cur_select) return ;
    cur_select = 0, select_key = "", list_over = 0;
    this.select_clear();
    this.refresh();
    this.loadlist();
  },

  onTag: function (event) {
    // console.log("onTag :", event)
    this.setData({
      search_tag: event.target.dataset.key
    })
  },

  refresh: function () {
    list_over = 0, over_show = 0;
    if (cur_select) {
      select_start = 0;
      select_courses = [];
    }
    else {
      list_start = 0;
      tot_courses = [];
    }
  },

  //popup弹出框
  time_popup: function () {
    this.setData({
      time_show : !this.data.time_show,
    })    
  },  

  campus_popup: function () {
    this.setData({
      campus_show: !this.data.campus_show,
    })
  },

  sort_popup: function () {
    this.setData({
      sort_show: !this.data.sort_show,
    })
  },

  time_onConfirm: function (event) {
    // console.log("time_picker_onChange");
    const { picker, value, index } = event.detail;
    // console.log("temp_data : ", value, index);
    var temp_text = "";
    if (index[0] == 0 && index[1] != 0){
      temp_text = "全周·"+value[1];
    }
    else if (index[0] != 0 && index[1] == 0){
      temp_text = value[0]+"·全天";
    }
    else if (index[0] == 0 && index[1] == 0){
      temp_text = "全周·全天";
    }
    else{
      temp_text = value[0]+"·"+value[1];
    }
    this.setData({
      time_text: temp_text,
    })
    if (index[0] == 0) select_wday = -1;
    else select_wday = index[0];
    if (index[1] == 0) select_time = -1;
    else select_time = index[1];
    this.time_popup();
    this.refresh();
    this.loadlist();
  },


  campus_onConfirm: function (event) {
    const {picker, value, index} = event.detail;
    this.setData({
      campus_text: value[0],
    })
    if (index[0] == 0) select_campus = "";
    else if (index[0] == 1) select_campus = "east";
    else if (index[0] == 2) select_campus = "south";
    else if (index[0] == 3) select_campus = "north";
    else if (index[0] == 4) select_campus = "zhuhai";
    this.campus_popup();
    this.refresh();
    this.loadlist();
  },

  sort_onConfirm: function (event) {
    const {picker, value, index} = event.detail;
    this.setData({
      sort_text: value[0],
    })
    select_sort = index[0];
    this.sort_popup();
    this.refresh();
    this.loadlist();
  },

  order_change: function () {
    if (server_status == 1) {
      wx.showToast({
        title: "操作太频繁",
        icon: "none",
      })
      return
    }
    this.setData({
      sort_order: this.data.sort_order ^ 1,
    })
    this.refresh();
    server_status = 1;
    this.loadlist();
  },

  //页面跳转
  into_coursePage(event) {
    var t_courseid = event.currentTarget.dataset.courseid;
    // console.log("show_event : ", event);
    // console.log("into_coursePage : ", t_courseid);
    var page_to = "../course/course?courseid=";
    page_to += t_courseid;
    page_to += "&from=main";
    this.sup_index = event.currentTarget.dataset.index
    wx.navigateTo({ url: page_to})
  },

  sup_index: 0,
  maintain_like(back_star) {
    var temp_courses;
    if (cur_select)
    {
      temp_courses = select_courses;
    }
    else
    {
      temp_courses = tot_courses;
    }
    if (temp_courses[this.sup_index].star != back_star)
    {
      temp_courses[this.sup_index].star = back_star;
      this.setData({ courses: temp_courses });
      if (back_star == 1)
      {
        like_set.add(temp_courses[this.sup_index].courseid);
      }
      else
      {
        like_set.delete(temp_courses[this.sup_index].courseid);
      }
    }
  },

  //课程收藏
  func_like(event) {
    var that = this;
    // console.log("func_like courseid:", event.currentTarget.dataset.courseid);
    // console.log("func_like index:", event.currentTarget.dataset.index);
    var t_courseid = event.currentTarget.dataset.courseid;
    var t_index = event.currentTarget.dataset.index;
    var before_star = event.currentTarget.dataset.star;
    var t_course, t_star;
    // console.log("tot_star: ", tot_courses[t_index].star);

    var temp_courses;
    if (cur_select) 
    {
      temp_courses = select_courses;
    }
    else
    {
      temp_courses = tot_courses;
    }

    /* 试图收藏 */
    if (temp_courses[t_index].star == 0)
    {
      if (like_set.has(t_courseid))
      {
        wx.showToast({
          title: "操作太频繁",
          icon: "none",
        });
        return;
      }
      temp_courses[t_index].star = 1;
      this.setData({ courses: temp_courses });
      wx.showToast({
        title: "收藏成功",
        icon: "none",
      })
      wx.cloud.callFunction({
        name: "add_star",
        data: {courseid: t_courseid},
        success(res) {
          res = res.result;
          if (res.status == 0)
          {
            console.error(res.errMsg);
            return;
          }
          like_set.add(t_courseid);
        },
      });
    }
    /* 试图取消收藏 */
    else
    {
      if (!like_set.has(t_courseid)) {
        wx.showToast({
          title: "操作太频繁",
          icon: "none",
        });
        return;
      }
      temp_courses[t_index].star = 0;
      this.setData({ courses: temp_courses });
      wx.showToast({
        title: "取消收藏",
        icon: "none",
      })
      wx.cloud.callFunction({
        name: "remove_star",
        data: { courseid: t_courseid },
        success(res) {
          res = res.result;
          if (res.status == 0) {
            console.error(res.errMsg);
            return;
          }
          like_set.delete(t_courseid);
        },
      });
    }
  },

})