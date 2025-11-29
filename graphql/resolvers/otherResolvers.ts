import { GraphQLError } from "graphql/error"
import {isUrlLive} from "@the-node-forge/url-validator"
import {validateUrl}  from "@the-node-forge/url-validator"
import axios from "axios"
interface UrlResponseType{
        contentType:string|undefined
        data:JSON
        text:string
}

interface TextAn{
     word_count:number
    average_word_length:number
    longest_words:string[]
    word_frequency:Record<string,number>
}

const getUrlData=async(url:string,maxRetries:number):Promise<UrlResponseType|undefined>=>{
  let attempt=0
               while(attempt<maxRetries){
                  try {

                            const response=await axios.get(url)
                            const data= response.data
                            return {contentType:response.headers["content-type"]?.toString(),data:data,text:response.statusText}
                        } 
                catch (error:any) {
                        attempt++
                        if(attempt>=maxRetries)
                        throw new GraphQLError(`Filed to fetch data from ${url} after ${maxRetries} attempts. Error ${error}`)
                      await new Promise(res=>setTimeout(res,1000))


                    }
                }


}

function textDetail(text:string):TextAn{
            const words=text.match(/\b\w+\b/g)||[]
            const lowerText=text.toLowerCase().match(/\b\w+\b/g)||[]
            // find unique words means Case sensive
            const uniqueWords=Array.from(new Set(words))
            const wordsCount=uniqueWords.length
            const totalLength=uniqueWords.reduce((sum,word)=>sum+word.length,0)
            const average_word_length=totalLength/wordsCount

            // get longest words
            let maxLength=0
            const longestWords=new Set<string>()
            for (const word of words){
                // check if current word is greater than max len
                if(word.length>maxLength){
                    longestWords.clear()
                    maxLength=word.length
                    longestWords.add(word)
                    }
                else if(word.length===maxLength) longestWords.add(word)
             }
            //word frequncy
            const word_frequency:Record<string,number>={}
            for(const word of lowerText){
                word_frequency[word]=(word_frequency[word]||0)+1
            }
        const longestArray:string[]=Array.from(longestWords)
    return {word_count:wordsCount,average_word_length:Number(average_word_length.toFixed(2)),longest_words:longestArray,word_frequency}
}

interface getDataInput{
    url:string,
    maxRetries:number
}

export const otherResolvers={
    Query:{

        textAnalayzer:(_:any,{text}:{text:string},context:any)=>{
         const {user}=context 
            if(!user){
                throw new GraphQLError("Please login first or get new Access token by mutation of refreshAccess Token")
            }

          if(!text){
            throw new GraphQLError("Text is required")
          }

          const analyzedText=textDetail(text)

          return analyzedText

        },

        fetchData:async(_:any,args:getDataInput,context:any)=>{
            const {user}=context 
            // console.log(args)
            const {url,maxRetries}=args
            
            if(!user){
                throw new GraphQLError("Please login first or get new Access token by mutation of refreshAccess Token")
            }
            // check if url is valid
           if(!validateUrl(url)){
            throw new GraphQLError("Please use valid url")
               }
             try{
                        // call getUrlData  to fetch data
                            const fetchedData=getUrlData(url,maxRetries)
                            return fetchedData
                        } 
                        catch (error:any) {
                           
                        throw new GraphQLError(`Filed to fetch data from ${url} after ${maxRetries} attempts. Error ${error}`)
                    

                    }

               
          
        },


    },
   
}