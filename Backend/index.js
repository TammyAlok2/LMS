import express from 'express'
import app from './app.js'
import connectDB from './src/db/index.js';
const PORT = process.env.PORT || 3000;




app.get('/',(req,res)=>{
    res.json({message:'welcome to the LMS '})
})

connectDB()

app.listen(PORT,()=>{
    console.log("app is listeing in ",PORT)
})
