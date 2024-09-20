if (process.env.NODE_ENV !== "production") {
    require('dotenv').config()
}

const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone');
const { connect } = require('./config/config.js');
const { GraphQLError } = require("graphql");

const { userTypeDefs, userRevolvers } = require("./schema/userSchema.js");
const { verifyToken } = require('./helpers/jwt.js');
const { postTypeDefs, postResolvers } = require('./schema/postSchema.js');
const { followTypeDefs, followResolvers } = require('./schema/followSchema.js');

const server = new ApolloServer({
    typeDefs: [userTypeDefs, postTypeDefs, followTypeDefs],
    resolvers: [userRevolvers, postResolvers, followResolvers],
    instrospection: true
});

(async () => {
    await connect();
    const { url } = await startStandaloneServer(server, {
        listen: 4000,
        context: async ({ req, res }) => {
            console.log("this console will be triggered on every request");
            return {
                authentication: () => {
                    const headerAuthorization = req.headers.authorization
                    if (!headerAuthorization) {
                        throw new GraphQLError("You are not authenticated")
                    }
                    const token = headerAuthorization.split(' ')[1]
                    const payload = verifyToken(token)
                    return {
                        id: payload.id,
                        username: payload.username,
                        email: payload.email
                    }
                }
            };
        },
    });

    console.log(`🚀 Server ready at ${url}`);
})();   