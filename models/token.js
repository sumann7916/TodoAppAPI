const mongoose = require("mongoose");

const TokenSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    token: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model("Token", TokenSchema); 

