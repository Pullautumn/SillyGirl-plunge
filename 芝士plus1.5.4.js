//频道:https://t.me/sillyGirl_Plugin，欢迎反馈
//2022-6-9 v1.3 修复多容器重复失效账号重复通知的问题
//2022-6-9 v1.4 添加对新版青龙支持，交互优化与代码优化，并为群发失效通知添加随机延时
//2022-6-10 v1.4.1 修复'xxx,JD_COOKIE已失效。'命令无反馈的问题
//2022-6-11 v.1.4.2 修复'xxx,JD_COOKIE已失效。'部分账号匹配失败的问题,并优化交互
//2022-6-12 v1.4.3 玄学优化,可能减少了一些bug，也可能增加了一些bug
//2022-6-20 v1.5 添加青龙环境变量备份与恢复、客户Q绑导出与导入功能
//2022-6-20 v1.5.1 添加监控配置导出与导入功能，残废
//2022-6-20 v1.5.2 恢复备份自动清除备份信息，防止不良插件窃取ck
//2022-6-21 v1.5.3 修改移动ck为移动环境变量，修复青龙存在其他变量时移动京东ck时的序号问题，可用于移动其他环境变量
//2022-6-26 v1.5.4 延长通知所有客户的随机延时，以降低冻结风险

//[rule:^交换 ? ?]			
//交换两个账号顺序,不支持多容器
//例：交换 2 13

//[rule:^\S+,JD_COOKIE已失效。$]	
//通知客户ck失效
//使用方式-将傻妞通知“xxx,JD_COOKIE已失效。"重新复制粘贴发回给傻妞

//[rule:^移动 ? ?]  		
//移动环境变量位置，支持使用序号、备注，如是JD_COOKIE变量也可使用pt_pin值，其他变量可使用变量名
//例：移动 jd_abc 23 ，移动pt_pin值为jd_abc的账号到序号23
//例：移动 1 3 	，移动序号1的变量到序号3
//例：移动 小号 10 ，移动备注为小号的变量到序号10
//例：移动 elm 30，移动变量名为elm的变量到序号30

//[rule:^通知所有失效客户$]
//一键通知所有CK失效账户

//[rule:^删除失效$]
//一键删除所有处于禁用状态的CK，需具备失效ck自动禁用

//[rule:^备份青龙变量$]
//备份后请尽快恢复，防止不良插件窃取ck，也可使用delete qinglong backup命令清除备份

//[rule:^恢复青龙变量$]
//恢复备份后会自动清除备份，即每个备份仅能恢复一次

//[rule:^导出客户Q绑$]

//[rule:^导入客户Q绑[\s\S]+]
//例：导入客户Q绑 xxx，需搭配“导出客户Q绑”命令使用

//[rule:^导出监控配置$]

//[rule:^导入监控配置[\s\S]+]
//例：导入监控配置 xxx，需搭配“导出监控配置”命令使用
//监控变量过多可能无法导入，如无法导入可自行将导出信息添加到傻妞数据管理后台jd_cookie env_listens项

// [admin: true] 是否只允许管理员使用


//-------难产项目---------//QQ有消息长度限制

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
		let notify=sillyGirl.session("jd send "+pin +" "+msg)
		sendText("已通知:"+pin+"\n"+notify().message)		
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
		if(ql_token==null){
			sendText("青龙对接失败，请检查青龙管理是否配置有误")
			return
		}
//		var JD_COOKIES=Get_env(Get_QL_env(),"JD_COOKIE")
		sendText(Move_qlEnv(param(1),param(2)-1,Get_QL_env()))
			
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
		
	else if(msg=="导出监控配置")
		sendText(Export_spy())

	else if(msg.indexOf("导入监控配置")!=-1)
		sendText(Import_spy(msg.match(/(?<=导入监控配置 )\S+/g)))
		
	return
}


function Recovery_qlEnv(QLS){
	let notify=""
	let data=bucketGet("qinglong","backup")
	if(data=="")
		return "备份不存在耶"
	let backup=JSON.parse(data)
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
			notify=notify+"\n成功恢复备份容器"+backup[i].container+"的"+count+"个变量至容器"+QLS[GetContent()-1].name
		else if(choose==0)
			notify=notify+"\n成功恢复备份容器"+backup[i].container+"的"+count+"个变量至容器"+QLS[0].name			
	}
	bucketSet("qinglong","backup","")
	return notify
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
	let notify=""
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
		notify=notify+"\n\n容器"+QLS[i].name+":"+counti+"个变量"
	}
	bucketSet("qinglong","backup",JSON.stringify(data))
	return "共备份"+QLS.length+"个容器"+count+"个变量:"+notify
}

