// miniprogram/pages/user/user.js

var tempNickname = "", tempProfession = ""
var openid = ""
var tempFilePath = ""

Page({

  /**
   * 页面的初始数据
   */
  data: {
    nickname: "",
    profession: "专业：",
    nicknameDisabled: "disabled",
    professionDisabled: "disabled",
    t_avatarUrl: "",
  },

  on_begin_edit_nickname: function(e) {
    tempNickname = this.data.nickname
    this.setData({
      nicknameDisabled: "",
    })
  },
  on_end_edit_nickname: function(e) {
    if (this.data.nickname == tempNickname) {
      this.setData({
        nicknameDisabled: "disabled",
      })
      wx.showToast({
        title: "昵称无变化",
        icon: "none",
      })
      return
    }
    var that = this
    this.setData({
      nicknameDisabled: "disabled",
      nickname: tempNickname
    })
    wx.cloud.callFunction({
      name: "set_user",
      data: {
        user: {
          nickname: tempNickname
        }
      },
      success: function(res) {
        res = res.result
        if (res.status <= 0) {
          wx.showToast({
            title: "昵称修改失败",
            icon: "none",
            duration: 3000,
          })
          console.log(res.errMsg)
          return
        }
        wx.showToast({
          title: "昵称修改成功",
        })
      },
      fail: function(res) {
        console.error("set_user: unknown error occured")
        wx.showToast({
          title: "网络错误",
          icon: "none",
          duration: 3000,
        })
      },
    })
  },
  on_nickname_input: function(e) {
    tempNickname = e.detail.value
  },
  on_begin_edit_profession: function (e) {
    tempProfession = this.data.profession
    this.setData({
      professionDisabled: "",
    })
  },
  on_end_edit_profession: function (e) {
    if (this.data.profession == tempProfession) {
      this.setData({
        professionDisabled: "disabled",
      })
      wx.showToast({
        title: "专业无变化",
        icon: "none",
      })
      return
    }
    var that = this
    this.setData({
      professionDisabled: "disabled",
      profession: tempProfession
    })
    wx.cloud.callFunction({
      name: "set_user",
      data: {
        user: {
          profession: tempProfession
        }
      },
      success: function (res) {
        res = res.result
        if (res.status <= 0) {
          wx.showToast({
            title: "专业修改失败",
            icon: "none",
            duration: 3000,
          })
          console.log(res.errMsg)
          return
        }
        wx.showToast({
          title: "专业修改成功",
        })
      },
      fail: function (res) {
        console.error("set_user: unknown error occured")
        wx.showToast({
          title: "网络错误",
          icon: "none",
          duration: 3000,
        })
      },
    })
  },
  on_profession_input: function (e) {
    tempProfession = e.detail.value
  },
  on_starbutton_click: function(e) {
    wx.navigateTo({
      url: '../liked/liked',
    })
  },
  on_aboutbutton_click: function(e) {
    wx.navigateTo({
      url: "../about/about",
    })
  },
  on_change_avatar: function(e) {
    var that = this
    wx.chooseImage({
      count: 1,
      sizeType: ["compressed"],
      success: function(res) {
        tempFilePath = res.tempFilePaths[0]
        that.setData({ t_avatarUrl: tempFilePath, })
        var suffix = "png"
        for (var i = tempFilePath.length; i >= 0; --i) {
          if (tempFilePath[i] == '.') {
            suffix = tempFilePath.slice(i + 1)
          }
        }
        const cloudPath = openid + "_avatar." + suffix
        wx.cloud.uploadFile({
          cloudPath: cloudPath,
          filePath: tempFilePath,
          success: function(res) {
            wx.cloud.callFunction({
              name: "set_user",
              data: {
                user: {avatarUrl: res.fileID},
              },
              success: function(res) {
                res = res.result
                console.log(res)
                if (res.status != 1) {
                  console.error(res.errMsg)
                  return
                }
              },
              fail: function(res) {
                console.error("set_user失败", res)
              }
            })
          },
          fail: function(res) {
            console.error("上传头像失败", res)
          }
        })
      },
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: "加载中",
      mask: true,
    })
    var _this = this
    wx.cloud.callFunction({
      name: "get_user",
      success: function(res) {
        res = res.result
        if (res.status <= 0) {
          console.error("get_user failed.", res.errMsg)
          return;
        }
        const user = res.user
        openid = user.openid
        if (tempFilePath == "") {
          if (user.avatarUrl[0] != 'c') {
            tempFilePath = user.avatarUrl
            _this.setData({
              nickname: user.nickname,
              profession: user.profession,
              t_avatarUrl: tempFilePath,
            })
            wx.hideLoading()
            return
          }
          wx.cloud.downloadFile({
            fileID: user.avatarUrl,
            success: function(res) {
              tempFilePath = res.tempFilePath
              _this.setData({
                nickname: user.nickname,
                profession: user.profession,
                t_avatarUrl: tempFilePath,
              })
              wx.hideLoading()
            },
          })
        }
        else {
          _this.setData({
            nickname: user.nickname,
            profession: user.profession,
            t_avatarUrl: tempFilePath,
          })
          wx.hideLoading()
        }
      },
      fail: function(res) {
        console.error("unknown error occured")
      },
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
    if (this.data.nicknameDisabled == "" || this.data.professionDisabled == "") {
      this.setData({
        nicknameDisabled: "disabled",
        professionDisabled: "disabled",
      })
      wx.showToast({
        title: "信息未修改",
        icon: "none",
      })
    }
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    if (this.data.nicknameDisabled == "" || this.data.professionDisabled == "") {
      this.setData({
        nicknameDisabled: "disabled",
        professionDisabled: "disabled",
      })
      wx.showToast({
        title: "信息未修改",
        icon: "none",
      })
    }
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