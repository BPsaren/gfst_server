const user1 = require('../models/user-models');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//*----------------------------*
//   Home page controller ? //   
//*----------------------------*
const home = async (req, res) => {
    try {
        res.status(200).send("Welcome to my controller home page");
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

//*---------------------------*
//  Registration controller   //
//*---------------------------*

const register = async (req, res) => {
    try {
        const { username, email, phone, password } = req.body;

        const userExists = await user1.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message:"This email already exists" });
        }

        const newUser = await user1.create({ 
            username, 
            email, 
            phone, 
            password 
        });

        res.status(201).json({ 
            message: "User registered successfully", 
            token: await newUser.generateToken(),
            userId: newUser._id.toString(),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}



//*---------------------------*
//   Login controller        //
//*---------------------------*
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const userExit = await user1.findOne({ email });

        if (!userExit) {
            return res.status(400).json({ message: "user does not exits" });
        }

        const isPasswordValid = await userExit.comparePassword(password);

        if (isPasswordValid) {
            console.log(userExit);  // Moved the console.log after userExit declaration
            res.status(200).json({
                msg: "Login successful",
                token: await userExit.generateToken(),
                userId: userExit._id.toString(),
            });
        } else {
            
            return res.status(401).json({ message: "Password not match" });
        }
    } catch (error) {
        console.log(error);
        //res.status(500).json({ msg: "Internal Server Error" });
        next(error);
    }
}


//*---------------------------*
//   user data get logic     //
//*---------------------------*
const user=async(req,res)=>{
    try {
        const user_data = req.user;
        console.log(user_data);
        res.status(200).json({user_data}); 
 
    } catch (error) {
        console.log(`error from the router: ${error}`);
    }
}


module.exports = { home, register, login ,user};


