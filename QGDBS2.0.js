
//频道:https://t.me/sillyGirl_Plugin，欢迎反馈
//QQ Group Database System
//Q群管理数据存储
//2022-6-11 v1.0 
//2022-6-14 v2.0修改数据结构


//[rule:[\s\S]+]

//自定义参数
//每个群每个人存储的消息数量,可自行修改
const USER_CHAT_MSGNUM=5

//存储消息的群号,不填默认所有群，可自行修改，多个群用&符号隔开
const SAVED_CHAT_ID="784190510"		

//存储的所有人消息记录数量总和最大值
const ALL_MSG_LIMITED=10000





//群聊记录对象数据结构,最终存储形式为JSON,傻妞mainKey="QGDBS"，key=群id

var UserData=[{
		lastTime:{	//上次发言时间
			year:0,
			mon:0,
			day:0,
			hour:0,
			min:0,
			sec:0
		},
		uid:0,
		uname:"",	//用户名
		point:-1,		//最新消息位置，表明最新消息在消息队列中的位置
		messages:[{		//消息队列
			id:"",		//消息id
			content:""	//消息内容			
		}]
	}]
	
//QGDBS群聊列表，傻妞mainKey="QGDBS"，key="Groups"
var Groups=[{
	id:0,	//群号
	name:""	//群名
}]



var ImType=GetImType()
var GroupID=GetChatID()
var GroupName=GetChatname()
var UserID=GetUserID()
var UserName=GetUsername()
var Msg=GetContent()
var MsgID=GetMessageID()

function main(){
	if(ImType!="qq"||GroupID==0||(SAVED_CHAT_ID!=""&&SAVED_CHAT_ID.indexOf(GroupID)==-1)){//非想存储的QQ群
		Continue()	
		return
	}

	var HistoryMsg=bucketGet("QGDBS",GroupID)
	var GroupTable=bucketGet("QGDBS","Groups")
	if(HistoryMsg!=""){
		let allMsgNum=0
		var GDH=JSON.parse(HistoryMsg)//群消息记录 Group Data History
		for(let i=0;i<GDH.length;i++){
			allMsgNum=allMsgNum+GDH[i].messages.length
		}
		if(allMsgNum>ALL_MSG_LIMITED){
			notifyMasters("QGDBS群聊数据记录系统已超限，请清理消息记录或者修改限制数量")
			Continue()	
			return
		}
	}
	SaveUserData(HistoryMsg,GDH)
	SaveGroups(GroupTable)
	Continue()	
	return
}


