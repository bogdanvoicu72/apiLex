var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const db = require('./config/config').get(process.env.NODE_ENV);
const mongoose=  require('mongoose');
const User = require('./models/User');
const {auth} = require('./middlewares/auth');
var logger = require('morgan');
const nodemailer = require('nodemailer');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

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

module.exports = app;
