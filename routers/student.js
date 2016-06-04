var express=require('express');
var us=require('../services/userservice');
var ns=require('../services/notiservice');
var Promise=require('bluebird');
var ps=require('../services/pmsservice');

var router=exports.router=express.Router();

//====================================
//这是处理/users路径的路由中间件
//====================================
router.get('/',(req,res)=>{
	//GET方法，获取所有学生的信息
	us.getStudentInfo('all').then((students)=>{
		var stuInfo=[];
		students.forEach((eachStudent)=>{
			stuInfo.push(eachStudent.dataValues);
		});
		res.json(stuInfo);
	},(err)=>{
		res.sendStatus(500); //Internal Server Error
	});
});

router.post('/',(req,res)=>{
	//POST方法，新建用户
	//只有班委才能添加
	Promise.join(us.isAdmin(req.user),(result)=>{
		//非班委用户，禁止该操作
		if(!result) return res.sendStatus(403);
		us.addNewStudent(req.body).then(()=>{
			res.sendStatus(200);
		},(err)=>{
			if(err.suggestStatusCode==500) return res.sendStatus(500);
			else return res.status(err.suggestStatusCode).json({message:err.message});
			
		});
	}).then(null,(err)=>{
		res.status(500).json({message:err.message});
	});
});

//====================================
//接下来是操作/users/:sid路径的中间件
//====================================
router.get('/:sid',(req,res)=>{
	var queriedUser=req.params.sid;
	us.getStudentInfo(queriedUser).then((student)=>{
		if(!student) return res.status(404).json({message:'No such student'});
		res.json(student.dataValues);
	},(err)=>{
		res.status(500).json({message:err.message});
	});
});

router.put('/:sid',(req,res)=>{
	var queriedUser=req.params.sid;
	var currentUser=req.user;
	var data=req.body;
	//检查权限，班委才能执行该操作
	//if(!us.isAdmin(currentUser)) return res.sendStatus(403);
	//检查输入
	//if(data['id']) return res.status(400).json({message:'ID can\'t be set in this situation'});
	//if(!data['name']) return res.status(400).json({message:'Must have a name'});
	//if(!us.isCharacterValid(data['character']) || !data['character']) return res.status(400).json({message:'Invalid character'});
	//if(data['password']) return res.status(405).json({message:'Shouldn\'t set password with PUT method'});
	Promise.join(us.isAdmin(req.user),ps.checkAttributes(['name','character'],['id','password'],data),us.isCharacterValid(data.character),(isAdmin,isGoodAttr,isCorrectCharacter)=>{
		//开始检查
		if(!isAdmin) return res.status(403).json({message:'Not permitted'});
		if(!isGoodAttr) return res.status(400).json({message:'Something wrong among the request'});
		if(!isCorrectCharacter) return res.status(400).json({message:'Value of character not allowed'});
		//检查完毕
		us.getStudentInfo(queriedUser).then((student)=>{
			if(!student) return res.status(404).json({message:'No such student'});
			//开始修改
			var updateAttributes=us.filtObject(['name','character'],data);
			student.update(updateAttributes).then(()=>{
				res.sendStatus(200);
			},(err)=>{
				res.status(500).json({message:err.message});
			});
		},(err)=>{
			res.status(500).json({message:err.message});
		});
	}).then(null,(err)=>{
		res.status(500).json({message:err.message});
	});
});

router.patch('/:sid',(req,res)=>{
	var queriedUser=req.params.sid;
	var currentUser=req.user;
	var data=req.body;
	//run nesassery checks
	//if(data.name||data.character){
	//	if(!us.isAdmin(currentUser)) return res.sendStatus(403);
	//}
	//if(data.password){
	//	if(currentUser!=queriedUser) return res.sendStatus(403);
	//}
	//if(data.character && !us.isCharacterValid(data.character)) return res.status(400).json({message:'Invalid character'});
	Promise.join(us.isAdmin(currentUser),ps.isOperateOnSelf(req,queriedUser),ps.checkAttributes(['name'],null,data),us.isCharacterValid(data.character),ps.checkAttributes(['password'],null,data),(isAdmin,isSelf,hasName,isCorrectCharacter,hasPassword)=>{
		//start to check
		if(hasName||isCorrectCharacter)
			if(!isAdmin) return res.status(403).json({message:'Not permitted'});
		if(hasPassword)
			if(!isSelf) return res.status(403).json({message:'Not permitted'})
		if(data.character && !isCorrectCharacter) return res.status.json({message:'Invalid character'});
		//end check
		//start to patch
		us.getStudentInfo(queriedUser).then((student)=>{
			if(!student) return res.status(404).json({message:'No such student'});
			var updateAttributes=us.filtObject(['name','character','password'],data);
			student.update(updateAttributes).then(()=>{
				res.sendStatus(200);
			},(err)=>{
				res.status(500).json({message:err.message});
			});
		},(err)=>{
			res.status(500).json({message:err.message});
		});
	}).then(null,(err)=>{
		res.status(500).json({message:err.message});
	});
});

router.delete('/:sid',(req,res)=>{
	var queriedUser=req.params.sid;
	var currentUser=req.user;
	//if(!us.isAdmin(currentUser)) return res.sendStatus(403);
	Promise.join(us.isAdmin(currentUser),(isAdmin)=>{
		if(!isAdmin) return res.status(403).json({message:'Not permitted'});
		us.getStudentInfo(queriedUser).then((student)=>{
			if(!student) return res.status(404).json({message:'No such student'});
			student.destroy().then(()=>{
				res.sendStatus(200);
			},(err)=>{
				res.status(500).json({message:err.message});
			});
		},(err)=>{
			res.status(500).json({message:err.message});
		});
	}).then(null,(err)=>{
		res.status(500).json({message:err.message});
	});
});
//=============================================
//接下来是处理/users/:sid/notifications的中间件
//=============================================
router.get('/:sid/notifications',(req,res)=>{
	var queriedUser=req.params.sid;
	var currentUser=req.user;
	//权限检查，不允许查看别人的通知
	//if(queriedUser!=currentUser) return res.status(403).json({message:'Not allow to query others\' notifications'});
	Promise.join(ps.isOperateOnSelf(req,queriedUser),(isSelf)=>{
		//权限检查，不允许查看别人的通知
		if(!isSelf) return res.status(403).json({message:'Not permitted'});
		ns.getPersonalNotifications(queriedUser,req.query).then((notifications)=>{
			var results=[];
			notifications.forEach((eachNoti)=>{
				var t=eachNoti.get();
				delete t['notificationStatus'];
				results.push(t);
			});
			res.status(200).json(results);
		},(err)=>{
			if(err.suggestStatusCode==404) res.status(404).json({message:err.message});
			else res.status(500).json({message:err.message});
		});
	}).then(null,(err)=>{
		res.status.json({message:err.message});
	});
});

