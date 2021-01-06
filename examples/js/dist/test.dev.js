"use strict";

// 登录之前的api前缀 + 登录之后的api前缀
var baseUrl = "http://192.168.100.70/open";
var loginBaseUrl = "http://192.168.100.70/login_open"; // const baseUrl = "https://backtest.cdflytu.com/open";
// const loginBaseUrl = "https://backtest.cdflytu.com/login-open";
// 项目视频识别 videoKey

var videoKey = "22e3fae115bd48a8b84db72a57eee061"; // 登录行为 => 跳转api地址

var loginNeed = "https://backtest.cdflytu.com/open/api/user/weixin/login/userInfoLogin/"; //存储是否有用户登录的状态

var isLogin = ""; // 存储视频点赞数 => 用户操作 thumbUp 会用到

var likedAmount; // 编码登录成功后的返回地址

var linkUrl = encodeURIComponent(window.parent.location.href + "?time=1111");
var vr = null;
var scene = null;
var renderer = null;
var container = null; // 存取iphone端土司提示定时器 => 用于优化对用户不断点击产生过多一次性定时器的的问题

var toast; // 获取currentUrl,用于判断 hotBeacon的显示与隐藏

var urlCurrent = $("iframe", parent.document).attr("src"); // let urlC = Number(((urlCurrent.split('?')[1]).split('=')[1]).split('.')[0]);

var urlC = Number(urlCurrent.split('=')[1].split('.')[0]);
console.log(urlC); // 存取热点数据 + 场景名 + videoPop的videoSrc + videoPop的videoPoster + 

var result, scenarioName, videoUrl, videoPoster;

window.onload = function () {
  initTest();
  setTimeout(function () {
    init(getParam(window.location.search, 'video'));
    PageAnimation();
    showPage();
    byValue();
    fullScreen();
    turnOnGyro();
    $('#full_feature1').swipeslider();
    $('#full_feature2').swipeslider();
    $('#full_feature3').swipeslider();
  }, 100);
};

var theUrl = '';

