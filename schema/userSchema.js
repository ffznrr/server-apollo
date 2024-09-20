const { registerUser, loginUser, findUser, getUser } = require("../models/index")

const userTypeDefs = `#graphql
type User {
    name:String!
    username:String!
    email:String!
}

type Follow{
    _id:String
    followingId:String
    followerId:String
    createdAt:String
    updatedAd:String
}

type ShowUser{
    name:String
    username:String
    email:String
    Following: [Follow]
    Followers: [Follow]

}

interface Response {
    message: String
    statusCode: String!
    error: String
}

type userLoginResponse {
    access_token: String
}

type Query{
    User(query:String): [User]
    UserById(id:String): ShowUser
}

type Mutation{
    register(name:String!, username:String!, email:String!, password:String!): User
    login(username:String, password:String): userLoginResponse
}
`

const userRevolvers = {
    Mutation: {
        register: async (_, args,) => {
            const {
                name,
                username,
                email,
                password
            } = args

            const newData = {
                name,
                username,
                email,
                password
            }

            const register = await registerUser(newData)

            return register
        },
        login: async (_, args,) => {
            const { username, password } = args
            const loginData = {
                username,
                password
            }

            const login = await loginUser(loginData)

            return login
        },
    },
    Query: {
        User: async (_, args, context) => {
            context.authentication()
            const { query } = args
            const user = await findUser(query)
            return user
        },
        UserById: async (_, args, context) => {
            context.authentication()
            const { id } = args
            console.log(id);
            const UserById = await getUser(id)
            return UserById
        }
    }
}

module.exports = {
    userTypeDefs, userRevolvers
}