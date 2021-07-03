var mongoose=require("mongoose");
var passportLocalMongoose=require("passport-local-mongoose");

var userSchema1=new mongoose.Schema({
  username:String,
  password:String,
  place:String,
  profile:String
});

userSchema1.plugin(passportLocalMongoose);

module.exports=mongoose.model("User",userSchema1);
