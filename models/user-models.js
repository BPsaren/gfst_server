const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


const userSchema = new mongoose.Schema({
    username:{type: String,required: true},
    email:{type: String,required: true },
    phone:{type: String,required:true,},
    password:{type: String,required: true,},
    asAdmin:{type: Boolean,default: true,},
})

// for hashing password
userSchema.pre('save', async function(next){
   //console.log("pre method", this);
   const user= this;
  
   if(!user.isModified("password")){
    next();
   }
   try{

const saltRound = await bcrypt.genSalt(10);
const hash_password = await bcrypt.hash(user.password, saltRound);
user.password = hash_password;
   }catch(error){
     next(error);
   }
});

userSchema.methods.generateToken = async function(){
     try{
         return jwt.sign(
            {
            userId: this._id.toString(),
            email: this.email,
            asAdmin:this.asAdmin,
         },
         process.env.JWT_SECRET_KEY,
        {
        expiresIn:"60d", // 1 year in s
          }
         );
      }catch(error){

        console.log("Error");
     }  
};





///log in logic for userSchema
userSchema.methods.comparePassword = async function(password){
  return bcrypt.compare(password,this.password);
}

const user1 = new mongoose.model("user1",userSchema);

module.exports = user1;