//保存用户群聊记录
function SaveUserData(HistoryMsg,GDH){
		
	let date=new Date()	//获取系统时间
	date=date.toLocaleString()
	let now={	
		year:date.match(/(?<=\/)\d+(?=,)/g)[0],
		mon:date.match(/^\d+/g)[0],
		day:date.match(/(?<=\/)\d+(?=\/)/g)[0],
		hour:date.match(/(?<= )\d+(?=:)/g)[0],
		min:date.match(/(?<=:)\d+(?=:)/g)[0],
		sec:date.match(/(?<=:)\d+$/g)[0]
	}

	//不存在任何消息记录，直接保存 
	if(HistoryMsg==""){
		UserData[0].uid=UserID
		UserData[0].uname=UserName
		UserData[0].lastTime=now
		UserData[0].point=0
		UserData[0].messages[0].id=MsgID
		UserData[0].messages[0].content=Msg
		bucketSet("QGDBS",GroupID,JSON.stringify(UserData))
//		sendText("已保存:\n"+JSON.stringify(UserData))
		Continue()
		return
	}
	
	
	//存在消息记录
//	sendText("读取到消息记录:\n"+bucketGet("QGDBS",GroupID))
	UserData=JSON.parse(HistoryMsg)//复制群消息记录
	let uindex=0	//用户在消息记录中的位置
	let UDH//用户消息记录 User Data History,工具人，减小代码复杂度
	let i=0
	for(i=0;i<GDH.length;i++){//找到UerID消息记录所在位置
		if(GDH[i].uid==UserID){
			UDH=GDH[i]		
			uindex=i
			break
		}
	}
	
	//未找到UerID，或者UserID没有消息记录，直接保存
	if(i==GDH.length){
		UserData.push({
			lastTime:now,
			uid:UserID,
			uname:UserName,
			point:0,
			messages:[{
				id:MsgID,
				content:Msg
			}]
		})
		bucketSet("QGDBS",GroupID,JSON.stringify(UserData))
//		sendText("已保存:\n"+JSON.stringify(UserData))
		Continue()
		return		
	}
	
	
	//存在该用户的消息记录且消息未存满
	UserData[uindex].uid=UserID
	UserData[uindex].uname=UserName
	UserData[uindex].lastTime=now
	if(UDH.messages.length<USER_CHAT_MSGNUM){
		//存储数量之前已存满，但修改了USER_CHAT_MSGNUM导致未满
		if(UDH.point!=UDH.messages.length-1){				
			for(i=0;i<UDH.messages.length;i++){//将历史消息从新到旧依次复制到队列中历史消息长度位置之前的位置
				if(i<=UDH.point){
					UserData[uindex].messages[UDH.messages.length-1-i].id=UDH.messages[UDH.point-i].id
					UserData[uindex].messages[UDH.messages.length-1-i].content=UDH.messages[UDH.point-i].content
				}
				else{
					UserData[uindex].messages[UDH.messages.length-1-i].id=UDH.messages[UDH.point+UDH.messages.length-i].id
					UserData[uindex].messages[UDH.messages.length-1-i].content=UDH.messages[UDH.point+UDH.messages.length-i].content
				}
			}
			UserData[uindex].point=UDH.messages.length-1
		}
		//保存当前消息
		UserData[uindex].messages.push({
			id:MsgID,
			content:Msg
		})
		UserData[uindex].point++
	}
	
	//存在该用户消息且已存满
	else if(UDH.messages.length==USER_CHAT_MSGNUM){		
		if(UDH.point==USER_CHAT_MSGNUM-1){//最新消息恰好位于队尾
			UserData[uindex].point=0
		}
		else	
			UserData[uindex].point++
		//保存当前消息
		UserData[uindex].messages[UserData[uindex].point].id=MsgID
		UserData[uindex].messages[UserData[uindex].point].content=Msg
	}


//修改了USER_CHAT_MSGNUM导致已存储数量超出设置值，将记录中最新的USER_CHAT_MSGNUM条消息保存到UserData中
	else if(UDH.messages.length>USER_CHAT_MSGNUM){
		if(UDH.point>=USER_CHAT_MSGNUM){//消息记录中的最新消息所处位置已超出记录长度
			for(i=0;i<USER_CHAT_MSGNUM;i++){//将记录中最新USER_CHAT_MSGNUM条数据从队尾依次保存到队列中
				UserData[uindex].messages[USER_CHAT_MSGNUM-1-i].id=UDH.messages[UDH.point-i].id
				UserData[uindex].messages[USER_CHAT_MSGNUM-1-i].content=UDH.messages[UDH.point-i].content					
			}
		UserData[uindex].point=USER_CHAT_MSGNUM-1//修改记录中最新消息的位置
		}
		else {//记录中最新消息所处位置未超出记录长度
			for(i=0;i<USER_CHAT_MSGNUM;i++){//队列中最新消息之前的消息不动
				if(UDH.point-i>=0)
					continue
				else{//将队列中最新消息之后的消息替换为超出记录长度的消息
					UserData[uindex].messages[UserData[uindex].point+USER_CHAT_MSGNUM-i].id=UDH.messages[UDH.point+UDH.messages.length-i].id
					UserData[uindex].messages[UserData[uindex].point+USER_CHAT_MSGNUM-i].content=UDH.messages[UDH.point+UDH.messages.length-i].content
				}
			}
		}
		UserData[uindex].messages.length=USER_CHAT_MSGNUM//修改队列长度
		if(UserData[uindex].point==USER_CHAT_MSGNUM-1){//最新消息恰好位于队尾
			UserData[uindex].point=0
		}
		else	
			UserData[uindex].point++
		UserData[uindex].messages[UserData[uindex].point].id=MsgID
		UserData[uindex].messages[UserData[uindex].point].content=Msg
	}
	
	bucketSet("QGDBS",GroupID,JSON.stringify(UserData))//保存聊天记录
//	sendText("已保存:\n"+JSON.stringify(UserData))
//	bucketSet(GroupID,UserID,"")//重置，清空记录
	return
}


//保存群聊列表
function SaveGroups(GroupTable){
	if(GroupTable!=""){
		Groups=JSON.parse(GroupTable)
		let flag=0
//		sendText("读取到消息记录:\n"+bucketGet("QGDBS",GroupID))
		for(let i=0;i<Groups.length;i++){
			if(Groups[i].id==GroupID){
				Groups[i].name=GroupName
				flag=1
				break
			}
		}
		if(!flag){
			Groups.push({
				id:GroupID,
				name:GroupName
			})
		}
	}
	else {
		Groups[0]={
			id:GroupID,
			name:GroupName
		}
	}
	bucketSet("QGDBS","Groups",JSON.stringify(Groups))
	return
}


main()