const express = require("express");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const router = express.Router();


//update Users
router.put("/:id", async(req, res)=>{
    if (req.body.userId === req.params.id) {

        //If user wants to update password
        if(req.body.password) {
            try {
            //Hashing password 
            const salt = await bcrypt.genSalt(10);
            req.body.password = await bcrypt.hash(req.body.password, salt);

            } catch (error) {
                return res.status(500).json(error);
            }
        }
        try {
            const user = await User.findByIdAndUpdate(req.params.id, {$set:req.body});
            res.status(200).json("Account has been updated");

        } catch (error) {
            return res.status(500).json(error);
        }

    } else{
        return res.status(403).json("You can update only your account");
    }
    
}
);

//delete user

router.delete("/:id", async(req, res)=>{
    if (req.body.userId === req.params.id || req.body.isAdmin) {

        try {
            const user = await User.findByIdAndDelete(req.params.id);
            res.status(200).json("Account has been deleted");

        } catch (error) {
            return res.status(500).json(error);
        }

    } else{
        return res.status(403).json("You can only delete your account");
    }
    
}
);

//get a user
router.get("/:id", async(req, res)=>{
    try {
        const user = await User.findById(req.params.id);
        //Do not send password
        const{password, ...other} = user._doc;

        
        res.status(200).json(other);
    } catch (error) {
        return res.status(500).json(error)
    }
});


module.exports = router;

