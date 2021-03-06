 /******************************************************
 * PLEASE DO NOT EDIT THIS FILE
 * the verification process may break
 * ***************************************************/

'use strict';

var fs = require('fs');
//var param = require('param')
var express = require('express');
var app = express();

if (!process.env.DISABLE_XORIGIN) {
  app.use(function(req, res, next) {
    var allowedOrigins = ['https://narrow-plane.gomix.me', 'https://www.freecodecamp.com'];
    var origin = req.headers.origin || '*';
    if(!process.env.XORIG_RESTRICT || allowedOrigins.indexOf(origin) > -1){
         console.log(origin);
         res.setHeader('Access-Control-Allow-Origin', origin);
         res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    }
    next();
  });
}

app.use('/public', express.static(process.cwd() + '/public'));

app.route('/_api/package.json')
  .get(function(req, res, next) {
    console.log('requested');
    fs.readFile(__dirname + '/package.json', function(err, data) {
      if(err) return next(err);
      res.type('txt').send(data.toString());
    });
  });
var saveUrls = {};  
  
function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}

app.route('/')
    .get(function(req, res) {
		  res.sendFile(process.cwd() + '/views/index.html');
    });


app.use('/new',(req,res)=>{
      let origin = req.get('host');
      let url = req.url.slice(1);
      if(url.indexOf('.')===-1)
        res.end('Wrong Url');
      else{

        if(saveUrls[url]==undefined){
          saveUrls[url] = Math.ceil(Math.random()*1000).toString();
        }
        let s = "http" + (req.socket.encrypted ? "s" : "") + "://"+ origin+'/'+saveUrls[url];
        res.send(`<h1>Url is already exist</h1> Please use: <a href ="${s}">${s}</a> to access it`);        
      }
    });

// Respond not found to all the wrong routes
app.use(function(req, res, next){
  console.log('here');
  let sUrl = req.url.slice(1);   
  let rUrl = getKeyByValue(saveUrls,sUrl);
  console.log(sUrl,rUrl);
  if(rUrl!=undefined){
    console.log('1',rUrl)
    let s = /http/.test(rUrl.toLowerCase()) ? rUrl : `http://${rUrl}`;     
    console.log(s);
    res.redirect(s);
    return;        
  }
  res.status(404);
  res.type('txt').send('Not found');
});

// Error Middleware
app.use(function(err, req, res, next) {
  if(err) {
    res.status(err.status || 500)
      .type('txt')
      .send(err.message || 'SERVER ERROR');
  }  
})

app.listen(3000, function () {
  console.log('Node.js listening ...');
});

