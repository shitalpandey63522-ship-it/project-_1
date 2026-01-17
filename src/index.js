import dotenv from "dotenv";


 
import connectDB from   "./db/index.js";

dotenv.config({
    path: './env'
});
  








connectDB();





/*
import express from "express";
const app=express();
(async () => {
    try{
      await  mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        
        console.log("database connected successfully");
        app.on("error", (err) => {
            console.log("error while connecting to db", err);
            throw err;
        }); 
        app.listen   ( process.env.PORT , () => {
            console.log(`server is running on port ${process.env.PORT `}`);
        });

    }
    catch(error){
        console.log("error while connecting to db",error);      
        throw error;

    }
})()
  

*/