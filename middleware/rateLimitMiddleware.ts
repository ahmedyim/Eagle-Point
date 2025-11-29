import type {Response,NextFunction } from "express"
import type{ AuthRequest } from "./authMiddleware"
import { GraphQLError } from "graphql/error"
interface UserRateLimit{
    count:number,
    firstRequest:number  // timestamp for user request 
}
const userRequests=new Map<string,UserRateLimit>()  // userId as key

const RATE_LIMIT=5
const WINDOW_TIME=60_000
export function rateLimitMiddleware(req:AuthRequest,res:Response,next:NextFunction){
            const userId=req.user?.id
            const now=Date.now()  // current time user request
            const entry:UserRateLimit|undefined=userRequests.get(userId??"")
            // user have not request before
            if(!entry)
            {
                userRequests.set(userId??"default",{count:1,firstRequest:now})
                return next()
            }
            const {count,firstRequest}=entry
            if(now-firstRequest<WINDOW_TIME){
                if(count>=RATE_LIMIT){
                    // throw new GraphQLError("Rate limit exceeded. Tyr again later")
                    return res.status(429).json({error:"Rate limit exceeded. Tyr again later"})
                }
                else{
                    //increment if not exceeded limit
                    entry.count++
                    userRequests.set(userId??"default",entry)
                    return next()
                }
            }
            else{
                // reset time window
                userRequests.set(userId??"default",{count:1,firstRequest:now})
                return next()
            }


}