const express = require('express');
const app = express();
const fs = require('fs');
const mysql = require('mysql2');
const bodyparser = require('body-parser')
const dateInfo = require('./dateTime_et');
const dbConfig = require('../../vp23config');
const database = 'if23_berkman';

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyparser.urlencoded({extended: false}));

//Loon andmebaasi ühenduse
const conn = mysql.createConnection({
	host: dbConfig.configData.host,
	user: dbConfig.configData.user,
	password: dbConfig.configData.password,
	database: database
}); 



//route
app.get('/', (req, res)=>{
	//res.send("See tootab")
	res.render('index');
});

app.get('/timenow', (req,res) =>{
	const timeNow = dateInfo.timeNowET();
	const dateNow = dateInfo.dateNowET();
	res.render('timenow', {dateN: dateNow, timeN: timeNow});
});

app.get('/wisdom', (req, res)=>{
	let folkWisdom = [];
	fs.readFile("public/txtfiles/vanasonad.txt", "utf8", (err,data)=>{
		if(err){
			console.log(err);
		}
		else{
			folkWisdom = data.split(";");
		res.render('Justlist', {h1: 'Vanasõnad', wisdoms: folkWisdom});
		}
	});//readFile lõppeb
});

app.get('/eestifilm', (req,res) =>{
	res.render('eestifilmindex');
});

app.get('/eestifilm/filmiloend', (req,res) =>{
	let sql = 'SELECT title, production_year FROM movie';
	let sqlresult = [];
	conn.query(sql, (err, result) =>{
		if (err) {
			throw err;
		}
		else {
			//console.log(result);
			console.log(result[4].title);
			sqlresult = result;
			res.render('eestifilmlist', {filmlist: sqlresult});
		}
	});
});

app.get('/eestifilm/lisaperson', (req,res) =>{
	res.render('eestifilmaddactor');
});

app.post('/eestifilm/lisaperson', (req,res) =>{
	console.log(req.body);
	let notice = '';
	let sql = 'INSERT INTO person(first_name, last_name, birth_date) VALUES (?,?,?)';
	conn.query(sql, [req.body.firstNameInput, req.body.lastNameInput, req.body.birthDateInput], (err, result)=>{
		if(err){
			throw err;
			notice = 'Andmete salvestamine ebaõnnestus!' + err;
			res.render('eestifilmaddactor', {notice});
		}
		else {
			notice = 'Filmitegelase ' + req.body.firstNameInput + ' ' + req.body.lastNameInput + 'salvestamine õnnestus!';
			res.render('eestifilmaddactor', {notice});
		}
	});
});





app.get('/logdata', (req, res) =>{
  // Loeme logiandmed log.txt failist
  let filetxt = [];
  fs.readFile("public/txtfiles/log.txt", "utf8", (err, data) => {
    if (err) {
      console.log(err);
    }
	else {
		filetxt = data.split(";");
      // Saadame andmed HTML-i
      res.render('logdata', {logEntries: filetxt});
    }
  });
});
app.listen(5204);