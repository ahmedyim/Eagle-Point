import bcrypt from "bcrypt"
import { GraphQLError } from "graphql/error"

export async function hashPassword(password:string):Promise<string>{
if(!password){
    throw new GraphQLError("Password is required")
}
const hashedPassword=await bcrypt.hash(password,10)
return hashedPassword
}