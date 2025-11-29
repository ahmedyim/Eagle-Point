import { config } from "dotenv";
import express  from "express";
import { graphqlHTTP } from "express-graphql";
import cookieParser from "cookie-parser";
import {schema} from "./graphql/schema"
import { authMiddleware } from "./middleware/authMiddleware";
import type { AuthRequest } from "./middleware/authMiddleware";
import { DB_Conect } from "./config/db.config";
import { rateLimitMiddleware } from "./middleware/rateLimitMiddleware";
config()

const app=express()

app.use(express.json())
app.use(cookieParser())
app.use(authMiddleware)
app.use(rateLimitMiddleware)

const PORT=process.env.PORT||4000

app.use("/graphql",graphqlHTTP((req,res)=>({
    schema,
    graphiql:true,
     context: { user: (req as AuthRequest).user,req,res },
     customFormatErrorFn:(err)=>{
        return {message:err.message}
     }
})))


app.listen(PORT,async()=>{
   await DB_Conect()
    console.log(`App run on port ${PORT}`)
})
