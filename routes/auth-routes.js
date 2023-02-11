const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");




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
        if(!user){
            res.status(404).json("user not found")
        }
        if(user){
            const validpassword = await bcrypt.compare(req.body.password, user.password)
            if(validpassword){
                res.json(user)
            }
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