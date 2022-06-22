//频道:https://t.me/sillyGirl_Plugin，欢迎反馈
//2022-6-9 v1.3 修复多容器重复失效账号重复通知的问题
//2022-6-9 v1.4 添加对新版青龙支持，交互优化与代码优化，并为群发失效通知添加随机延时
//2022-6-10 v1.4.1 修复'xxx,JD_COOKIE已失效。'命令无反馈的问题
//2022-6-11 v.1.4.2 修复'xxx,JD_COOKIE已失效。'部分账号匹配失败的问题,并优化交互
//2022-6-12 v1.4.3 玄学优化,可能减少了一些bug，也可能增加了一些bug
//2022-6-20 v1.5 添加青龙环境变量备份与恢复、客户Q版导入与导出功能

//[rule:^交换 ? ?]			
//交换两个账号顺序,不支持多容器
//例：交换 2 13

//[rule:^\S+,JD_COOKIE已失效。$]	
//通知客户ck失效
//使用方式-将傻妞通知“xxx,JD_COOKIE已失效。"重新复制粘贴发回给傻妞

//[rule:^移动 ? ?]  		
//支持使用序号、备注和pt_pin值移动
//例：移动 jd_123pin 23 ，移动账号jd_123pin到序号23
//例：移动 1 3 	，移动账号1到序号3
//例：移动 小号 10 ，移动小号到序号10

//[rule:^通知所有失效客户$]
//一键通知所有CK失效账户

//[rule:^删除失效$]
//一键删除所有失效CK

//[rule:^备份青龙变量$]

//[rule:^恢复青龙变量$]

//[rule:^导出客户Q绑$]

//[rule:导入客户Q绑[\s\S]+]
//例：导入客户Q绑 xxx，需搭配“导出客户Q绑”命令使用

// [admin: true] 是否只允许管理员使用


//-------难产项目---------//导出：QQ有消息长度限制，导入：傻妞有参数长度限制
//[:^导出监控配置$]
//[:^导入监控配置 ?]

//[:^导出青龙环境变量$]
//一键导出青龙环境变量,支持完整导出与最小化导出
//完整导出：多容器完整信息，可用于用于导入多容器

//[:^导入青龙环境变量 ?]
//命令：导入青龙环境变量 xxxxxxxx，xxxxxxx为"导出青龙环境变量"所导出的信息
//导入信息为多容器且傻妞绑定多个青龙容器时需一一选择导入容器





	
var ql_host=""
var ql_client_id=""
var ql_client_secret=""
var ql_token=""


function main(){
	var user_id = GetUserID()
	var group_id = GetChatID()
	var msg_type = ImType()
	var msg=GetContent()
	let data=bucketGet("qinglong","QLS")
	if(data==""){
		sendText("醒一醒，你都没对接青龙，使用\"青龙管理\"命令对接青龙")
		return
	}
	var QLS=JSON.parse(data)
	if(msg.indexOf("交换")!=-1){
		let ck1_info=sillyGirl.session("jd find "+param(1))
		let ck2_info=sillyGirl.session("jd find "+param(2))
		let ck1_ID=ck1_info().message.match(/(?<=编号：)[a-zA-Z0-9]+/g)
		let ck2_ID=ck2_info().message.match(/(?<=编号：)[a-zA-Z0-9]+/g)
		let sillyGirl_order="jd exchange "+ck1_ID+" "+ck2_ID
		sendText(sillyGirl.session(sillyGirl_order)().message)
	}
	
	else if(msg.indexOf("JD_COOKIE已失效。")!=-1){
		let pin=msg.match(/^\S+(?=,)/g)
		let notify_msg=sillyGirl.session("jd send "+pin +" "+msg)
		sendText("已通知:"+pin+"\n"+notify_msg().message)		
	}
	
	else if(msg.indexOf("移动")!=-1){
		if(param(2).match(/^\d+$/g)==null){
			sendText("命令错误，目标位置必需为数字")
			return
		}
		if(Get_QL(QLS)==-1){
			sendText("获取QLS失败")
			return
		}		
		ql_token=Get_QL_Token()
		var JD_COOKIES=Get_env(Get_QL_env(),"JD_COOKIE")
		if(ql_token==null){
			sendText("青龙对接失败，请检查青龙管理是否配置有误")
			return
		}
		Move_qlEnv(param(1),param(2)-1,JD_COOKIES)
			
	}
	
	else if(msg=="通知所有失效客户")
		Notify_AllCK_disabled(QLS)
	
	else if(msg=="删除失效")
		Delete_AllCK_disabled(QLS)
	
	else if(msg=="备份青龙变量")
		sendText(Backup_qlEnv(QLS))
	
	else if(msg=="恢复青龙变量")
		sendText(Recovery_qlEnv(QLS))
		
	else if(msg=="导出客户Q绑")
		sendText(Export_pinQQ())
		
	else if(msg.indexOf("导入客户Q绑")!=-1)
		sendText(Import_pinQQ(msg.match(/(?<=导入客户Q绑 )\S+/g)))
		
	return
}


