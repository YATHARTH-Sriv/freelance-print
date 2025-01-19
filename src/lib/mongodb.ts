import mongoose from "mongoose";

type connectiontype={
    isConnected?:number
}

const connection:connectiontype={}

async function dbconnect():Promise<void>{
      if(connection.isConnected){
        console.log("db connection already exists")
        return
      }
      try {
        const db=await mongoose.connect(`${process.env.DB_URL}/${process.env.DB_NAME}`)
        connection.isConnected=db.connections[0].readyState
        console.log("db connected")
      } catch (error) {
        console.log(error)
       
      }
}

export default dbconnect