function init(url) {
  theUrl = url ? url : '1.mp4'; //renderer = new THREE.WebGLRenderer();

  vr = null;
  scene = null;
  renderer = null;
  container = null;
  AVR.debug = true;

  if (!AVR.Broswer.isIE() && AVR.Broswer.webglAvailable()) {
    renderer = new THREE.WebGLRenderer();
  } else {
    renderer = new THREE.CanvasRenderer();
  }

  renderer.setPixelRatio(window.devicePixelRatio);
  container = document.getElementById('app');
  container.appendChild(renderer.domElement);
  var switchContainer = null;
  scene = new THREE.Scene(); // fov 选项可调整初始视频远近

  vr = new VR(scene, renderer, container, {
    "fov": 90
  });
  vr.vrbox.radius = 600;

  if (AVR.isCrossScreen()) {
    // 调整vr视窗偏移量
    vr.effect.separation = 1.2;
  } // vr 视频源拉取完成


  vr.loadProgressManager.onLoad = function () {
    localStorage.setItem("changeTo", false); // 开屏页loading 消失 => 开屏页 go 显示

    if ($('#openingPage .loading', parent.document) || $('#openingPage .loading', parent.document).css("display") == "block") {
      $('#openingPage .loading', parent.document).hide();
      setTimeout(function () {
        $('#openingPage .go', parent.document).show();
      }, 300);
    }
  };

  vr.init(function () {});
  var sharpness = sessionStorage.getItem("sharpness"); // 加载全景视频

  vr.play('./video/' + sharpness + '/' + theUrl, vr.resType.video);
  window.addEventListener('resize', function () {
    var isHuawei = navigator.userAgent.match(/;\sHUAWEI\s[a-zA-Z0-9\-]+\sBuild\//);

    if (AVR.OS.isWeixin() && !AVR.OS.isiOS() && isHuawei) {
      if (vr.video.getAttribute('x5-video-orientation') == "landscape") {
        vr.toolBar.toolbar.style.width = document.body.clientWidth + "px";
      } else {
        vr.toolBar.toolbar.style.width = "100%";
      }
    }
  });

  if (theUrl.split(".")[0] < 6) {
    var hotIconEvt = function hotIconEvt() {
      for (var i = 0; i < result.length; i++) {
        if (switchContainer && switchContainer.type == result[i].name && result[i].what == "video" && result[i].which == 1) {
          showVideoPop(1);
        } else if (switchContainer && switchContainer.type == result[i].name && result[i].what == "video" && result[i].which == 2) {
          showVideoPop(2);
        } else if (switchContainer && switchContainer.type == result[i].name && result[i].what == "text" && result[i].which == 1) {
          showPop(1);
        } else if (switchContainer && switchContainer.type == result[i].name && result[i].what == "text" && result[i].which == 2) {
          showPop(2);
        } else if (switchContainer && switchContainer.type == result[i].name && result[i].what == "text" && result[i].which == 3) {
          showPop(3);
        } else if (switchContainer && switchContainer.type == result[i].name && result[i].what == "link" && result[i].which == 0) {
          localStorage.setItem("changeTo", true);
        } else if (switchContainer && switchContainer.type == result[i].name && result[i].what == "link" && result[i].which !== 0) {
          parent.vm.changeSelect(result[i].which);
        }
      }
    };

    var animate = function animate() {
      requestAnimationFrame(animate);

      if (AVR.isCrossScreen()) {// cameraEvent.updatePosition();
      } else {
        util.markIconInViews();

        if (vr.markIconGroup) {
          for (var _i5 = 0; _i5 < vr.markIconGroup.children.length; _i5++) {
            vr.markIconGroup.children[_i5].lookAt(vr.vr.camera.position);
          }
        }
      }
    };

    container.addEventListener('click', function (e) {
      hotIconEvt();
    });
    vr.container.addEventListener("mousemove", function (e) {
      util.bindRaycaster(e, {
        success: function success(obj) {
          for (var i = 0; i < result.length; i++) {
            if (obj[0].object.name == result[i].name && result[i].what == "video" && result[i].which == 1) {
              switchContainer = {
                'type': result[i].name
              }; // break;

              return;
            } else if (obj[0].object.name == result[i].name && result[i].what == "video" && result[i].which == 2) {
              switchContainer = {
                'type': result[i].name
              }; // break;

              return;
            } else if (obj[0].object.name == result[i].name && result[i].what == "text" && result[i].which == 1) {
              switchContainer = {
                'type': result[i].name
              }; // break;

              return;
            } else if (obj[0].object.name == result[i].name && result[i].what == "text" && result[i].which == 2) {
              switchContainer = {
                'type': result[i].name
              }; // break;

              return;
            } else if (obj[0].object.name == result[i].name && result[i].what == "text" && result[i].which == 3) {
              switchContainer = {
                'type': result[i].name
              }; // break;

              return;
            } else if (obj[0].object.name == result[i].name && result[i].what == "link" && result[i].which == 0) {
              switchContainer = {
                'type': result[i].name
              }; // break;

              return;
            } else if (obj[0].object.name == result[i].name && result[i].what == "link" && result[i].which !== 0) {
              switchContainer = {
                'type': result[i].name
              }; // break;

              return;
            } else {
              switchContainer = null;
              document.body.style.cursor = "auto";
            }
          } // console.log(switchContainer);

        },
        empty: function empty() {
          vr.cameraEvt.leave();
          document.body.style.cursor = "auto";
          switchContainer = null;
        }
      });
    }, false);
    var util = new VRUtils(vr);

    if (urlC == 1) {
      scenarioName = res1.scenarioName;
      result = res1.resultset.map(function (item) {
        item.position = generatedCoordinate(item.position.x, item.position.y, item.position.z);
        return item;
      });

      for (var i = 0; i < result.length; i++) {
        util.markIcon(result[i].img, result[i].position, result[i].name, result[i].title, result[i].w, result[i].h);
      }
    } else if (urlC == 2) {
      scenarioName = res2.scenarioName;
      result = res2.resultset.map(function (item) {
        item.position = generatedCoordinate(item.position.x, item.position.y, item.position.z);
        return item;
      });

      for (var _i = 0; _i < result.length; _i++) {
        util.markIcon(result[_i].img, result[_i].position, result[_i].name, result[_i].title, result[_i].w, result[_i].h);
      }
    } else if (urlC == 3) {
      scenarioName = res3.scenarioName;
      result = res3.resultset.map(function (item) {
        item.position = generatedCoordinate(item.position.x, item.position.y, item.position.z);
        return item;
      });

      for (var _i2 = 0; _i2 < result.length; _i2++) {
        util.markIcon(result[_i2].img, result[_i2].position, result[_i2].name, result[_i2].title, result[_i2].w, result[_i2].h);
      }
    } else if (urlC == 4) {
      scenarioName = res4.scenarioName;
      result = res4.resultset.map(function (item) {
        item.position = generatedCoordinate(item.position.x, item.position.y, item.position.z);
        return item;
      });

      for (var _i3 = 0; _i3 < result.length; _i3++) {
        util.markIcon(result[_i3].img, result[_i3].position, result[_i3].name, result[_i3].title, result[_i3].w, result[_i3].h);
      }
    } else if (urlC == 5) {
      scenarioName = res5.scenarioName;
      result = res5.resultset.map(function (item) {
        item.position = generatedCoordinate(item.position.x, item.position.y, item.position.z);
        return item;
      });

      for (var _i4 = 0; _i4 < result.length; _i4++) {
        util.markIcon(result[_i4].img, result[_i4].position, result[_i4].name, result[_i4].title, result[_i4].w, result[_i4].h);
      }
    }

    animate();
  } // 热点logic => Fn处理


  getMarkIconObj(); // 陀螺仪选中功能 => css表现Fn

  selected(); // 用于测试热点添加的事件
  // setInterval(() => {
  //     console.log(vr.video.currentTime);
  // }, 1000)
} // 热点逻辑处理


function getMarkIconObj() {
  // Mesh OBJ
  var videoPopBeacon1 = scene.getObjectByName("videoPopUp1");
  var videoPopBeacon2 = scene.getObjectByName("videoPopUp2");
  var popBeacon1 = scene.getObjectByName("textPopUp1");
  var popBeacon2 = scene.getObjectByName("textPopUp2");
  var popBeacon3 = scene.getObjectByName("textPopUp3");
  var beacon1 = scene.getObjectByName("beacon1");
  var Beacon2 = scene.getObjectByName("beacon2"); // Tip DOM

  var videoPopBeaconTip1 = document.getElementById("videoPopUp1");
  var videoPopBeaconTip2 = document.getElementById("videoPopUp2");
  var popBeaconTip1 = document.getElementById("textPopUp1");
  var popBeaconTip2 = document.getElementById("textPopUp2");
  var popBeaconTip3 = document.getElementById("textPopUp3");
  var beaconTip1 = document.getElementById("beacon1");
  var BeaconTip2 = document.getElementById("beacon2"); // 控制热点在任意时间出现,传入三个参数
  // beacon: 热点dom对象;  tip:对应dom的tip文字注释; 
  // seconds1:显示时间(s为单位)
  // seconds2:隐藏时间

  function whenView(beacon, tip, seconds1, seconds2) {
    setInterval(function () {
      var time = vr.video.currentTime; // 在视频第3秒出现热点图标

      if (time > seconds1) {
        beacon.visible = true;
        tip.style.position = "absolute";
      }

      if (time > seconds2) {
        beacon.visible = false;
        tip.style.position = "";
      }
    }, 1000);
  } // 隐藏热点按钮Fn


  function hideHotBeacon() {
    // 视频弹窗
    if (videoPopBeacon1 && videoPopBeaconTip1) {
      videoPopBeacon1.visible = false;
      videoPopBeaconTip1.style.position = "";
    }

    if (videoPopBeacon2 && videoPopBeaconTip2) {
      videoPopBeacon2.visible = false;
      videoPopBeaconTip2.style.position = "";
    } // 文字弹窗


    if (popBeacon1 && popBeaconTip1) {
      popBeacon1.visible = false;
      popBeaconTip1.style.position = "";
    }

    if (popBeacon2 && popBeaconTip2) {
      popBeacon2.visible = false;
      popBeaconTip2.style.position = "";
    }

    if (popBeacon3 && popBeaconTip3) {
      popBeacon3.visible = false;
      popBeaconTip3.style.position = "";
    } // 跳转热点


    if (beacon1 && beaconTip1) {
      beacon1.visible = false;
      beaconTip1.style.position = "";
    }

    if (Beacon2 && BeaconTip2) {
      Beacon2.visible = false;
      BeaconTip2.style.position = "";
    }
  }

  if (urlC == 1) {
    // vr.video.currentTime = 23;
    fillScenarioName();
    fillPopUp(0, 1);
    fillVideoPopUp(0, 1);
    hideHotBeacon();
    whenView(popBeacon1, popBeaconTip1, 25, 31);
    whenView(videoPopBeacon1, videoPopBeaconTip1, 25, 31);

    if (sessionStorage.getItem("key") == "1") {// firstPageAnimation();
    } else {
      removeImgListAnimation();
    }
  } else if (urlC == 2) {
    sessionStorage.setItem("key", "2");
    fillScenarioName();
    fillPopUp(1, 1);
    fillPopUp(2, 2);
    fillPopUp(3, 3);
    hideHotBeacon();
    whenView(beacon1, beaconTip1, 75, 91);
    whenView(popBeacon1, popBeaconTip1, 2, 17);
    whenView(popBeacon2, popBeaconTip2, 21, 29);
    whenView(popBeacon3, popBeaconTip3, 35, 47);
    removeImgListAnimation();
  } else if (urlC == 3) {
    sessionStorage.setItem("key", "3");
    fillScenarioName();
    hideHotBeacon();
    removeImgListAnimation();
  } else if (urlC == 4) {
    sessionStorage.setItem("key", "4");
    fillScenarioName();
    hideHotBeacon();
    removeImgListAnimation();
  } else if (urlC == 5) {
    sessionStorage.setItem("key", "5");
    fillScenarioName();
    hideHotBeacon();
    removeImgListAnimation();
  }
}

function getParam(url, name) {
  var reg = new RegExp("[^\?&]?" + encodeURI(name) + "=[^&]+");
  var arr = url.match(reg);

  if (arr != null) {
    return decodeURI(arr[0].substring(arr[0].search("=") + 1));
  }

  return "";
}
/*
 ===========================
 Pop Beginning
 ===========================
 */


function closeVideoPop(i) {
  $("#imgListShelter", parent.document).hide();
  var videoPopId = "#videoPop" + i;
  $(videoPopId).hide(); // 触发播放

  if (sessionStorage.getItem("videoStatus") === "pause") {
    $('._toolBarBtn').click();
  }
}

function showVideoPop(i) {
  var obj = $("#imgListShelter", parent.document);
  var videoPopId = "#videoPop" + i;
  obj.show();
  obj.on("click", function () {
    closeVideoPop(i);
  });

  if (sessionStorage.getItem("videoStatus") === "play") {
    $('._toolBarBtn').click();
    $(videoPopId).show();
  } else {
    $(videoPopId).show();
  }
}

function closePop(i) {
  var popId = "#pop" + i;
  $(popId).hide();

  if (sessionStorage.getItem("videoStatus") === "pause") {
    $('._toolBarBtn').click();
  }
} // i : 显示第几个轮播图demo


function showPop(i) {
  var popId = "#pop" + i;

  if (sessionStorage.getItem("videoStatus") === "play") {
    $('._toolBarBtn').click();
    $(popId).show();
  } else {
    $(popId).show();
  }
}
/*
 *
 * Note:弹窗的内容填充发生在页面初始化时
 * Index:图片数据在数组中的的索引值
 * assign:指定将index的数据填充进入哪个pop中
 *
 */


function fillPopUp(index, assign) {
  // which存储轮播图内部相关dom的索引,即 索引= 实际的pop在pop序列中的位置 -1
  var which = assign - 1;
  var titleID = "#title" + assign;
  $(titleID).text(title[index]);
  document.getElementsByClassName('text')[which].innerText = text[index];
  var ul = $(".sw-slides")[which];

  for (var i = 0; i < imgUrl[index].length; i++) {
    var _parent = $("<li></li>");

    _parent.addClass("sw-slide");

    var child = $("<img>");
    child.attr("src", imgUrl[index][i]);
    child.appendTo(_parent);

    _parent.appendTo(ul);
  }
}

function fillVideoPopUp(index, assign) {
  var videoPopID = "#videoPop" + assign + " .video";
  $(videoPopID).attr({
    "src": videoUrl[index],
    "poster": videoPoster[index]
  });
}
/*
 ===========================
 Pop Ending
 ===========================
 */


function fillScenarioName() {
  $('#scenarioName').text(scenarioName);
} // 控制每次进入video时 => 工具栏的动画执行


function PageAnimation() {
  $('#openingPage .go', parent.document).on('click', function () {
    $('._toolBarBtn').click();
    $('._toolBarPV').css('animation', 'PV 0.5s ease 0.5s 1 forwards');
    $('._toolBarScenario').css('animation', 'scenario 0.5s ease 0.5s 1 forwards');
    $('._toolBarShare').css('animation', 'share 0.5s ease 0.5s 1 forwards');
    $('._toolBarMsg').css('animation', 'msg 0.5s ease 0.5s 1 forwards');
    $('._toolBarThumbUpBox').css('animation', 'thumbUpBox 0.5s ease 0.5s 1 forwards');
    $('._toolBarMore').css('animation', 'more 0.5s ease 0.5s 1 forwards');
    $('._toolBarBack').css('animation', 'back 0.5s ease 0.5s 1 forwards');
    $('._toolBarBtn').css('animation', 'btn 0.5s ease 0.5s 1 forwards');
    $('._toolBarMenu').css('animation', 'menu 0.5s ease 0.5s 1 forwards');
    $('.img-list', parent.document).css('animation', 'imgList 0.5s ease 0.1s 1 forwards');
  });
} // 控制 main 页面的 img-list 在切换清晰度的时候不会被唤起
// 控制 test 页面在 video pause时刷新 => imgList始终显示


function removeImgListAnimation() {
  $('.img-list', parent.document).css('animation', '');
} // 工具栏上的gyro功能 => css表现


function selected() {
  if ($('._toolBarGyro')) {
    $('._toolBarGyro').on('click', function () {
      var obj = $(this);

      if (obj.hasClass('active')) {
        obj.removeClass('active');
        resetEnable();
      } else {
        obj.addClass('active');
        resetDisabled();
      }
    });
  }
} // 开启陀螺仪总开关


function turnOnGyro() {
  if (sessionStorage.getItem("isTurnOn") === "true") {
    $('._toolBarGyro').click();
  }
} // 禁用 重置定位 


function resetDisabled() {
  var parent = $("._toolBarMore");
  var child = $("<div></div>");
  child.css({
    "width": "100%",
    "height": "3rem",
    "position": "absolute",
    "bottom": "1.4rem"
  });
  child.attr("id", "shelter");
  child.appendTo(parent);
  $('._toolBarReset').css({
    "background": "url('./img/home/reset_disable.png') no-repeat",
    "backgroundSize": "2.625rem 2.625rem"
  });
} // 恢复 重置定位


function resetEnable() {
  if ($("#shelter")) {
    $("#shelter").remove();
  }

  ;
  $('._toolBarReset').css({
    "background": "url('./img/home/reset.png') no-repeat",
    "backgroundSize": "2.625rem 2.625rem"
  });
} // 判断是否登录 给 test 页面的工具栏绑定事件


function showPage() {
  $('._toolBarShare').on('click', function () {
    $('#shareInstructionPage', parent.document).show();
  });
  $('._toolBarMenu').on('click', function () {
    $('#menu', parent.document).show();
  }); // 判断登录状态

  loginLogic();
  $('._toolBarBack').on('click', function () {
    window.parent.location.href = 'https://ftplayer.cdflytu.com';
  });
} // 全屏处理


function fullScreen() {
  var ua = navigator.userAgent;

  if (ua.match(/iPhone|iPod/i) != null) {
    $('._toolBarZoomIn').on('click', function () {
      $('#toast', parent.document).show();

      if (toast) {
        clearTimeout(toast);
      }

      toast = setTimeout(function () {
        $('#toast', parent.document).hide();
      }, 2500);
    });
  } else if (ua.match(/Android/i) != null) {
    $('._toolBarZoomIn').on('click', function () {
      requestFullScreen();
      $('._toolBarArea ._toolBarZoomOut').show();
      $('._toolBarArea ._toolBarPV').hide();
      $('._toolBarArea ._toolBarMsg').hide();
      $('._toolBarArea ._toolBarShare').hide();
      $('._toolBarArea ._toolBarThumbUpBox').hide();
      $('._toolBarArea ._toolBarMore').hide();
      $('._toolBarArea ._toolBarBack').hide();
      $('._toolBarArea ._toolBarBtn').hide();
      $('._toolBarArea ._toolBarMenu').hide(); // 处理在pasue状态下的全屏

      $('.img-list', parent.document).css('animation', '');
    });
  } else if (ua.match(/iPad/i) != null) {
    console.log("ipad代码");
  }

  $('._toolBarZoomOut').on('click', function () {
    exitFullscreen();
    $('._toolBarArea ._toolBarZoomOut').hide();
    $('._toolBarArea ._toolBarPV').show();
    $('._toolBarArea ._toolBarMsg').show();
    $('._toolBarArea ._toolBarShare').show();
    $('._toolBarArea ._toolBarThumbUpBox').show();
    $('._toolBarArea ._toolBarMore').show();
    $('._toolBarArea ._toolBarBack').show();
    $('._toolBarArea ._toolBarBtn').show();
    $('._toolBarArea ._toolBarMenu').show(); // 处理在pasue状态下的全屏

    $('.img-list', parent.document).css('animation', 'imgList 0.5s ease 0.1s 1 forwards');
  });
} // ajax赋值 => video访问量/点赞数


function byValue() {
  $.ajax({
    type: "get",
    //这里还可以用于Post
    url: baseUrl + "/api/video/video-page/videoVisitAmount/" + "?videoKey=" + videoKey,
    success: function success(data) {
      likedAmount = Number(data.result.likedAmount);
      $('._toolBarPV ._toolBarTotalPV').text("总访问量: " + data.result.totalAmount);
      $('._toolBarPV ._toolBarTodayPV').text("今日访问量: " + data.result.todayAmount);
      $('._toolBarThumbUpBox ._toolBarThumbUpValue').text(likedAmount);
    },
    error: function error(err) {
      console.log(err);
    }
  });
} // test每次刷新的初始化动画处理


function initTest() {
  document.querySelector('html').style.fontSize = document.documentElement.clientWidth / 750 * 16 + 'px';
  $('#openingPage', parent.document).show();
  $('#openingPage .go', parent.document).hide();
  $('#openingPage .loading', parent.document).show();
} // 生成笛卡尔坐标


function generatedCoordinate(x, y, z) {
  return new THREE.Vector3(x, y, z);
} //进入全屏  


function requestFullScreen() {
  var element = document.documentElement;

  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen();
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  }
} //退出全屏  


