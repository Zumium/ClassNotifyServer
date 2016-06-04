var express=require('express');
var us=require('../services/userservice');
var ns=require('../services/notiservice');
var Promise=require('bluebird');
var ps=require('../services/pmsservice');
var genError=require('../tools/gene-error');

var router=exports.router=express.Router();

//====================================
//这是处理/users路径的路由中间件
//====================================
router.get('/',(req,res,next)=>{
	//GET方法，获取所有学生的信息
	us.getStudentInfo('all').then((students)=>{
		var stuInfo=[];
		students.forEach((eachStudent)=>{
			stuInfo.push(eachStudent.dataValues);
		});
		res.json(stuInfo);
	},(err)=>{
		next(err);
	});
});

router.post('/',(req,res,next)=>{
	//POST方法，新建用户
	//只有班委才能添加
	Promise.join(us.isAdmin(req.user),(result)=>{
		//非班委用户，禁止该操作
		if(!result) return next(genError(403,'Not permitted'));
		us.addNewStudent(req.body).then(()=>{
			res.sendStatus(200);
		},(err)=>{
			next(err);
		});
	}).then(null,(err)=>{
		next(err);
	});
});

//====================================
//接下来是操作/users/:sid路径的中间件
//====================================
router.get('/:sid',(req,res,next)=>{
	var queriedUser=req.params.sid;
	us.getStudentInfo(queriedUser).then((student)=>{
		if(!student) return next(genError(404,'No such student'));
		res.json(student.dataValues);
	},(err)=>{
		next(err);
	});
});

router.put('/:sid',(req,res,next)=>{
	var queriedUser=req.params.sid;
	var currentUser=req.user;
	var data=req.body;

	Promise.join(us.isAdmin(req.user),ps.checkAttributes(['name','character'],['id','password'],data),us.isCharacterValid(data.character),(isAdmin,isGoodAttr,isCorrectCharacter)=>{
		//开始检查
		if(!isAdmin) return next(genError(403,'Not permitted'));
		if(!isGoodAttr) return next(genError(400,'Something wrong among the request'));
		if(!isCorrectCharacter) return next(genError(400,'Value of character not allowed'));
		//检查完毕
		us.getStudentInfo(queriedUser).then((student)=>{
			if(!student) return next(genError(404,'No such student'));
			//开始修改
			var updateAttributes=us.filtObject(['name','character'],data);
			student.update(updateAttributes).then(()=>{
				res.sendStatus(200);
			},(err)=>{
				next(err);
			});
		},(err)=>{
			next(err);
		});
	}).then(null,(err)=>{
		next(err);
	});
});

router.patch('/:sid',(req,res,next)=>{
	var queriedUser=req.params.sid;
	var currentUser=req.user;
	var data=req.body;

	Promise.join(us.isAdmin(currentUser),ps.isOperateOnSelf(req,queriedUser),ps.checkAttributes(['name'],null,data),us.isCharacterValid(data.character),ps.checkAttributes(['password'],null,data),(isAdmin,isSelf,hasName,isCorrectCharacter,hasPassword)=>{
		//start to check
		if(hasName||isCorrectCharacter)
			if(!isAdmin) next(genError(403,'Not permitted'));
		if(hasPassword)
			if(!isSelf) next(genError(403,'Not permitted'));
		if(data.character && !isCorrectCharacter) return next(genError(400,'Invalid character'));
		//end check
		//start to patch
		us.getStudentInfo(queriedUser).then((student)=>{
			if(!student) next(genError(404,'No such student'));
			var updateAttributes=us.filtObject(['name','character','password'],data);
			student.update(updateAttributes).then(()=>{
				res.sendStatus(200);
			},(err)=>{
				next(err);
			});
		},(err)=>{
			next(err);
		});
	}).then(null,(err)=>{
		next(err);
	});
});

router.delete('/:sid',(req,res,next)=>{
	var queriedUser=req.params.sid;
	var currentUser=req.user;

	Promise.join(us.isAdmin(currentUser),(isAdmin)=>{
		if(!isAdmin) return next(genError(403,'Not permitted'));
		us.getStudentInfo(queriedUser).then((student)=>{
			if(!student) return next(genError(404,'No such student'));
			student.destroy().then(()=>{
				res.sendStatus(200);
			},(err)=>{
				next(err);
			});
		},(err)=>{
			next(err);
		});
	}).then(null,(err)=>{
		next(err);
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
		if(!isSelf) return next(genError(403,'Not permitted'));
		ns.getPersonalNotifications(queriedUser,req.query).then((notifications)=>{
			var results=[];
			notifications.forEach((eachNoti)=>{
				var t=eachNoti.get();
				delete t['notificationStatus'];
				results.push(t);
			});
			res.status(200).json(results);
		},(err)=>{
			next(err);
		});
	}).then(null,(err)=>{
		next(err);
	});
});

