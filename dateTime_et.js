const monthNamesET = ["jaanuar", "veebruar", "märts", "aprill", "mai", "juuni", "juuli", "august", "september", "oktoober", "november", "detsember"];

const dateNowET = function(){
	let timeNow = new Date();
	return  monthNamesET[timeNow.getMonth()] + "/" + timeNow.getDate()+ "/" + timeNow.getFullYear();

}

const timeNowET = function(){
	let timeNow = new Date();
	return timeNow.getHours() + ":" + timeNow.getMinutes() + ":" + timeNow.getSeconds();
}

const timeOfDayET = function(){
	let dayPart = "Suvaline aeg";
	const hourNow = new Date().getHours();
	//const hourNow = 15;
	if (hourNow > 6 && hourNow <= 11){
		dayPart = "hommik";
	}
	if (hourNow >= 12 && hourNow < 14){
		dayPart = "keskpäev";
	}
	if (hourNow >= 14 && hourNow <= 18){
		dayPart = "pärastlõuna";
	}
	if (hourNow >= 18){
		dayPart = "õhtu";
	}
	return dayPart;
}

//modul exportdib need asjad
module.exports = {dateNowET: dateNowET, timeNowET: timeNowET, monthsET: monthNamesET, timeOfDayET: timeOfDayET};