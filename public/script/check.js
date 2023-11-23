//console.log("Töötab!");
let fileSizeLimit = 1,5 * 1024 * 1024;
window.onload = function(){
	//document.getElementById("photoSubmit")
	document.querySelector("#photoSubmit").disabled = true;
	document.querySelector("#InfoPlace").innerHTML = "Pilt pole valitud!";
	document.querySelector("#photoInput").addEventListener("change", checkPhotoSize);
}

function checkPhotoSize(){
	console.log("Töötab!");
	console.log(document.querySelector("#photoInput").files[0].size)
	if(document.querySelector("#photoInput").files[0].size <= fileSizeLimit){
		document.querySelector("#photoSubmit").disabled = false;
		document.querySelector("#InfoPlace").innerHTML = "";
	} else {
		document.querySelector("#photoSubmit").disabled = true;
		document.querySelector("#InfoPlace").innerHTML = "Valitud pilt on liiga suure failimahuga!";
	}
}