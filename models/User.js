var mongoose=require('mongoose');
const jwt=require('jsonwebtoken');
const bcrypt=require('bcrypt');
const confiq=require('../config/config').get(process.env.NODE_ENV);
const salt=10;


const usersSchema = new mongoose.Schema({
    nume:{
        type:String,
        required: true,
    },
    prenume:{
        type:String,
        required: true,
    },
    email:{
        type:String,
        required: true,
    },
    password:{
        type:String,
        required: true,
    },
    password2:{
        type:String,
        required: true,
    },
    CNP:{
        type: String,
        required: true,
    },
    SerieCI:{
        type: String,
        required: true,
    },
    NumarCI:{
        type: String,
        required: true,
    },
    Oras:{
        type: String,
        required: true,
    },
    Strada:{
        type: String,
        required: true,
    },
    Numar:{
        type: String,
        required: true,
    },
    Scara:{
        type: String,
        required: true,
    },
    Bloc:{
        type: String,
        required: true,
    },
    Apartament:{
        type: String,
        required: true,
    },
    Judet:{
        type: String,
        required: true,
    },
});
// to signup a user
usersSchema.pre('save',function(next){
    var user=this;
    
    if(user.isModified('password')){
        bcrypt.genSalt(salt,function(err,salt){
            if(err)return next(err);

            bcrypt.hash(user.password,salt,function(err,hash){
                if(err) return next(err);
                user.password=hash;
                user.password2=hash;
                next();
            })

        })
    }
    else{
        next();
    }
});

//to login
usersSchema.methods.comparepassword=function(password,cb){
    bcrypt.compare(password,this.password,function(err,isMatch){
        if(err) return cb(next);
        cb(null,isMatch);
    });
}

// generate token

usersSchema.methods.generateToken=function(cb){
    var user =this;
    var token=jwt.sign(user._id.toHexString(),confiq.SECRET);

    user.token=token;
    user.save(function(err,user){
        if(err) return cb(err);
        cb(null,user);
    })
}

// find by token
usersSchema.statics.findByToken=function(token,cb){
    var user=this;

    jwt.verify(token,confiq.SECRET,function(err,decode){
        user.findOne({"_id": decode, "token":token},function(err,user){
            if(err) return cb(err);
            cb(null,user);
        })
    })
};

//delete token

usersSchema.methods.deleteToken=function(token,cb){
    var user=this;

    user.update({$unset : {token :1}},function(err,user){
        if(err) return cb(err);
        cb(null,user);
    })
}


module.exports=mongoose.model('User',usersSchema);