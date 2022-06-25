/*
 * @Date: 2022年2月28日17:40:25
 * @LastEditors: 烟雨
 * @LastEditTime: 2022年2月28日17:40:25
 */
// 天气查询
// [rule: ?天气 ] 北京天气
// [rule: 天气 ? ] 天气 北京
//自己去申请id替换就行,申请地址：https://www.mxnzp.com/
var app_id = "cuxlksjlgkwkaknq";
var app_secret = "Uk1ZTlJGWm5GdmNMNGJoN0JDcmRSUT09";
function main(){
  var address = param(1);
  var data = request({
    url:"http://hm.suol.cc/API/tq.php?msg="+address+"&n=1&",
    method:"get",
  })
  sendText(data)
}
main();
