const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
    title : {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["todo", "in progress", "testing", "done"],
        default: "todo"
    },
    order: {
        type: Number
    },
    user: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
        }

});
module.exports = mongoose.model("Task", TaskSchema); 
