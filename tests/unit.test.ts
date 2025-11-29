import { expect,describe, test,vi ,beforeAll} from "bun:test";
import * as hashUtils from "../utils/hashPassowrd"
import bcrypt from "bcrypt"
import { userResolvers } from "../graphql/resolvers/userResolver";
import { otherResolvers } from "../graphql/resolvers/otherResolvers";
import { GraphQLError } from "graphql";

let Password="Test@123"
vi.spyOn(hashUtils,"hashPassword").mockImplementation(async(password):Promise<string>=>{
    const hashedPass=await bcrypt.hash(password,10)
    return hashedPass
})
// mock mongoose method find and create
const mockFindOne=vi.fn()
const mockCreate=vi.fn()

// get the mock path
vi.mock("../models/userModel",()=>({
    User:{
        findOne:mockFindOne,
        create:mockCreate
    }
})
)
beforeAll(()=>{
    mockFindOne.mockReset(),
    mockCreate.mockReset()
})




describe("Auth Password",()=>{

    test("Create User successfully",async()=>{
        // before creating check user in database and must be null And treat as user not exist
        const args={name:"name",
           email:"test@gmail.com",
           password:"hash-pass"}

        const result=await userResolvers.Mutation.register(null,args)
        expect(result).toBe("User created")
    })

    test("Register throw error if user already exist ",async()=>{
        mockFindOne.mockResolvedValue({_id:"123",email:"test@gmail.com"})
           try {
                await userResolvers.Mutation.register(null, { name: "Test", email: "a@b.com", password: "123456" });
                throw new Error("Test should have thrown"); // force fail if no error
                } 
        catch (error: any) {
                expect(error).toBeInstanceOf(GraphQLError);
                expect(error.message).toBe("User already exist");
                }
        })

// login test
        test("user login success with correct credential",async()=>{
            const context={res:{cookie:vi.fn()}}
            const password="Test123"
            // mock user find
            mockFindOne.mockResolvedValue({_id:"123",email:"test@getMaxListeners.com",password:await bcrypt.hash(password,10)})
           const args={email:"test@gmail.com",password}
           const result=await userResolvers.Mutation.login(null,args,context)
           expect(result.token)
            expect(context.res.cookie).toHaveBeenCalled();
        })

        // Invalid credentials

        test("Login with invalid credentials",async()=>{
            const context={res:{cookie:vi.fn()}}
            const password="Test123"
            // mock user find
            mockFindOne.mockResolvedValue({_id:"123",email:"test@getMaxListeners.com",password:await bcrypt.hash(password,10)})
           const args={email:"test@gmail.com",password:"123Test"}
            try {
           const result=await userResolvers.Mutation.login(null,args,context)
                throw new Error("Test should have thrown"); // force fail if no error
              } 
        catch (error: any) {
                expect(error).toBeInstanceOf(GraphQLError);
                expect(error.message).toBe("Invalid Credentials");
                }

        })

        test("hashPassword shoud hash the password ",async()=>{
            const hashPass=await hashUtils.hashPassword(Password)
            expect(hashPass).not.toBe(Password)
            expect(hashPass.length).toBeGreaterThan(20)
        })

        // Test Passowrd was hashed or not and compair it 
         test("Verify HashPassword  This must compiar hashpassowrd and plain password",async()=>{
            const hashedPass=await  hashUtils.hashPassword("Test@123")
           const isValid=await bcrypt.compare("Test@123",hashedPass)
           const isWrong=await bcrypt.compare("Test12",hashedPass)
           expect(isValid).toBe(true)
           expect(isWrong).toBe(false)
        })

        
})


describe("Text Analyzer",()=>{
    test("analyzeText returns result for authorized user",()=>{
        const context={user:{id:"1234"}}
        const args={text:"Hello, world"}
        const result= otherResolvers.Query.textAnalayzer(null,args,context)
        expect(result).toEqual({
            word_count:2,
            word_frequency:{"hello":1,"world":1},
            average_word_length:5,
            longest_words:["Hello","world"]
        })
    })


    test("Fetching data with valid and live url",async()=>{
        const context={user:{id:"1234"}}
        const args={url:"https://jsonplaceholder.typicode.com/comments",maxRetries:2}
        const result=otherResolvers.Query.fetchData(null,args,context)
        expect(result).resolves.toBeDefined()
    })

     test("Fetching data with inValid url",async()=>{
        const context={user:{id:"1234"}}
        const args={url:"https://jsonplaceholder.typicode.com/c",maxRetries:2}
        const result=otherResolvers.Query.fetchData(null,args,context)
        expect(result).rejects.toThrow()
    })

})
