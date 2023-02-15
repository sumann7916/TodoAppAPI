const express = require("express");
const verifyJWT = require("../middleware/verifyJWT");
const Task = require("../models/task");
const mongoose = require("mongoose");
const router = express.Router();

//GET Tasks for user
router.get("/", verifyJWT, async(req, res) => {
    const user = req.user;
    try {
        const tasks = await Task.find({ "user": user })
            .sort({ order: 1 })
            .exec();
        if (!tasks) {
            return res.status(404).json({ message: "No tasks found" });
        }
        return res.status(200).json(tasks);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

//POST Tasks for user
router.post("/", verifyJWT, async (req, res) => {
    const { title } = req.body;
  
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      // Get value of the last value in the drag and drop table of todo section
      const maxOrder = await Task.find({ user: req.user, status: { $eq: "todo" } })
        .sort({ order: -1 })
        .limit(1)
        .select("order")
        .session(session);
  
      const order = maxOrder[0] ? maxOrder[0].order + 1 : 1;
  
      // Get user Id
      const user = req.user;
  
      // Status should be todo by default
      const status = "todo";
  
      const createdTask = new Task({
        title,
        status,
        order,
        user,
      });
  
      await createdTask.save({ session });
  
      await session.commitTransaction();
  
      return res.status(200).json({ createdTask });
    } catch (error) {
      await session.abortTransaction();
      console.log(error);
      return res.status(500).json("Error creating task");
    } finally {
      session.endSession();
    }
  });

//Reorder Cards using drag and drop
router.patch('/:taskId', verifyJWT, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
  
    try {
      const user = req.user;
      const task = await Task.findOne({ _id: req.params.taskId, user: user }).session(session);
  
      if (!task) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json("Task not found");
      }
  
      const oldOrder = task.order;
      const oldStatus = task.status;
      const { status, order } = req.body;
  
      if (oldStatus === status && oldOrder === order) {
        await session.commitTransaction();
        session.endSession();
        return res.status(200).json("No changes made");
      }
  
      await Task.updateMany(
        { user: user, status: oldStatus, order: { $gt: oldOrder } },
        { $inc: { order: -1 } }
      ).session(session);
  
      await Task.updateMany(
        { user: user, status: status, order: { $gte: order } },
        { $inc: { order: 1 } }
      ).session(session);
  
      await Task.findByIdAndUpdate(req.params.taskId, { $set: { status: status, order: order } }).session(session);
  
      await session.commitTransaction();
      session.endSession();
  
      return res.status(200).json("Updated Successfully");
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.log(error);
      return res.status(500).json("Internal server error");
    }
  });


//Delete Task
router.delete("/:taskId", verifyJWT, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
  
    try {
      const user = req.user;
  
      const task = await Task.findOne({ user: user, _id: req.params.taskId }).session(session);
      if (!task) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json("No task found");
      }
  
      await Task.updateMany(
        { user: user, status: task.status, order: { $gt: task.order } },
        { $inc: { order: -1 } }
      ).session(session);
  
      await Task.findOneAndDelete({ user: user, _id: req.params.taskId }).session(session);
  
      await session.commitTransaction();
      session.endSession();
  
      return res.status(200).json("Task Deleted Successfully");
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.log(error);
      return res.status(500).json("Internal server error");
    }
  });


module.exports = router;
