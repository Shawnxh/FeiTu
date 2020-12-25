"use strict";

var $appid, $timestamp, $noncestr, $signature, $description, $title1; // 微信分享调用接口(share的api暂时只能用http这个)

var protocol_domain_port = 'http://39.102.65.183:8080/open'; // 链接地址

var $linkUrl = "https://ftplayer.cdflytu.com/mxreality/laiyin/examples/main.html"; // 分享图片 => 线上地址

$imgUrl = 'https://ftplayer.cdflytu.com/mxreality/laiyin/examples/img/ly.png';
$description = '德国莱茵集团 (RWE) 成立于1898年，总部位于德国埃森。是德国第一大能源公司，德国第一大发电公司，德国第一大可再生能源公司，欧洲三大能源公司之一。莱茵集团旗下四大板块独立运营，并向莱茵集团汇报业务情况和财务报告，共同支撑莱茵集团RWE AG业务发展。';
$title1 = "VR互动全景：德国莱茵集团"; //获取当前页面的url => 完整url 

var $linkUrlToken = window.location.href; // encodeURIComponent(),请求后台接口需要用encodeURIComponent()

var encodeUrl = encodeURIComponent($linkUrlToken);
$.ajax({
  type: "get",
  url: protocol_domain_port + "/api/user/weixin/js-sdk/getJsSdkConfig/" + "?url=" + encodeUrl,
  async: false,
  cache: false,
  success: function success(data) {
    // console.log(data.result);
    if (data.code == 200) {
      $appid = data.result.appId; // appid

      $timestamp = data.result.timestamp; // timestamp

      $noncestr = data.result.nonceStr; // noncestr

      $signature = data.result.signature; // signature
      //**配置微信信息**

      wx.config({
        debug: false,
        appId: $appid,
        timestamp: $timestamp,
        nonceStr: $noncestr,
        signature: $signature,
        jsApiList: [// 所有要调用的 API 都要加到这个列表中
        'updateTimelineShareData', 'updateAppMessageShareData']
      });
    }
  },
  error: function error(msg) {
    console.log('err!');
  }
});
wx.ready(function () {
  //分享微信朋友圈
  wx.updateTimelineShareData({
    imgUrl: $imgUrl,
    link: $linkUrl,
    desc: $description,
    title: $title1,
    success: function success() {// alert('分享成功!');
    }
  }); //分享给朋友

  wx.updateAppMessageShareData({
    title: $title1,
    // 分享标题
    desc: $description,
    // 分享描述
    link: $linkUrl,
    // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
    imgUrl: $imgUrl,
    type: '',
    // 分享类型,music、video或link，不填默认为link
    dataUrl: '',
    // 如果type是music或video，则要提供数据链接，默认为空
    success: function success() {// 用户点击了分享后执行的回调函数
      // alert('分享成功!');
    }
  });
});
wx.error(function (res) {
  alert(res.errMsg);
});