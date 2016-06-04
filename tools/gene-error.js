module.exports=function(statusCode,errorMessage){
	var e=new Error(errorMessage);
	e.suggestStatusCode=statusCode;
	return e;
}
