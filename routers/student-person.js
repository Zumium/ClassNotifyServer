var express=require('express');
var us=require('../services/userservice');
var Promise=require('bluebird');
var genError=require('../tools/gene-error');

var router=module.exports=express.Router();

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
