// miniprogram/pages/evaluation/evaluation.js

var courseid, prevPageWhichtab
var score = {}, content = ""
var temp_selected = {}
const allTags = ["不点名", "偶尔点名", "经常点名", "做pre", "写论文", "闭卷考试", "开卷考试", "难度大", "有深度", "新技能", "涨知识", "有趣味", "给分低", "给分高"]
var submitted = false

function init() {
  courseid = ""
  score = {"overall": 3, "difficulty": 3, "hardcore": 3}
  content = ""
  submitted = false
}

function is_space_string(s) {
  for (var i in s) {
    if (s[i] != ' ' && s[i] != '\n' && s[i] != '\t' && s[i] != '\r') {
      return false
    }
  }
  return true
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    t_courseName: "",

    t_taglist: allTags,
    t_selected: {},
    t_result: []
  },

  onChange(event) {
    score[event.target.dataset.key] = event.detail
  },
  on_tagbutton_click(e) {
    temp_selected[e.currentTarget.dataset.tag] = e.currentTarget.dataset.selected
    this.setData({t_selected: temp_selected})
  },
  on_input(e) {
    content = e.detail.value
  },
  on_submit(e) {
    if (submitted) {
      console.warn("trying to resubmit comment!")
      return
    }
    if (is_space_string(content)) {
      wx.showModal({
        title: "评论过短",
        content: "请多评价该门课几句吧",
        showCancel: false,
        confirmText: "我知道了",
      })
      return
    }
    var tags = []
    for (var i in allTags) {
      if (temp_selected[allTags[i]] == 1) {
        tags.push(allTags[i])
      }
    }
    if (tags.length == 0) {
      wx.showModal({
        title: "未打标签",
        content: "请为该门课打几个标签吧",
        showCancel: false,
        confirmText: "我知道了",
      })
      return
    }

    const comment = {
      courseid: courseid,
      overall: score.overall,
      difficulty: score.difficulty,
      hardcore: score.hardcore,
      tags: tags,
      content: content,
    }
    wx.cloud.callFunction({
      name: "submit_comment",
      data: {comment: comment,},
      success(res) {
        res = res.result
        if (res.status == 0) {
          wx.showToast({
            title: "提交失败",
            icon: "none",
          })
          console.log(res.errMsg)
          return
        }
        submitted = true
        wx.showToast({
          title: "提交成功",
        })

        /* 让上一页（course页）刷新 */
        var pages = getCurrentPages()
        var prevPage = pages[pages.length - 2]
        prevPage.onLoad({courseid: courseid, whichtab: prevPageWhichtab})

        setTimeout(function() {
          wx.navigateBack({
            delta: 1,
          })
        }, 1000)
      },
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    init()
    for (var i in allTags) {
      temp_selected[allTags[i]] = 0
    }
    courseid = options.courseid
    console.log("evaluation, options = ", options)
    prevPageWhichtab = options.whichtab
    wx.cloud.callFunction({
      "name": "get_course",
      data: {courseid: courseid},
      success: function(res) {
        res = res.result
        if (res.status == 0) {
          console.log(res.errMsg)
          return
        }
        that.setData({
          t_courseName: res.course.courseName,
          t_selected: temp_selected,
        })
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