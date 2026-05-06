import { config } from "dotenv"
import mongoose from "mongoose"

 export const dbConnetion =   async () => {
    try {
     await   mongoose.connect(process.env.MONGODB_URI )
     console.log("database is connected ");
     
    } catch (error) {
        console.log("database connection failed")
    }
}