// miniprogram/pages/index/index.js

var serverStarred, whichtab = 0
var startindex = 0, over = 0, commentlist = []
var courseid
var bottomReached = false
var serverLiked, commentid2index = {}
const blockSize = 20

function get_score_array(score) {
  score = Math.round(score)
  var rt = new Array(5).fill("#cccccc")
  for (var i = 0; i < score; ++i) {
    rt[i] = "#FFA500"
  }
  return rt
}

function formatDate(stamp) {
  const now = new Date(stamp)
  var year = now.getFullYear();
  var month = now.getMonth() + 1;
  var date = now.getDate();
  var hour = now.getHours();
  var minute = now.getMinutes();
  const curr = new Date()
  const currstamp = curr.getTime()
  if (stamp <= currstamp - 365 * 3600000) {
    return year + "." + month + "." + date
  }
  if (date < curr.getDate() - 1) {
    return month + "." + date
  }
  if (minute < 10) {
    minute = "0" + minute
  }
  var whichday = ""
  if (date == curr.getDate()) {
    whichday = "今天"
  }
  else {
    whichday = "昨天"
  }
  return whichday + " " + hour + ":" + minute;
}

function init() {
  startindex = 0
  over = 0
  commentlist = []
  whichtab = 0
  bottomReached = false
  serverLiked = new Set()
  commentid2index = {}
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    t_status: "origin_status",
    t_courseid: "",
    t_coursename: "",
    t_creatorname: "",
    //tip_tag为自己额外添加的
    tip_tag: [],
    tip_tag_color: [],
    t_starred: 0,
    t_time: "",
    t_campus: "",
    t_unit: "",
    t_intro: "",
    t_original_overall: 0,
    t_original_difficulty: 0,
    t_original_hardcore: 0,
    t_score_overall: ["#cccccc", "#cccccc", "#cccccc", "#cccccc", "#cccccc"],
    t_score_difficulty: ["#cccccc", "#cccccc", "#cccccc", "#cccccc", "#cccccc"],
    t_score_hardcore: ["#cccccc", "#cccccc", "#cccccc", "#cccccc", "#cccccc"],
    t_comments: [],
  },

  starcourse:function()
  {
    
  },

  on_star: function(e) {
    if (serverStarred == 1) {
      wx.showToast({
        title: "操作太频繁",
        icon: "none",
      })
      return
    }
    this.setData({t_starred: 1,})
    wx.showToast({
      title: "收藏成功",
    })
    wx.cloud.callFunction({
      name: "add_star",
      data: {
        courseid: e.target.dataset.courseid,
      },
      success: res => {
        res = res.result
        if (res.status <= 0) {
          wx.showToast({
            title: "操作太频繁",
            icon: "none",
          })
          return
        }
        serverStarred = 1
      },
    })
  },
  on_unstar: function (e) {
    if (serverStarred == 0) {
      wx.showToast({
        title: "操作太频繁",
        icon: "none",
      })
      return
    }
    this.setData({ t_starred: 0, })
    wx.showToast({
      title: "取消收藏成功",
    })
    wx.cloud.callFunction({
      name: "remove_star",
      data: {
        courseid: e.target.dataset.courseid,
      },
      success: res => {
        res = res.result
        if (res.status <= 0) {
          wx.showToast({
            title: "操作太频繁",
            icon: "none",
          })
          return
        }
        serverStarred = 0
      },
    })
  },
  on_like_comment: function(e) {
    const commentid = e.target.dataset.commentid
    if (serverLiked.has(commentid)) {
      wx.showToast({
        title: "操作太频繁",
        icon: "none",
      })
      return
    }
    const index = commentid2index[commentid]
    var temp_comments = this.data.t_comments
    temp_comments[index].doILike = 1
    ++temp_comments[index].numLiked
    this.setData({t_comments: temp_comments, })
    wx.cloud.callFunction({
      name: "add_like",
      data: {
        commentid: commentid,
      },
      success: res => {
        res = res.result
        if (res.status <= 0) {
          wx.showToast({
            title: "操作太频繁",
            icon: "none",
          })
          return
        }
        serverLiked.add(commentid)
      },
    })
  },
  on_dislike_comment: function (e) {
    const commentid = e.target.dataset.commentid
    if (!serverLiked.has(commentid)) {
      wx.showToast({
        title: "操作太频繁",
        icon: "none",
      })
      return
    }
    const index = commentid2index[commentid]
    var temp_comments = this.data.t_comments
    temp_comments[index].doILike = 0
    --temp_comments[index].numLiked
    this.setData({ t_comments: temp_comments, })
    wx.cloud.callFunction({
      name: "remove_like",
      data: {
        commentid: commentid,
      },
      success: res => {
        res = res.result
        if (res.status <= 0) {
          wx.showToast({
            title: "操作太频繁",
            icon: "none",
          })
          return
        }
        serverLiked.delete(commentid)
      },
    })
  },
  on_add_comment: function(e) {
    wx.navigateTo({
      url: "../evaluation/evaluation?courseid=" + e.target.dataset.courseid + "&whichtab=" + whichtab,
    })
  },
  on_tab_change: function(e) {
    whichtab = e.detail.index
  },
  on_enter_comment: function(e) {
    wx.navigateTo({
      url: "../comment/comment?commentid=" + e.target.dataset.commentid
    })
  },

  onLoad: function (options) {
    var _this = this
    init()
    console.log('options.hasOwnProperty("whichtab") = ', options.hasOwnProperty("whichtab"))
    if (options.hasOwnProperty("whichtab")) {
      whichtab = options.whichtab
      console.log(options)
      console.log("whichtab = ", whichtab)
    }

    courseid = options.courseid
    const arabia2Chinese = ["日", "一", "二", "三", "四", "五", "六"]
    const campuses = {
      "east": "广州校区东校园",
      "south": "广州校区南校园",
      "north": "广州校区北校园",
      "zhuhai": "珠海校区",
    }
    wx.cloud.callFunction({
      name: "get_course",
      data: {
        courseid: options.courseid,
      },
      success: res => {
        const temp_score_overall = get_score_array(res.result.course.overall)
        const temp_score_difficulty = get_score_array(res.result.course.difficulty)
        const temp_score_hardcore = get_score_array(res.result.course.hardcore)
        var tags = [], tag_color = []
        const taginfos = res.result.course.taginfos
        const nTags = Math.min(4, taginfos.length)
        const color = ["#F4C17A", "#ADDC78", "#87CEEB", "#FFD700"]
        for (var i = 0; i < nTags; ++i) {
          tags.push(taginfos[i].tag)
          tag_color.push(color[i])
        }
        _this.setData({
          t_status: res.result.status,
          t_courseid: options.courseid,
          t_creatorname: res.result.course.creatorName,
          tip_tag: tags,
          tip_tag_color: tag_color,
          t_original_overall: res.result.course.overall.toFixed(1),
          t_original_difficulty: res.result.course.difficulty.toFixed(1),
          t_original_hardcore: res.result.course.hardcore.toFixed(1),
          t_score_overall: temp_score_overall,
          t_score_difficulty: temp_score_difficulty,
          t_score_hardcore: temp_score_hardcore,
        })
      }
    })

    wx.cloud.callFunction({
      name: "get_course_extra",
      data: {
        courseid: options.courseid,
      },
      success: res => {
        serverStarred = res.result.starred
        _this.setData({
          t_coursename: res.result.courseName,
          t_unit: res.result.establishUnitNumberName,
          t_intro: res.result.courseContent,
          t_time: "星期" + arabia2Chinese[res.result.wday] + " 第" + res.result.time + "-" + (res.result.time + 1) + "节",
          t_campus: campuses[res.result.campus],
          t_starred: serverStarred,
        })
      },
    })
    
    this.loadlist()
  },

  loadlist: function() {
    var _this = this
    wx.cloud.callFunction({
      name: "get_comments_many",
      data: {
        courseid: courseid,
        start: startindex,
        end: startindex + blockSize,
      },
      success: res => {
        res = res.result
        if (res.status == 0) {
          if (res.errMsg == "error: illegal start; requirement: start >= 0 and start < total") {
            over = 1
          }
          return
        }
        if (res.status == 1 && res.empty == 1) {
          over = 1
          return
        }
        over = res.over
        console.log(startindex)
        for (var i in res.comments) {
          res.comments[i].time = formatDate(res.comments[i].time)
          if (res.comments[i].doILike == 1) {
            serverLiked.add(res.comments[i].commentid)
          }
          commentid2index[res.comments[i].commentid] = startindex + parseInt(i)
        }
        commentlist = commentlist.concat(res.comments)
        _this.setData({ t_comments: commentlist, })

        if (over == 1) {
          startindex += res.comments.length
        }
        else {
          startindex += blockSize
        }
      },
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (whichtab != 2) {
      return
    }
    if (over == 0) {
      this.loadlist()
      wx.showToast({
        title: "加载中",
        icon: "loading",
      })
    }
    else if (!bottomReached) {
      bottomReached = true
      wx.showToast({
        title: "到底了",
      })
    }
  },

  /**
 * 生命周期函数--监听页面显示
 */
  onShow: function () {
    
  },

})