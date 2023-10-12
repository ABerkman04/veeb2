const express = require('express');
const app = express();

app.get('/test', (req, res)=>{
	res.send("Test on edukas")
});

app.listen(5204);
