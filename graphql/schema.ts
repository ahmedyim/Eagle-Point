import {makeExecutableSchema} from "@graphql-tools/schema"
import { mergeTypeDefs,mergeResolvers } from "@graphql-tools/merge"
import {userTypeDefs} from "./types/userTypes"
import { otherTypes } from "./types/otherTypes"
import { userResolvers } from "./resolvers/userResolver"
import { otherResolvers } from "./resolvers/otherResolvers"

const mergedTypes=mergeTypeDefs([userTypeDefs,otherTypes])
const mergedResolvers=mergeResolvers([userResolvers,otherResolvers])

export const schema=makeExecutableSchema({
    typeDefs:mergedTypes,
    resolvers:mergedResolvers
})