//频道:https://t.me/sillyGirl_Plugin，欢迎反馈
//Q群管理插件，部分功能必须搭配Q群管理数据存储插件QGDBS.js使用
//缺陷：针对单人时，如若对方在上次发言之后修改了个人昵称(非群昵称)，将会操作失败
//2022-6-11 v1.0 一键踢，一键禁言，一键撤回n条消息
//2022-6-14 v1.2 添加部分数据管理功能，代码结构优化

//[rule:^\[CQ:at[\s\S]+\] 踢$]
//将某人踢出群聊，例：@张三 踢，将张三踢出群聊

//[rule:^\[CQ:at[\s\S]+\] 拉黑$]
//将某人踢出群聊并拉黑，禁止其再次加入

//[rule:^\[CQ:at[\s\S]+\] 禁$]
//将某人禁言，默认禁言5分钟，例：@张三 禁，将张三禁言5分钟

//[rule:^\[CQ:at[\s\S]+\] 禁?]
//将某人禁言x分钟，例：@张三 禁10，将张三禁言10分钟

//[rule:^\[CQ:at[\s\S]+\] 撤?]
//撤回某人x条消息，例：@张三 撤20，撤回张三20条消息

//[rule:^#清理潜水党 ?]//未测试
//清理群内x个月未发言的人,未作精确处理略小于x月未发言也可能被清理掉,未测试，例：#清理潜水党 6

//[rule:^#清空记录$]
//清除QGDBS中存储的本群聊天记录，例：#清空记录

//[rule:^#清空所有记录$]
//清除QGDBS中存储的所有群的聊天记录，仅限傻妞管理员使用，例：#清空所有记录


//是否只允许管理员(傻妞管理员，非Q群管理员)使用，如需其他Q群管理员使用请删掉下面一行，不允许其他管理员使用保持下面一行不动即可
//[admin: true] 







//监控群目标，可自行添加，不填默认监控所有群，多个群使用&隔开
var SPY_GROUP="784190510"

//默认禁言时间，单位：分钟，可自行修改
var BAN_TIME=5

//是否允许其他Q群管理员使用，如需其他管理员使用请删掉上文的[admin: true]
var ADMIN_ALLOWED=false

//设置允许使用的管理员QQ，多个管理员用&隔开，设置此项需上面ADMIN_ALLOWED设置为true，否者设置无效
//当上面ADMIN_ALLOWED设置为true且未填写本项时，默认允许所有管理员使用。
var ADMINS_ALLOWED=""





function main(){
	var UserID=GetUserID()
	var Msg=GetContent()
	if(Msg=="#清空所有记录"&&bucketGet("qq","masters").indexOf(UserID)!=-1){
		let suss=Clear_AllReacord()
		if(suss)
			sendText("已清理"+suss+"个群的群聊记录")
		else 
			sendText("不存在任何群聊记录")
		return
	}
	var ImType=GetImType()
	var GroupID=GetChatID()	   
	if(ImType!="qq"||GroupID==0||!isAdmin()||(SPY_GROUP!=""&&SPY_GROUP.indexOf(GroupID)==-1)||(isAdmin()&&ADMIN_ALLOWED&&ADMINS_ALLOWED.indexOf(UserID)==-1)){
		sendText("您没有使用权限或者未设置本群使用")
		return
	}
	var MsgID=GetMessageID()
	var UserName=GetUsername()
	var reg_qq=/(?<=qq=)\d+/g,reg_name=/(?<=@)[\s\S]+(?=\])/g
	if(Msg.match(/踢$/g)!=null){
		GroupKick(Msg.match(reg_qq),false)
		sendText("已踢出："+Msg.match(reg_qq))
	}
	else if(Msg.match(/踢并拉黑$/g)!=null){
		GroupKick(Msg.match(reg_qq),true)
		sendText("已踢出："+Msg.match(reg_qq)+" 并禁止该成员再次加入")
	}
	else if(Msg.match(/禁$/g)!=null){
		GroupBan(Msg.match(reg_qq),BAN_TIME*60)
		sendText("已禁言："+Msg.match(reg_qq)+"   "+BAN_TIME+"分钟")
	}
	else if(Msg.match(/禁\d+/g)!=null){
		GroupBan(Msg.match(reg_qq),param(1)*60)
		sendText("已禁言："+Msg.match(reg_qq)+"   "+param(1)+"分钟")
	}
	else if(Msg.match(/撤/g)!=null){
		var uid=Msg.match(reg_qq)
		let count=ReCall(GroupID,uid,param(1))
		sendText("成功撤回 "+uid+" :"+count+"条消息")
	}
	else if(Msg=="#清空记录"){
		sendText(ClearRecord(GroupID))
	}
	else if(Msg.indexOf("#清理潜水党")!=-1){
		sendText(ClearNegativeMembers(param(1)))
	}
	return
}

