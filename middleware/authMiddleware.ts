import type{ Request,Response,NextFunction } from "express";
import { GraphQLError } from "graphql";
import jwt  from "jsonwebtoken";
const ACCESS_TOKEN_SECRET=process.env.ACCESS_TOKEN_SECRET||"secret"

// add user  in payload
export interface AuthRequest extends Request{
    user?:{id:string}
}

export function authMiddleware(req:AuthRequest,res:Response,next:NextFunction){
    const accessToken=req.cookies["access-token"]
if(!accessToken) return next()
    try {
// check access token 
const payload=jwt.verify(accessToken,ACCESS_TOKEN_SECRET) as {id:string}
    req.user={id:payload.id}
 
    } catch (error:any) {
        // if failed thow  new error
      throw new GraphQLError(error) 
    }
        next()

}

