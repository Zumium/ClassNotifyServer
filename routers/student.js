var express=require('express');
var us=require('../userservice');

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
	us.isAdmin(req.user).then((result)=>{
		//非班委用户，禁止该操作
		if(!result) return res.sendStatus(403);
		us.addNewStudent(req.body).then(()=>{
			res.sendStatus(200);
		},(err)=>{
			if(err.suggestStatusCode==500) return res.sendStatus(500);
			else return res.status(err.suggestStatusCode).json({message:err.message});
			
		});
	},(err)=>{
		res.sendStatus(500);
	});
});

router.delete('/',(req,res)=>{
	res.sendStatus(405);
});

router.patch('/',(req,res)=>{
	res.sendStatus(405);
});

router.put('/',(req,res)=>{
	res.sendStatus(405);
});
//====================================
//接下来是操作/users/:sid路径的中间件
//====================================
router.get('/:sid',(req,res)=>{
	var queriedUser=req.params.sid;
	us.getStudentInfo(queriedUser).then((student)=>{
		res.json(student.dataValues);
	},(err)=>{
		res.status(400).json({message:err.message});
	});
});