function exitFullscreen() {
  var element = document;

  if (element.exitFullscreen) {
    element.exitFullscreen();
  } else if (element.msExitFullscreen) {
    element.msExitFullscreen();
  } else if (element.mozCancelFullScreen) {
    element.mozCancelFullScreen();
  } else if (element.webkitExitFullscreen) {
    element.webkitExitFullscreen();
  }
}

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  var expires = "expires=" + d.toGMTString();
  document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');

  for (var i = 0; i < ca.length; i++) {
    var c = ca[i].trim();
    if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
  }

  return "";
} // 用户登录


function loginLogic() {
  $.ajax({
    type: "get",
    url: baseUrl + '/api/user/weixin/login/isLogin/',
    async: false,
    beforeSend: function beforeSend(request) {
      request.setRequestHeader("token", getCookie("token"));
    },
    success: function success(res) {
      isLogin = res.result.islogin; // 未登录

      if (!isLogin) {
        $('._toolBarMsg').on('click', function () {
          $("#signIn", parent.document).show();
          window.parent.location.href = loginNeed + '?from=' + linkUrl;
        });
        $('._toolBarThumbUp').on('click', function () {
          $("#signIn", parent.document).show();
          window.parent.location.href = loginNeed + '?from=' + linkUrl;
        });
      } // 登录成功


      if (isLogin) {
        $('._toolBarMsg').on('click', function () {
          $('#commentPage', parent.document).show();
        });
        thumbUpLogic();
        thumbUpSelect();
      }
    },
    error: function error(err) {
      console.log(err);
    }
  });
} // 该用户对于 video 是否点赞


