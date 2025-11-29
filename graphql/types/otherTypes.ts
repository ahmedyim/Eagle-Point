export const otherTypes=`
type UrlResponse {
contentType:String
data:JSON
text:String!
}

type Query {
textAnalayzer(text:String!):TextAnalysis!
fetchData(url:String!,maxRetries:Int!):UrlResponse!
}


type TextAnalysis{

    word_count:Int!
    average_word_length:Float!
    longest_words:[String]
    word_frequency:JSON

}

`
