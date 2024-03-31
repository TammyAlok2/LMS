import mongoose from 'mongoose'

import { DB_NAME } from '../../contants.js';

const connectDB = async ()=>{

    try {
       const connectionInstance = await mongoose.connect(`mongodb+srv://aloktamrakar2:AlokTam1234@cluster0.s7lnxim.mongodb.net/${DB_NAME}`);
       console.log(`\n MongoDB connected !! DB HOST : ${connectionInstance.connection.host}`);
    } catch (error) {
        
        console.log("MONGODB connection error : ",error);
        process.exit(1);
    }
}

export default connectDB