function thumbUpLogic() {
  $.ajax({
    type: "get",
    url: loginBaseUrl + '/api/video/video-page/isVideoLike/' + "?videoKey=" + videoKey,
    async: false,
    beforeSend: function beforeSend(request) {
      request.setRequestHeader("token", getCookie("token"));
    },
    success: function success(res) {
      sessionStorage.setItem("videoLike", res.result); // 未点赞状态

      if (sessionStorage.getItem("videoLike") === "false") {
        if ($('._toolBarThumbUp').hasClass('active')) {
          $('._toolBarThumbUp').removeClass('active');
        }
      }

      ; // 点赞状态

      if (sessionStorage.getItem("videoLike") === "true") {
        if ($('._toolBarThumbUp').hasClass('active')) {} else {
          $('._toolBarThumbUp').addClass('active');
        }
      }
    },
    error: function error(err) {
      console.log(err);
    }
  });
} // 点赞 => 选择发起哪种请求


function thumbUpSelect() {
  $('._toolBarThumbUp').on('click', function () {
    if (sessionStorage.getItem("videoLike") === "false") {
      $.ajax({
        type: "post",
        url: loginBaseUrl + '/api/video/video-page/addVideoLike/',
        contentType: "application/json",
        data: JSON.stringify({
          "videoKey": videoKey
        }),
        async: false,
        beforeSend: function beforeSend(request) {
          request.setRequestHeader("token", getCookie("token"));
        },
        success: function success(res) {
          var ThumbUp = res.result; // 视频点赞

          if (ThumbUp) {
            if ($('._toolBarThumbUp').hasClass('active')) {} else {
              $('._toolBarThumbUp').addClass('active');
            }

            likedAmount += 1;
            $('._toolBarThumbUpBox ._toolBarThumbUpValue').text(likedAmount);
            sessionStorage.setItem("videoLike", true);
          }
        },
        error: function error(err) {
          console.log(err);
        }
      });
    } else {
      $.ajax({
        type: "post",
        url: loginBaseUrl + '/api/video/video-page/removeVideoLike/',
        contentType: "application/json",
        data: JSON.stringify({
          "videoKey": videoKey
        }),
        async: false,
        beforeSend: function beforeSend(request) {
          request.setRequestHeader("token", getCookie("token"));
        },
        success: function success(res) {
          var removeThumbUp = res.result; // 取消视频点赞

          if (removeThumbUp) {
            if ($('._toolBarThumbUp').hasClass('active')) {
              $('._toolBarThumbUp').removeClass('active');
            }

            likedAmount -= 1;
            $('._toolBarThumbUpBox ._toolBarThumbUpValue').text(likedAmount);
            sessionStorage.setItem("videoLike", false);
          }
        },
        error: function error(err) {
          console.log(err);
        }
      });
    }
  });
} // let scenarioName = new Array("莱茵光伏实验室", "实验室一楼", "实验室二楼", "零部件实验室", "TUV莱茵");