function ClearRecord(gid){
	var notify=""
	let data=bucketGet("QGDBS",gid)
	if(data=="")
		return "本群记录已空，无需清理"
	let GroupData=JSON.parse(data)
	let count=0
	for(let i=0;i<GroupData.length;i++)
		count=count+GroupData[i].messages.length
	bucketSet("QGDBS",gid,"")
	return "已清理"+GroupData.length+"个成员"+count+"条消息"
}

function Clear_AllReacord(){
	let data=bucketGet("QGDBS","Groups")
	if(data=="")
		return false
	let groups=JSON.parse(data)
	for(let i=0;i<groups.length;i++){
		bucketSet("QGDBS",groups[i].id,"")
	}
	return groups.length
}

function ClearNegativeMembers(mons){
	var notify=""
	var count=0
	var date=new Date()	
	date=date.toLocaleString()
	let year=date.match(/(?<=\/)\d+(?=,)/g)
	let mon=date.match(/^\d+/g)
	let GroupDataHistory=bucketGet("QGDBS",GroupID)
	var UserData=JSON.parse(GroupDataHistory)
	for(let i=0;i<UserData.length;i++){
		if(year-UserData[i].lastTime>2||(year-UserData[i].lastTime.year==1&&UserData[i].lastTime.mon-mon<param(1))||mon-UserData[i].lastTime.mon>param(1)){
			GroupKick(uid)
			count++
			notify=notify+count+"、"+UserData[i].uid+":"+UserData[i].uname+"\n"
		}						
	}	
	return "已清理"+count+"个成员:\n"+notify
}


function ReCall(gid,uid,num){
	let GroupDataHistory=bucketGet("QGDBS",gid)
//	sendText("群聊记录:\n"+GroupDataHistory)
	let uindex
	if(GroupDataHistory==""){
//		sendText("群聊记录为空")
		return 0
	}
	var UserData=JSON.parse(GroupDataHistory)
	for(let i=0;i<UserData.length;i++)
		if(UserData[i].uid==uid)
			uindex=i
	if(i==UserData.length){
		sendText("该成员没有消息记录")
		return 0
	}
	var msg_temp
	var count=0
//		sendText("找到"+UserData[uindex].uid+UserData[uindex].uname)
	for(var i=0;i<num;i++){
		msg_temp=GetLastMsg(UserData[uindex],i+1)
		if(msg_temp==0){
//			sendText("该成员消息记录已被清空")
			return 0
		}
		if(msg_temp!=-1){
			RecallMessage(msg_temp.id)
			count++
		}
	}	
	return count
}



//获取个人记录对象UD中用户uid的倒数第num条消息
/*返回对象{
			id:"",		//消息id 
			content:""	//消息内容			
		}*/
function GetLastMsg(UD,num){
	if(UD.messages==""){
//		sendText("该用户从未在本群发言")
		return 0
	}
	if(num>UD.messages.length){
//		sendText("查找范围超出记录范围")
		return -1
	}
	if(UD.point+1>=num)
		return UD.messages[UD.point+1-num]
	else 
		return UD.messages[UD.point+UD.messages.length+1-num]
}


main()