function Delete_AllCK_disabled(QLS){
	let flag=0
	let dis_pin_num=0
	let notify=""
	for(let j=0;j<QLS.length;j++){
		ql_host=QLS[j].host
		ql_client_id=QLS[j].client_id
		ql_client_secret=QLS[j].client_secret
		ql_token=Get_QL_Token()
		var JD_COOKIES=Get_env(Get_QL_env(),"JD_COOKIE")	
		notify=notify+"容器"+(j+1)+QLS[j].name+":\n"			
		for(let i=0;i<JD_COOKIES.length;i++){
			if(JD_COOKIES[i].status==true){
				let pt_pin=JD_COOKIES[i].value.match(/(?<=pt_pin=)\S+(?=;)/g)
				notify=notify+(++dis_pin_num)+"、"+pt_pin+"\n"
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
	sendText("共删除"+dis_pin_num+"个失效账号，\n"+notify)
}

function Notify_AllCK_disabled(QLS){
	sendText("正在为您通知，如若失效客户过多将花费较长时间，请耐心等待")
	let flag=0
	let notify="已通知："
	let dis_pin_num=0
	for(let j=0;j<QLS.length;j++){
		ql_host=QLS[j].host
		ql_client_id=QLS[j].client_id
		ql_client_secret=QLS[j].client_secret
		ql_token=Get_QL_Token()
		var envs=Get_QL_env()
		notify=notify+"\n\n容器"+(j+1)+QLS[j].name+":"
		for(let i=0;i<envs.length;i++){
			if(envs[i].status==true){
				let pt_pin=envs[i].value.match(/(?<=pt_pin=)\S+(?=;)/g)
				if(notify.indexOf(pt_pin)==-1&&pt_pin!=null){
					notify=notify+"\n账号"+(i+1)+"-"+pt_pin
					sillyGirl.session("jd send "+pt_pin+" "+"温馨提示，您的账号"+pt_pin+"已过期，请重新登陆")
					sleep(Math.random()*10000+10000)
					dis_pin_num++
				}
				flag=1
			}
		}
	}
	if(!flag)
		sendText("您的客户全都没有失效耶~")
	else
		sendText("共"+dis_pin_num+"个账号失效，"+notify)	
}

function Move_qlEnv(from,to_index,envs){
	let notify=""
	let ql_v=Get_QL_verion()
	if(to_index>=envs.length)
		return "目标位置有误，超出变量总数"
	if(from.match(/^\d+$/g)!=null){	
		from=from-1
		if(from>=envs.length)
			return "原位置有误，超出变量总数"
		if(ql_v==401)
			Move_QL_Env(envs[from]._id,from,to_index)
		else
			Move_QL_Env(envs[from].id,from,to_index)
		let pin=envs[from].value.match(/(?<=pt_pin=)\S+(?=;)/g)
		if(pin!=null)
			notify="账号"+pin+" 移动成功!"
		else
			notify="变量"+envs[from].name+"移动成功"
	}
	else {		
		let from_index=Find_env(envs,from)
		if(from_index==-1)
			return "未找到该变量"
		if(ql_v==401)
			Move_QL_Env(envs[from_index]._id,from_index+1,to_index)
		else
			Move_QL_Env(envs[from_index].id,from_index+1,to_index)			
		let pin=envs[from_index].value.match(/(?<=pt_pin=)\S+(?=;)/g)
		if(pin!=null)
			notify="账号"+pin+" 移动成功!"
		else
			notify="变量"+envs[from_index].name+"移动成功"
	}
	return 	notify
}

function Find_env(envs,string){
	for(i=0;i<envs.length;i++){
		if(envs[i].value.match(/(?<=pt_pin=)\S+(?=;)/g)==string|| envs[i].remarks==string||envs[i].name==string)
			return i
	}
	return -1
}

function Get_QL(QLS){
	if(QLS.length>1){
		let notify="请选择容器(输入q退出)：\n"
		for(let i=0;i<QLS.length;i++){
			notify=notify+(i+1)+"、"+QLS[i].name+"\n"
		}
		sendText(notify)
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
	return bucketGet("jd_cookie","env_listens")
}

function Import_spy(data){
	let spys=JSON.parse(data)
	let count=0
	let notify=""
	for(let i=0;i<spys.length;i++){
		notify=notify+"\n"+(i+1)+"、"+spys[i].name
		count++
	}
	bucketSet("jd_cookie","env_listens",data)
	return "共导入"+count+"个监控信息"+notify
}

function Import_pinQQ(data){
	let notify=""
	let pinQQ=JSON.parse(data)
	let count=0
	for(let i=0;i<pinQQ.length;i++){
		bucketSet("pinQQ",pinQQ[i].pin,pinQQ[i].qq)
		notify=notify+"\n"+pinQQ[i].pin+":"+pinQQ[i].qq
		count++
	}
	return "已导入"+count+"个客户Q绑信息"+notify
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
