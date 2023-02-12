//Import packages
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");


dotenv.config();

//Importing routers
const userRoute = require("./routes/user-routes");
const authRoute = require("./routes/auth-routes");
const taskRoute = require("./routes/task-routes");

//Connecting to database
mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGO_URL, {useNewUrlParser: true, useUnifiedTopology: true}, ()=> {
    console.log("Database is Connected");
} );


//middleware
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));


// Defining Routes 
app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/task", taskRoute);

//Listening at port 8000
app.listen(8800, ()=>{
    console.log("Server is Running");
})