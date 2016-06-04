module.exports=function(err,req,res,next){
	if(err.suggestStatusCode) res.status(err.suggestStatusCode).json({message:err.message});
	else res.status(500).json({message:err.message});
}
