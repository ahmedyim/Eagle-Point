import { password } from "bun"
import * as mongoose from "mongoose"
// define useer type
interface IUser extends mongoose.Document{
    name:String;
    email:String;
    password:String
}

// creat user Schema
const userSchema:mongoose.Schema<IUser>=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        minlength:4
    }
})

export const User:mongoose.Model<IUser>=mongoose.model<IUser>("User",userSchema)
