//Import packages
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");


dotenv.config();

//Importing routers
const userRoute = require("./routes/user-routes");
const authRoute = require("./routes/auth-routes");
const taskRoute = require("./routes/task-routes");
const refreshRoute = require("./routes/refresh-routes");

//Connecting to database
mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGO_URL, {useNewUrlParser: true, useUnifiedTopology: true}, ()=> {
    console.log("Database is Connected");
} );


//middleware
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));
app.use(cookieParser());


// Defining Routes 
app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/task", taskRoute);
app.use("/api/refresh", refreshRoute);

//Listening at port 8000
app.listen(8800, ()=>{
    console.log("Server is Running");
})