function Recovery_qlEnv(QLS){
	let notify_msg=""
	let data=bucketGet("qinglong","backup")
	if(data=="")
		return "你都没备份，恢复个寂寞"
	let backup=JSON.parse(data)
	//buckketSet("qinglong","backup","")
	for(let i=0;i<backup.length;i++){
		if(QLS.length>1)
			sendText("请选择备份容器"+backup[i].container+"的恢复容器\n")
		let choose=Get_QL(QLS)
		if(choose==-1)
			return "获取QLS失败，退出"	
		let count=0	
		ql_token=Get_QL_Token()
		let envs=Get_QL_env()
		for(let j=0;j<backup[i].envs.length;j++){
			if(IsExist(envs,backup[i].envs[j].name,backup[i].envs[j].value))
				continue
			else{ 
				Add_QL_Env(backup[i].envs[j].name,backup[i].envs[j].value,backup[i].envs[j].remark)
				count++
			}
		}
		if(choose==1)
			notify_msg=notify_msg+"\n成功恢复备份容器"+backup[i].container+"的"+count+"个变量至容器"+QLS[GetContent()-1].name
		else if(choose==0)
			notify_msg=notify_msg+"\n成功恢复备份容器"+backup[i].container+"的"+count+"个变量至容器"+QLS[0].name			
	}
	return notify_msg
}

function Backup_qlEnv(QLS){
	var ql={
			container:"",
			envs:[{
				name:"",
				value:"",
				remark:""
			}]
		}
	var data=[ql]
	let count=0
	let notify_msg=""
	for(let i=0;i<QLS.length;i++){
		if(i>=data.length)
			data.push(ql)
		let counti=0
		data[i].container=QLS[i].name
		ql_host=QLS[i].host
		ql_client_id=QLS[i].client_id
		ql_client_secret=QLS[i].client_secret
		ql_token=Get_QL_Token()
		let envs=Get_QL_env()
		for(let j=0;j<envs.length;j++){
			if(j>=data[i].envs.length)
				data[i].envs.push({name:"",value:"",remark:""})
			data[i].envs[j].name=envs[j].name
			data[i].envs[j].value=envs[j].value
			data[i].envs[j].remark=envs[j].remarks
			count++,counti++
		}
		notify_msg=notify_msg+"\n\n容器"+QLS[i].name+":"+counti+"个变量"
	}
	bucketSet("qinglong","backup",JSON.stringify(data))
	return "共备份"+QLS.length+"个容器"+count+"个变量:"+notify_msg
}

function Delete_AllCK_disabled(QLS){
	let flag=0
	let dis_pin_num=0
	let disable_notify=""
	for(let j=0;j<QLS.length;j++){
		ql_host=QLS[j].host
		ql_client_id=QLS[j].client_id
		ql_client_secret=QLS[j].client_secret
		ql_token=Get_QL_Token()
		var JD_COOKIES=Get_env(Get_QL_env(),"JD_COOKIE")	
		disable_notify=disable_notify+"容器"+(j+1)+QLS[j].name+":\n"			
		for(let i=0;i<JD_COOKIES.length;i++){
			if(JD_COOKIES[i].status==true){
				let pt_pin=JD_COOKIES[i].value.match(/(?<=pt_pin=)\S+(?=;)/g)
				disable_notify=disable_notify+(++dis_pin_num)+"、"+pt_pin+"\n"
				if(Get_QL_verion()==401)
					Delete_QL_Env(JD_COOKIES[i]._id)
				else
					Delete_QL_Env(JD_COOKIES[i].id)
				flag=1
			}	
		}
	}
	if(!flag)
	sendText("您的客户全都没有失效耶~")
	else
	sendText("共删除"+dis_pin_num+"个失效账号，\n"+disable_notify)
}

