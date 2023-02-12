const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const RefreshToken = require("../models/token")





//REGISTER USER
router.post("/register", async(req, res)=> {
    try {
        //Hashing password 
        const salt = await bcrypt.genSalt(10);
        const hashedpassword = await bcrypt.hash(req.body.password, salt);
        
        //Creating User object
        const newUser = new User({
            username : req.body.username,
            email : req.body.email,
            password: hashedpassword,
        });

        //Saving user and returning response
        const user = await newUser.save();
        res.status(200).json(user);
        
    } catch (error) {
        res.status(500).json(error);
    }
});


//LOGIN USER
router.post("/login", async (req, res) => {

    try {
        const user = await User.findOne({email: req.body.email})
        //if no user with that email
        if(!user){
            res.status(404).json("user not found")
        }
        //if user exists check for password
        if(user){
            const validpassword = await bcrypt.compare(req.body.password, user.password)
            if(validpassword){

                //create jwt
                const accessToken = jwt.sign(
                    {"userId": user._id },
                    process.env.ACCESS_TOKEN_SECRET,
                    {expiresIn: '30m'}
                );
                const refreshToken = jwt.sign(
                    {"userId": user._id },
                    process.env.REFRESH_TOKEN_SECRET,
                    {expiresIn: '1d'}
                );

                //Save refresh token to database

                const userRefreshToken = new RefreshToken({userId: user._id, token:refreshToken });
                userRefreshToken.save();
                res.cookie('jwt', refreshToken, {httpOnly:true, maxAge: 24 * 60 * 60 * 1000});
                res.json({ accessToken });
            }

            //if password does not match
            if(!validpassword){
                res.status(404).json("Invalid password")
            }
        }
    }
    catch(error) {
        res.status(500).json(error);
    }
  });




module.exports = router;