var res1 = {
  "success": true,
  "code": 0,
  "scenarioName": "莱茵光伏实验室",
  "resultset": [{
    "what": "video",
    //弹窗类型 => 视频弹窗
    "which": 1,
    // 表示启用页面的第几个videoPop
    "img": "./textures/discount.png",
    "position": {
      x: -4,
      y: 2,
      z: 12
    },
    "name": "videoPopUp1",
    "title": "视频弹窗",
    "w": "1",
    "h": "1"
  }, {
    "what": "text",
    //弹窗类型 => 文本弹窗
    "which": 1,
    // 表示启用页面的第几个textPop
    "img": "./textures/discount.png",
    "position": {
      x: -4,
      y: 0,
      z: 12
    },
    "name": "textPopUp1",
    "title": "莱茵集团",
    "w": "1",
    "h": "1"
  }]
};
var res2 = {
  "success": true,
  "code": 0,
  "scenarioName": "实验室一楼",
  "resultset": [{
    "what": "link",
    //弹窗类型 => 热点跳转
    "which": 0,
    // Number类型(正整数), 跳转功能时, 0:跳转下一个视频, other:跳转到第几个视频
    "img": "./textures/right.png",
    "position": {
      x: -5,
      y: -2,
      z: 7
    },
    "name": "beacon1",
    "title": "实验室二楼",
    "w": "1",
    "h": "1"
  }, {
    "what": "text",
    "which": 1,
    "img": "./textures/discount.png",
    "position": {
      x: -5,
      y: 0,
      z: 10
    },
    "name": "textPopUp1",
    "title": "环境测试",
    "w": "1",
    "h": "1"
  }, {
    "what": "text",
    "which": 2,
    "img": "./textures/discount.png",
    "position": {
      x: 5,
      y: 0,
      z: 10
    },
    "name": "textPopUp2",
    "title": "稳态模拟器",
    "w": "1",
    "h": "1"
  }, {
    "what": "text",
    "which": 3,
    "img": "./textures/discount.png",
    "position": {
      x: -6,
      y: -1,
      z: 10
    },
    "name": "textPopUp3",
    "title": "机械载荷测试",
    "w": "1",
    "h": "1"
  }]
};
var res3 = {
  "success": true,
  "code": 0,
  "scenarioName": "实验室二楼",
  "resultset": []
};
var res4 = {
  "success": true,
  "code": 0,
  "scenarioName": "零部件实验室",
  "resultset": []
};
var res5 = {
  "success": true,
  "code": 0,
  "scenarioName": "TUV莱茵",
  "resultset": []
}; // pop 赋值