function Notify_AllCK_disabled(QLS){
	let flag=0
	let disable_notify="已通知："
	let dis_pin_num=0
	for(let j=0;j<QLS.length;j++){
		ql_host=QLS[j].host
		ql_client_id=QLS[j].client_id
		ql_client_secret=QLS[j].client_secret
		ql_token=Get_QL_Token()
		var JD_COOKIES=Get_env(Get_QL_env(),"JD_COOKIE")	
		disable_notify=disable_notify+"\n\n容器"+(j+1)+QLS[j].name+":"
		for(let i=0;i<JD_COOKIES.length;i++){
			if(JD_COOKIES[i].status==true){
				let pt_pin=JD_COOKIES[i].value.match(/(?<=pt_pin=)\S+(?=;)/g)
				if(disable_notify.indexOf(pt_pin)==-1){
					disable_notify=disable_notify+"\n"+(++dis_pin_num)+"、账号"+(i+1)+"-"+pt_pin
					sillyGirl.session("jd send "+pt_pin+" "+"温馨提示，您的账号"+pt_pin+"已过期，请重新登陆")
					sleep(Math.random()*3000+1000)
				}
						flag=1
			}
		}
	}
	if(!flag)
		sendText("您的客户全都没有失效耶~")
	else
		sendText("共"+dis_pin_num+"个账号失效，"+disable_notify)	
}

function Move_qlEnv(from,to_index,JD_COOKIES){
	let ql_v=Get_QL_verion()
	if(to_index>=JD_COOKIES.length){
		sendText("醒一醒，你没有这么多CK,目标位置错误")
		return
	}
	if(from.match(/^\d+$/g)!=null){	
		from=from-1
		if(from>=JD_COOKIES.length){
			sendText("醒一醒，你没有这么多CK，账号序号错误")
			return
		}
		if(ql_v==401)
			Move_QL_Env(JD_COOKIES[from]._id,from,to_index)
		else
			Move_QL_Env(JD_COOKIES[from].id,from,to_index)
		sendText("账号"+JD_COOKIES[from].value.match(/(?<=pt_pin=)\S+(?=;)/g)+" 移动成功!")
	}
	else {		
		let from_index=GetJDCookie(JD_COOKIES,from)
		if(from_index==-1){
		sendText("pin值或者备注错误，请使用青龙中存在的京东账号")
			return
		}
		if(ql_v==401)
			Move_QL_Env(JD_COOKIES[from_index]._id,from_index+1,to_index)
		else
			Move_QL_Env(JD_COOKIES[from_index].id,from_index+1,to_index)			
		sendText("账号"+JD_COOKIES[from_index].value.match(/(?<=pt_pin=)\S+(?=;)/g)+" 移动成功!")
	}			
}

function GetJDCookie(JD_COOKIES,pin_remark){
	for(i=0;i<JD_COOKIES.length;i++){
		if(JD_COOKIES[i].value.indexOf(pin_remark)!=-1|| JD_COOKIES[i].remarks==pin_remark)
			return i
	}
	return -1
}

function Get_QL(QLS){
	if(QLS.length>1){
		let notify_msg="请选择容器(输入q退出)：\n"
		for(let i=0;i<QLS.length;i++){
			notify_msg=notify_msg+(i+1).toString()+":"+QLS[i].name+"\n"
		}
		sendText(notify_msg)
		let ql_num=input(10000)
		if(ql_num==""||ql_num=="q"||ql_num.match(/^\d+$/g)==null||ql_num>QLS.length)
			return -1
		ql_num=Number(ql_num)-1
		ql_host=QLS[ql_num].host
		ql_client_id=QLS[ql_num].client_id
		ql_client_secret=QLS[ql_num].client_secret
		return 1
	}
	else{
		ql_host=QLS[0].host
		ql_client_id=QLS[0].client_id
		ql_client_secret=QLS[0].client_secret
		return 0
	}
}

function IsExist(Array,name,value){
	for(let i=0;i<Array.length;i++)
		if(Array[i].name==name&&Array[i].value==value)
			return true
	return false
}

function Get_env(envs,name){
	let Hit=[]
	for(let i=0,j=0;i<envs.length;i++){
		if(envs[i].name==name){
			Hit[j]=envs[i]
			j++
		}
	}
	return Hit	
}

function Get_QL_env(){
	let response=request({
		url:ql_host+"/open/envs",
		method:"get",
		headers:{
			accept: "application/json",
			Authorization:"Bearer "+ql_token
		},
		dataType: "application/json"
	})
	return JSON.parse(response).data
}

function Get_QL_Token(){
		let data=request({url:ql_host+"/open/auth/token?client_id="+ql_client_id+"&client_secret="+ql_client_secret})
		data=JSON.parse(data)	
		if(data.code==200)
			return data.data.token
		else return null
}

