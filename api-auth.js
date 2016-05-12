var strategy=require('passport-http').BasicStrategy;
var userService=require('./userservice');

module.exports=new strategy((id,password,done)=>{
	userService.vertifyUserLogin(username,password).then((result,msg)=>{
		if(result){
			done(null,id);
		}
		else{
			done(null,false,msg);
		}
	},(err)=>{
		done(err);
	});
});
