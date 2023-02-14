const express = require("express");
const verifyJWT = require("../middleware/verifyJWT");
const Task = require("../models/task");
const router = express.Router();

//GET Tasks for user
router.get("/", verifyJWT, async(req, res)=>{
    let tasks;
    const user = req.user;
    try {
        tasks = await Task.find({"user": user})
        .sort({ order: 1 })
        .exec();
    }
    catch(error){
        console.log(error);
    }

    if(!tasks){
        return res.status(404).json("No tasks found")
    }
    return res.status(200).json(tasks);

});

//POST Tasks for user
router.post("/", verifyJWT, async(req,res)=>{

    const {title} = req.body;
    //Get value of the last value in the drag and drop table of todo section
    let maxOrder;
    try{    
    maxOrder = await Task.find({user: req.user, status:{$eq: "todo"} })
    .sort({order: -1})
    .limit(1)
    .select("order")
    .exec();
    }catch(error){
        console.log(error);
    }
    const order = maxOrder[0] ? maxOrder[0].order + 1 : 1;

    //Get user Id
    const user = req.user;


    //status should be todo by default
    const status = "todo";

    
    const createdTask = new Task({
        title,
        status,
        order,
        user

    })
    try {
        await createdTask.save();
    }catch(error){
        console.log(error)
    }

    return res.status(200).json({createdTask})


});

//Reorder Cards using drag and drop
router.patch('/:taskId', verifyJWT, async(req, res)=> {
    let task;
    //Get current status and order of the task 
    try{
        task = await Task.findOne({ "_id": req.params.taskId, "user": req.user });
    }
    catch(error){
        console.log(error)
    }

    if(!task)return res.status(404).json("Task not found");
    
    const oldOrder = task.order;
    const oldStatus = task.status;

    try {
        //Find all the task greater than its order number in its oldstatus and decrease it by 1
        await Task.updateMany({
            user: user,
            status: oldStatus,
            order : {$gt: oldOrder}
        }, { $inc: { order: -1 } });
    }
    catch(error){
        console.log(error);
    }
    //Now update the new row where the task was added
    const{status, order} = req.body;
    try {
        await Task.updateMany({
            user: user,
            status: status,
            order: {$gte: order}
        }, { $inc: { order: 1 } })

    }catch(error){
        console.log(error);
    }

    //Update the task which was drag and dropped
    try {
        await Task.findByIdAndUpdate(req.params.taskId, { $set: { "status": status, "order": order } });
    } catch (error) {
        console.log(error);
    }
    return res.status(200).json("Updated Successfully");
});


//Delete Task
router.delete("/:taskId", verifyJWT, async(req, res)=>{
    let task;
    const user =req.user;
    try {
        task = await Task.findOne({"user": user, "_id": req.params.taskId})

        //Find all the task greater than its order number in its status and decrease it by 1
        await Task.updateMany({
            user: user,
            status: task.status,
            order : {$gt: task.order}
        }, { $inc: { order: -1 } });

    }
    catch(error){
        console.log(error);
    }
    try {
        //Now Delete Task
        await Task.findOneAndDelete({"user": user, "_id": req.params.taskId})

    } catch (error) {
        console.log(error);
    }
    

    if(!task){
        return res.status(404).json("No task found")
    }
    return res.status(200).json("Task Deleted Successfully");

});


module.exports = router;
