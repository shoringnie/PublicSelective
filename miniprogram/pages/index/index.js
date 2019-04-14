//index.js
const app = getApp()

Page({
  data: {
    helloText: "I have a dream.",
    add_test: "add_test",
    add_async_test: "add_async_test",
  },

  onLoad: function() {
    var _this = this

    wx.cloud.callFunction({
      name: "add",
      data: {
        a: 1,
        b: 2,
      },
      success: function(res) {
        console.log("add result: ", res)
        _this.setData({
          add_test: res.result
        })
      }
    })
    
    wx.cloud.callFunction({
      name: "add_async",
      data: {
        a: 3,
        b: 4,
        delay: 3000,   // in miliseconds
      },
      complete: function(res) {
        console.log("add_async result: ", res)
        _this.setData({
          add_async_test: res.result
        })
      },
    })
  },

})
