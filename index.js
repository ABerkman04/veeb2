const express = require('express');
const app = express();
const fs = require('fs');
const mysql = require('mysql2');
const bodyparser = require('body-parser')
const dateInfo = require('./dateTime_et');
const dbConfig = require('../../vp23config');
const database = 'if23_berkman';
const multer = require('multer');
const mime = require('mime');
const sharp = require('sharp');
const async = require('async');



const upload = multer({dest: './public/gallery/orig/'});

app.set('view engine', 'ejs');
app.use(express.static('public'));
//app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.urlencoded({extended: true}));

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

app.get('/news', (req, res)=>{
	res.render('news');
});

app.get('/news/add', (req, res)=>{
	res.render('addnews');
});

app.get('/news/read', (req, res)=>{
	res.render('readnews');
});

app.get('/news/read/:id', (req, res)=>{
	res.render('Vaatama uudist mille id on: ' + req.params.id);
});

app.get('/photogallery', (req, res)=> {
	let photoList = [];
	let sql = 'SELECT id,filename,alttext FROM vp_gallery WHERE privacy > 1 AND deleted IS NULL ORDER BY id DESC';
	conn.execute(sql, (err,result)=>{
		if (err){
			throw err;
			res.render('photogallery', {photoList : photoList});
		}
		else {
			photoList = result;
			console.log(result);
			res.render('photogallery', {photoList : photoList});
		}
	});
});

app.get('/photoupload', (req, res)=> {
	res.render('photoupload');
});

app.post('/photoupload', upload.single('photoInput'), (req, res)=> {
	let notice = '';
	console.log(req.file);
	console.log(req.body);
	//const mimeType = mime.getType(req.file.path);
	//console.log(mimeType);
	const fileName = 'vp_' + Date.now() + '.jpg';
	//fs.rename(req.file.path, './public/gallery/orig/' + req.file.originalname, (err)=> {
	fs.rename(req.file.path, './public/gallery/orig/' + fileName, (err)=> {
		console.log('Viga: ' + err);
	});
	const mimeType = mime.getType('./public/gallery/orig/' + fileName);
	console.log('Tüüp: ' + mimeType);
	//loon pildist pisipildi (thumbnail)
	sharp('./public/gallery/orig/' + fileName).resize(800,600).jpeg({quality : 90}).toFile('./public/gallery/normal/' + fileName);
	sharp('./public/gallery/orig/' + fileName).resize(100,100).jpeg({quality : 90}).toFile('./public/gallery/thumbs/' + fileName);
	
	
	let sql = 'INSERT INTO vp_gallery (filename, originalname, alttext, privacy, userid) VALUES (?,?,?,?,?)';
	const userid = 1;
	conn.execute(sql, [fileName, req.file.originalname, req.body.altInput, req.body.privacyInput, userid], (err, result)=>{
		if(err) {
			throw err;
			notice = 'Foto andmete salvestamine ebaõnnestus!' + err;
			res.render('photoupload', {notice: notice});
		}
		else {
			notice = 'Pilt "' + req.file.originalname + '" laeti üles!';
			res.render('photoupload', {notice: notice});
		}
	});
	
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

app.get('/news/read', (req,res) =>{
	let sql = 'SELECT title, content FROM vp_news';
	let sqlresult = [];
	conn.query(sql, (err, result) =>{
		if (err) {
			throw err;
		}
		else {
			//console.log(result);
			//console.log(result[4].title);
			sqlresult = result;
			res.render('readnews', {filmlist: sqlresult});
		}
	});
});

app.get('/eestifilm/lisaperson', (req,res) =>{
	res.render('eestifilmaddactor');
});

app.get('/eestifilm/lisaseos', (req,res) =>{
	//Loome tegevuste loendi
	const myQueries = [
		function(callback){
			conn.execute('SELECT id,title FROM movie', (err, result)=>{
				if(err) {
					return callback(err)
				}
				else {
					return callback(null, result);
				}
			});
		},
		function(callback){
			conn.execute('SELECT id,first_name last_name FROM person', (err, result)=>{
				if(err) {
					return callback(err)
				}
				else {
					return callback(null, result);
				}
			});
		}
	];
	//paneme need tegevasuded asünroolselt tööle
	async.parallel(myQueries, (err,results)=>{
		if (err){
			throw err;
		}
		else{
			console.log(results);
		}
	});
	res.render('eestifilmdaddrelation');
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

app.post('/news/add', (req,res) =>{
	console.log(req.body);
	let notice = '';
	let sql = 'INSERT INTO vp_news(title, content, expire, userid) VALUES (?,?,?,1)';
	conn.execute(sql, [req.body.titleInput, req.body.contentInput, req.body.expireDateInput], (err, result)=>{
		if(err){
			throw err;
			notice = 'Andmete salvestamine ebaõnnestus!' + err;
			res.render('eestifilmaddactor', {notice});
		}
		else {
			notice = 'Udise ' + req.body.titleInput + ' ' + req.body.contentInput + 'salvestamine õnnestus!';
			res.render('addnews', {notice});
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