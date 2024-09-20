
const { getDb } = require("../config/config")
const { ObjectId } = require('mongodb')
const { addPosting, addCommentUser, addLike, getPostByIdUser, getAllPost } = require("../models")

const postTypeDefs = `#graphql

type comment{
    content: String!
    username: String!
    createdAt: String
    updatedAt: String
}

type likeComment{
    username: String
    createdAt: String
    updatedAt: String
}

type Post{
content: String
tags: [String]
imgUrl: String
authorId: String
comment: [comment]
like: [likeComment]
createdAt: String
updatedAt: String
}

type SuccesPost{
    message: String
}

type totalLike{
    total: Int
}

type Query{
    Post: [Post],
    showLike: totalLike
    getPostById(_id:String): Post
    getPostAll:[Post]
}



type Mutation{
    addPost(content:String!, tags:[String],imgUrl:String,authorId:ID!): SuccesPost
    addComment(id:String,content:String!, username:String!):SuccesPost
    likePost(id:String,username:String!):SuccesPost
}
`

const postResolvers = {
    Query: {
        Post: async (_, __, context) => {
            context.authentication()
            const db = await getDb()
            const post = await db.collection('post').find().toArray()
            return post
        },
        getPostById: async (_, args,) => {
            const { _id } = args
            const getPostById = await getPostByIdUser(_id)
            return getPostById
        },
        getPostAll: async () => {
            const getPostAll = await getAllPost()
            console.log(getPostAll, 'sss');
            return getPostAll
        }
    },
    Mutation: {
        addPost: async (_, args, context) => {
            context.authentication()
            const { content, tags, imgUrl, authorId } = args
            const id = new ObjectId(authorId)
            const data = {
                content, tags, imgUrl, authorId: id, comment: [], like: [], createdAt: new Date(), updatedAd: new Date()
            }
            const message = await addPosting(data)
            return message
        },
        addComment: async (_, args, context) => {
            context.authentication()
            const { id, content, username } = args
            const data = {
                content, username, id
            }
            const message = await addCommentUser(data)
            return message
        },
        likePost: async (_, args, context) => {
            context.authentication()
            const { id, username } = args
            const data = {
                id, username
            }
            const message = await addLike(data)
            return message
        }
    }
}

module.exports = {
    postResolvers, postTypeDefs
}