
import { GraphQLError } from "graphql";
import bcrypt from "bcrypt"
import { User } from "../../models/userModel";
import {hashPassword} from "../../utils/hashPassowrd"
import {generateAccessToken,generateRefreshToken,verifyRefreshToken} from "../././../utils/token"

export const userResolvers = {

  Mutation:{
    register:async (_:any,args:{name:String,email:String,password:string})=>{
      const {name,email,password}=args
      if(!name||!email||!password){
        throw new GraphQLError("All fields are required")
      }
      try{
      const user=await User.findOne({email})
      if(user){
        throw new GraphQLError("User already exist")
      }
      // hash user password
      const hashedPassword=await hashPassword(password)
    // create new user
      const newUser=await User.create({
                                    name,
                                    email,
                                    password:hashedPassword
                                  })

      return "User created"

      }
      catch(error:any){
        throw new GraphQLError(error)

      }
    },

    login:async(_:any,args:any,context:any)=>{
      const {email,password}=args
      if(!email||!password){
        throw new GraphQLError("All fields are required")
      }
      const user=await User.findOne({email})
      if(!user){
        throw new GraphQLError("Invalid Credentials")
      }
// check password match
    const  isPassMatch=await bcrypt.compare(password,user.password.toString())
    if(!isPassMatch){
      throw new GraphQLError("Invalid Credentials")
    }
    // generat token 
    try{
      // get token
      const accessToken=generateAccessToken(user._id.toString(),user.email.toString())
      const refreshToken=generateRefreshToken(user._id.toString(),user.email.toString())
  // cookie for access token
      context.res.cookie("access-token",accessToken,{
        httpOnly:true,
        secure:true,
        sameSite:"strict",
        maxAge:15*60*1000
      })

      // set refresh token 
      context.res.cookie("refresh-token",refreshToken,{
          httpOnly:true,
          secure:true,
          sameSite:"strict",
          maxAge:7*24*60*60*1000
      })

      // context.res.setHeader("refresh-token",refreshToken)
      return {token:refreshToken,id:user._id.toString()}

    }catch(error:any){
       throw new GraphQLError(error)
    }

    },

    refreshAccessToken:(_:any,__:any,context:any)=>
      {
        const refreshToken=context.req.cookies['refresh-token']
        console.log(refreshToken,"Refresh token")
    
        if(!refreshToken){
          throw new GraphQLError("Please login first")
        }

        try {
          const verifyAccess=verifyRefreshToken(refreshToken)
          const accessToken=generateAccessToken(verifyAccess.id,verifyAccess.email.toString())

                context.res.cookie("access-token",accessToken,{
                        httpOnly:true,
                        secure:true,
                        sameSite:"strict",
                        maxAge:15*60*1000
                      })
                    
                      return "Access Token updated"
          
          
        } catch (error:any) {
          throw new GraphQLError(error)
        }


    }


  }
};