var title = new Array();
title[0] = '莱茵集团';
title[1] = '环境测试';
title[2] = '稳态模拟器';
title[3] = '机械载荷测试';
var imgUrl = new Array();
imgUrl[0] = ['img/pop/laiyin1.jpg', 'img/pop/laiyin2.jpg', 'img/pop/laiyin3.jpg'];
imgUrl[1] = ['img/pop/laiyin4.jpg'];
imgUrl[2] = ['img/pop/laiyin5.jpg'];
imgUrl[3] = ['img/pop/laiyin6.jpg'];
var text = new Array();
text[0] = '自1872年成立以来，坚持为解决人类、环境和科技互动过程中出现的挑战开发安全持续的解决方案。德国莱茵TüV集团作为一个独立、公正和专业的机构，长期致力于营造一个同时符合人类和环境需要的美好未来。德国莱茵TÜV集团公司总部位于科隆，在全球61个国家设有490家分支机构，员工总数为17000人。集团共包含120多家公司。其中运营控股公司是TÜV Rheinland AG，TÜV Rheinland Berlin BrandenburgPfalz e.V.是单一股东。';
text[1] = '环境测试区可开展温度循环、光伏PID测试等服务，能模拟组件在极端恶劣条件下的工作表现。';
text[2] = '全亚洲最大的太阳能稳态模拟器，最多能容纳20块太阳能组建同时进行光筛测试，也能模拟出组建最真实的工作状态。';
text[3] = '机械载荷测试是为了确保光伏电站的可靠性，可测试组件在受到暴风、积雪等情况下的受力，并检测组件是否能够承受高强度的机械载荷，最高测试压强可达10000Pa。'; // videoPop 赋值

videoUrl = new Array("./video/4K/1.mp4", "./video/4K/2.mp4", "./video/4K/3.mp4");
videoPoster = new Array("./img/poster/1.jpg", "./img/poster/2.jpg", "./img/poster/3.jpg");