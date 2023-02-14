const express = require("express");
const Token = require("../models/token");
const jwt = require("jsonwebtoken");
const router = express.Router();



router.get("/", async(req, res)=> {
    let foundToken;
    const cookies = req.cookies;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if(!cookies?.jwt) return res.sendStatus(401);
    const refreshToken = cookies.jwt;

    //Make Sure Refresh Token has not crossed 1 day
    foundToken = await Token.findOne({"token": refreshToken, createdAt: { $gte: yesterday }});
    if(!foundToken) return res.sendStatus(403); //Forbidden
    
    //evaluate jwt
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded)=>{
            if(err || foundToken.userId != decoded.userId) return res.sendStatus(403);
            const accessToken = jwt.sign(
                {"userId": decoded.userId},
                process.env.ACCESS_TOKEN_SECRET,
                {expiresIn: '30m'}
            ); 
            res.status(200).json(accessToken); 
        }
        
    )
    


});

module.exports = router;