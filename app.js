var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const db = require('./config/config').get(process.env.NODE_ENV);
const mongoose=  require('mongoose');
const User = require('./models/User');
const Avocat = require('./models/Avocat');
const {auth} = require('./middlewares/auth');
var logger = require('morgan');
const nodemailer = require('nodemailer');
var cors = require('cors');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(cors({origin: 'http://localhost:3001'}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var trasporter = nodemailer.createTransport({
  service:'gmail',
  auth:{
      user:db.user,
      pass: db.pass
  }
});

// Connect to DB
mongoose.Promise = global.Promise;
mongoose.connect(db.DATABASE,{useNewUrlParser: true,useUnifiedTopology:true },(err)=>{
    if(err) console.log(err);
    console.log("Success connect to Mongoo");
});


// adding new user (sign-up route)
app.post('/Register',function(req,res){
    // taking a user
   // console.log(req.body);
    const newuser=new User(req.body);
    console.log(newuser);
 
    if(newuser.password!=newuser.password2)return res.status(400).json({message: "password not match"});
    
    User.findOne({email:newuser.email},function(err,user){
        if(user) return res.status(400).json({ auth : false, message :"email exits"});
 
        newuser.save((err,doc)=>{
            if(err) {console.log(err);
                return res.status(400).json({ success : false});}

          
            res.status(200).json({
                succes:true,
                user : doc
            });
            var mailOptions = {
                from: 'beoriginalbynofake@gmail.com',
                to: newuser.email,
                subject: "Welcome to BeOriginal",
                text: "Test mail"
            };
            trasporter.sendMail(mailOptions,function(err,info){
                if(err){
                    console.log(err);
                }else{
                    console.log('Email was sent: '+ info.response);
                }
            })
        });
    });
 });
 
 
 // login user
 app.post('/Login', function(req,res){
     let token=req.cookies.auth;
     let token_avocat = req.cookies.auth;

     User.findByToken(token,(err,user)=>{
         if(err) return  res(err);
         if(user) return res.status(400).json({
             error :true,
             message:"You are already logged in"
         }); 
         else{
             User.findOne({'email':req.body.email},function(err,user){
                 if(!user) return res.status(400).send(err);
                 user.comparepassword(req.body.password,(err,isMatch)=>{
                     if(!isMatch) return res.status(400).send(err);
         
                 user.generateToken((err,user)=>{
                     if(err) return res.status(400).send(err);
                     res.cookie('auth',user.token).json({
                         isAuth : true,
                         id : user._id,
                         email : user.email
                     });
                   
                 });    
             });
           });
         }
     });

     
 });
 
 //logout user
  app.get('/Logout',auth,function(req,res){
         req.user.deleteToken(req.token,(err,user)=>{
             if(err) return res.status(400).send(err);
             res.sendStatus(200);
             
         });
 
     }); 











// adding new user (sign-up route)
app.post('/Register-Avocat',function(req,res){
  // taking a user
 // console.log(req.body);
  const newuser=new Avocat(req.body);
  console.log(newuser);

  if(newuser.password!=newuser.password2)return res.status(400).json({message: "password not match"});
  
  User.findOne({email:newuser.email},function(err,user){
      if(user) return res.status(400).json({ auth : false, message :"email exits"});

      newuser.save((err,doc)=>{
          if(err) {console.log(err);
              return res.status(400).json({ success : false});}

        
          res.status(200).json({
              succes:true,
              user : doc
          });
          var mailOptions = {
              from: 'beoriginalbynofake@gmail.com',
              to: newuser.email,
              subject: "Welcome to BeOriginal",
              text: "Test mail"
          };
          trasporter.sendMail(mailOptions,function(err,info){
              if(err){
                  console.log(err);
              }else{
                  console.log('Email was sent: '+ info.response);
              }
          })
      });
  });
});

// login user
app.post('/Login-Avocat', function(req,res){
  let token=req.cookies.auth;
  let token_avocat = req.cookies.auth;
  Avocat.findByToken(token,(err,avocat)=>{
      if(err) return  res(err);
      if(avocat) return res.status(400).json({
          error :true,
          message:"You are already logged in"
      }); 
      else{
        Avocat.findOne({'email':req.body.email},function(err,avocat){
              if(!avocat) return res.status(400).send(err);
              avocat.comparepassword(req.body.password,(err,isMatch)=>{
                  if(!isMatch) return res.status(400).send(err);
      
                  avocat.generateToken((err,avocat)=>{
                  if(err) return res.status(400).send(err);
                  res.cookie('auth',avocat.token).json({
                      isAuth : true,
                      id : avocat._id,
                      email : avocat.email
                  });
                
              });    
          });
        });
      }
  });

  
});

//logout user
app.get('/Logout',auth,function(req,res){
       req.user.deleteToken(req.token,(err,user)=>{
           if(err) return res.status(400).send(err);
           res.sendStatus(200);
           
       });

   }); 


app.get('/Get-users', (req,res)=>{
  var MongoClient = require('mongodb').MongoClient;
  var url = db.DATABASE;

  MongoClient.connect(url,function(err,db){
    if(err) throw err;
    var dbo = db.db("myFirstDatabase");

    dbo.collection('users').find({}).toArray(function(err,result){
      if(err) throw err;
      console.log(result);
      res.status(200).send(result);
      db.close();
    })
  });
});


app.post('/User-info', (req,res)=>{
    var MongoClient = require('mongodb').MongoClient;
    var url = db.DATABASE;

    MongoClient.connect(url, function(err,db){
        if(err) throw err;
        var dbo = db.db('myFirstDatabase');

        var email =req.body.email
        console.log(email);
       // var email  = "test@gmail.com"
        dbo.collection('users').find({email:email}).toArray(function(err,result){
            if(err) throw err;
            console.log(result);

            let listaValori = [];
            let valoareNume = result[0]["nume"];
            let valoarePrenume = result[0]["prenume"];
            let valoareEmail = result[0]["email"];
            let valoareSerieCI = result[0]["SerieCI"];
            let valoareNumarCI = result[0]["NumarCI"];
            let valoareOras = result[0]["Oras"];
            let valoareStrada = result[0]["Strada"];
            let valoareBloc = result[0]["Bloc"];
            let valoareScara = result[0]["Scara"];
            let valoareApartament = result[0]["Apartament"];
            let valoareJudet = result[0]["Judet"];

            
            listaValori.push(valoareNume,valoarePrenume,valoareEmail,valoareSerieCI,valoareNumarCI,
                valoareOras, valoareStrada,valoareBloc,valoareScara,valoareApartament,valoareJudet );

            console.log(listaValori);    
            res.status(200).json(listaValori).send();
            res.end(listaValori);
            db.close();
      })
    })
})


module.exports = app;
