var express=require('express');
var us=require('../services/userservice');
var Promise=require('bluebird');
var ps=require('../services/pmsservice');
var genError=require('../tools/gene-error');
var filtObject=require('../tools/filt-object');

var router=module.exports=express.Router();

//====================================
//下面是操作/users/:sid路径的中间件
//====================================
router.get('/:sid',(req,res,next)=>{
	var queriedUser=req.params.sid=='self'?req.user:req.params.sid;
	us.getStudentInfo(queriedUser).then((student)=>{
		if(!student) return next(genError(404,'No such student'));
		res.json(student.get());
	},(err)=>{
		next(err);
	});
});

router.put('/:sid',(req,res,next)=>{
	var currentUser=req.user;
	var queriedUser=req.params.sid=='self'?currentUser:req.params.sid;
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
			var updateAttributes=filtObject(['name','character'],data);
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
	var currentUser=req.user;
	var queriedUser=req.params.sid=='self'?currentUser:req.params.sid;
	var data=req.body;

	Promise.join(us.isAdmin(currentUser),ps.isOperateOnSelf(req,queriedUser),ps.checkAttributes(['name'],null,data),us.isCharacterValid(data.character),ps.checkAttributes(['password'],null,data),(isAdmin,isSelf,hasName,isCorrectCharacter,hasPassword)=>{
		//start to check
		if(hasName||isCorrectCharacter)
			if(!isAdmin) return next(genError(403,'Not permitted'));
		if(hasPassword)
			if(!isSelf) return next(genError(403,'Not permitted'));
		if(data.character && !isCorrectCharacter) return next(genError(400,'Invalid character'));
		//end check
		//start to patch
		us.getStudentInfo(queriedUser).then((student)=>{
			if(!student) return next(genError(404,'No such student'));
			var updateAttributes=filtObject(['name','character','password'],data);
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
	var currentUser=req.user;
	var queriedUser=req.params.sid=='self'?currentUser:req.params.sid;

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
