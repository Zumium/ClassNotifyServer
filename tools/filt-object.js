module.exports=function(keys,obj){
	var filtResult={};
	keys.forEach((eachKey)=>{
		if(obj[eachKey]!=undefined) filtResult[eachKey]=obj[eachKey];
	});
	return filtResult;
}
