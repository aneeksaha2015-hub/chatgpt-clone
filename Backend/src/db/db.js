const mongoose = require('mongoose')

async function connectDB() {
    try{
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("MONGODB connected successfully!")
    } catch(error){
        console.error("Error in connected to MONGODB:",error)
    }
}

module.exports = connectDB;