function Get_QL_verion(){
	let sys_v=request({
		url:ql_host+"/open/system",
		method:"get",
		headers:{
			accept: "application/json",
			Authorization:"Bearer "+ql_token
		},
		dataType: "application/json"
	})
	sys_v=JSON.parse(sys_v)
	if(sys_v.code==401)
		return sys_v.code
	else
		return sys_v.data.version
}

function Add_QL_Env(name,value,remark){
		return request({
		url:ql_host+"/open/envs",
		method:"post",
		headers:{
			accept: "application/json",
			Authorization:"Bearer "+ql_token,
			contentType:"application/json"
		},
		body:[{"value": value,"name": name,"remarks": remark}],
		dataType: "application/json"
	})
}
		
function Update_QL_Env(name,value,remark,_id){
	return request({
		url:ql_host+"/open/envs",
		method:"put",
		headers:{
			accept: "application/json",
			Authorization:"Bearer "+ql_token,
			contentType:"application/json"
		},
		body:{"value": value,"name": name,"remarks": remark,"_id":_id},
		dataType: "application/json"
	})
}

function Delete_QL_Env(_id){
	return request({
		url:ql_host+"/open/envs",
		method:"delete",
		headers:{
			accept: "application/json",
			Authorization:"Bearer "+ql_token,
			contentType:"application/json"
		},
		body:[_id],
		dataType: "application/json"
	})	
}

function Move_QL_Env(_id,from_index,to_index){
		return request({
		url:ql_host+"/open/envs/"+_id+"/move",
		method:"put",
		headers:{
			accept: "application/json",
			Authorization:"Bearer "+ql_token,
			contentType:"application/json"
		},
		body:{"fromIndex": from_index,"toIndex": to_index},
		dataType: "application/json"
	})	
}

main()



function Export_envs_lite(QLS){
	let envlite=[]
	for(let i=0;i<QLS.length;i++){
		ql_host=QLS[i].host
		ql_client_id=QLS[i].client_id
		ql_client_secret=QLS[i].client_secret
		ql_token=Get_QL_Token()
		let envs=Get_QL_env()
		for(let j=0;j<envs.length;j++){
			delete envs[j]._id
			delete envs[j].created
			delete envs[j].status
			delete envs[j].timestamp
			delete envs[j].position
			envlite[j]=envs[j]
		}
	}
	sendText("共"+envlite.length+"环境变量")
	return JSON.stringify(envlite)
}

function Import_env_lite(QLS,data){
	Get_QL(QLS)
	ql_token=Get_QL_Token()
	let qlenvs=Get_QL_env()
	let backup=JSON.parse(data)
	let count =0
	for(let i=0;i<oldenvs.length;i++){
		if(!IsExist(qlenvs,backup[i].name,backup[i].value)){
			Add_QL_Env(backup[i].name,back[i].value,backup[i].remarks)
			count++
		}
	}
	return "收到"+backup.length+"个青龙变量信息，成功导入"+count+"个变量"
}

function Export_spy(){
	let data=bucketKeys("SpyQueue")
	let allspy=[]
	for(let i=0;i<data.length;i++){
		var spy=JSON.parse(bucketGet("SpyQueue",data[i]))
		spy.Oks=""
		allspy[i]=spy
		sendText(JSON.stringify(allspy[i]))
	}
	return JSON.stringify(allspy)
}

function Import_spy(data){
	let spys=JSON.parse(data)
	for(let i=0;i<spys.length;i++){
		
	}
}

function Import_pinQQ(data){
	let notify_msg=""
	let pinQQ=JSON.parse(data)
	let count=0
	for(let i=0;i<pinQQ.length;i++){
		bucketSet("pinQQ",pinQQ[i].pin,pinQQ[i].qq)
		notify_msg=notify_msg+"\n"+pinQQ[i].pin+":"+pinQQ[i].qq
		count++
	}
	return "已导入"+count+"个客户Q绑信息"+notify_msg
}

function Export_pinQQ(){
	let data=[{
		pin:"",
		qq:0
	}]
	let pins=bucketKeys("pinQQ")
//	sendText(pins[0])
	for(let i=0;i<pins.length;i++){
		if(i<data.length){
			data[i].pin=pins[i]
			data[i].qq=bucketGet("pinQQ",pins[i])
		}
		else data.push({pin:pins[i],qq:bucketGet("pinQQ",pins[i])})
	}
	return JSON.stringify(data)
}
