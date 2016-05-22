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
		if(!student) return res.status(404).json({message:'No such student'});
		res.json(student.dataValues);
	},(err)=>{
		res.status(500).json({message:err.message});
	});
});

router.post('/:sid',(req,res)=>{
	res.sendStatus(405);
});

router.put('/:sid',(req,res)=>{
	var queriedUser=req.params.sid;
	var currentUser=req.user;
	var data=req.body;
	//检查权限，班委才能执行该操作
	if(!us.isAdmin(currentUser)) return res.sendStatus(403);
	//检查输入
	if(data['id']) return res.status(400).json({message:'ID can\'t be set in this situation'});
	if(!data['name']) return res.status(400).json({message:'Must have a name'});
	if(!us.isCharacterValid(data['character']) || !data['character']) return res.status(400).json({message:'Invalid character'});
	if(data['password']) return res.status(405).json({message:'Shouldn\'t set password with PUT method'});
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
});

router.patch('/:sid',(req,res)=>{
	var queriedUser=req.params.sid;
	var currentUser=req.user;
	var data=req.body;
	//run nesassery checks
	if(data.name||data.character){
		if(!us.isAdmin(currentUser)) return res.sendStatus(403);
	}
	if(data.password){
		if(currentUser!=queriedUser) return res.sendStatus(403);
	}
	if(data.character && !us.isCharacterValid(data.character)) return res.status(400).json({message:'Invalid character'});
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
});

router.delete('/:sid',(req,res)=>{
	var queriedUser=req.params.sid;
	var currentUser=req.user;
	if(!us.isAdmin(currentUser)) return res.sendStatus(403);
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
});
