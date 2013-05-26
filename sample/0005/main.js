$(document).ready(function(){
  // user agent の取得
  var ua = window.m4w.user_agent();
  $("span#user_agent").append(ua.user_agent);
  $("span#version").append(ua.version);
});
