const { getDataFollow } = require("../models")

const followTypeDefs = `#graphql
type messageFollow{
    message: String
}

type Mutation{
    follow(id:String, followId:String): messageFollow
}
`

const followResolvers = {
    Mutation: {
        follow: async (_, args, context) => {
            context.authentication()
            const { id, followId } = args
            const data = {
                id,
                followId
            }
            const follow = await getDataFollow(data)
            return follow
        }
    }
}

module.exports = {
    followResolvers, followTypeDefs
}

