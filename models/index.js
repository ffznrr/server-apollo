
const { getDb } = require("../config/config")
const { GraphQLError } = require("graphql");
const { hash, compare } = require("../helpers/bcrypt");
const { sign } = require("../helpers/jwt");
const { ObjectId } = require('mongodb')
const redis = require("../config/redis")


// const USERS_COLLECTION = 'user'

const registerUser = async (data) => {
    const db = await getDb()
    const name = data.name
    const username = data.username
    const email = data.email
    const password = hash(data.password)
    data.password = password

    if (data.password < 5) throw new GraphQLError("Password Minimal 5 Length")

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new GraphQLError("Invalid email format");
    }

    const usernameData = await db.collection('user').findOne({ username })
    if (usernameData) {
        if (usernameData.username === username) {
            throw new GraphQLError("Username must be Unique");
        }
    }
    const emailData = await db.collection('user').findOne({ email })
    if (emailData) {
        if (emailData.email === email) {
            throw new GraphQLError("Email must be Unique");
        }
    }

    await db.collection("user").insertOne(data);

    return {
        email,
        name,
        username
    }
}

const loginUser = async (data) => {
    const db = await getDb()
    const username = data.username
    const pass = data.password
    if (!data.username) throw new GraphQLError("Username is required")
    if (!data.password) throw new GraphQLError("Password is required")

    const user = await db.collection("user").findOne({ username })
    if (!user) throw new GraphQLError("Login Invalids")
    if (!compare(pass, user.password)) throw new GraphQLError("Login Invalid")
    const payload = {
        id: user._id,
        username: user.username,
        email: user.email
    }
    const access_token = sign(payload)

    return {
        access_token
    }
}

const findUser = async (username) => {
    const db = await getDb()
    const data = await db.collection('user').find({
        username: { $regex: username, $options: 'i' }
    }).toArray();
    return data
}

const addPosting = async (data) => {
    const db = await getDb()
    const success = await db.collection('post').insertOne(data)
    if (!success) throw new GraphQLError("Posting is Failed")
    return {
        message: "Success Add Post"
    }
}

const addCommentUser = async (data) => {
    const db = await getDb()
    let numberId = data.id
    const newComment = {
        content: data.content,
        username: data.username,
        createdAt: new Date(),
        updatedAt: new Date()
    }

    await db.collection('post').updateOne(
        { _id: new ObjectId(numberId) },
        { $push: { comment: newComment } }
    );

    return {
        message: "Success Add Comment"
    }

}

const addLike = async (data) => {
    const db = await getDb()
    const numberId = data.id
    const newLike = {
        username: data.username,
        createdAt: new Date(),
        updatedAt: new Date()
    }
    const output = await db.collection('post').findOne({ _id: new ObjectId(numberId) })
    let totalLike = 0
    const validation = output.like.find((item) => {
        if (item.username == newLike.username) {
            totalLike++
        }
    })
    if (totalLike === 0) {
        await db.collection('post').updateOne(
            { _id: new ObjectId(numberId) },
            { $push: { like: newLike } }
        )
        return {
            message: "You like this Post"
        }
    } else if (totalLike === 1) {
        await db.collection('post').updateOne(
            { _id: new ObjectId(numberId) },
            { $pull: { like: { username: newLike.username } } }
        );
        return {
            message: "You Unlike this Post"
        }
    }
}

const getDataFollow = async (data) => {
    const db = await getDb()
    const newFollow = {
        followingId: new ObjectId(data.id),
        followerId: new ObjectId(data.followId),
        createdAt: new Date(),
        updatedAt: new Date()
    }
    let output;
    const result = await db.collection('follow').findOne({ followingId: newFollow.followingId, followerId: newFollow.followerId })
    if (result) {
        output = await db.collection('follow').deleteOne({ followingId: new ObjectId(newFollow.followingId), followerId: new ObjectId(newFollow.followerId) })
        return {
            message: "You Stop Following"
        }
    } else {
        output = await db.collection('follow').insertOne(newFollow)
        return {
            message: "You Start Following"
        }
    }
}

const getUser = async (id) => {
    const db = await getDb()

    const user = await db.collection('user').aggregate([
        {
            $match: { _id: new ObjectId(id) }
        },
        {
            $lookup: {
                from: "follow",
                localField: "_id",
                foreignField: "followerId",
                as: "Following"
            }
        },
        {
            $lookup: {
                from: "follow",
                localField: "_id",
                foreignField: "followingId",
                as: "Followers"
            }
        }
    ]).next()

    return user

}

const getPostByIdUser = async (_id) => {
    const db = await getDb()
    const agg = [
        {
            $match: {
                _id: new ObjectId(_id),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "authorId",
                foreignField: "_id",
                as: "author",
            },
        },
        {
            $project: {
                "author.password": 0,
            },
        },
        {
            $sort: {
                createdAt: -1,
            },
        },
        {
            $unwind: {
                path: "$author",
                preserveNullAndEmptyArrays: true,
            },
        },
    ];
    const findOne = await db.collection('post').aggregate(agg).next()
    return findOne
}

const getAllPost = async () => {
    const db = await getDb()
    const agg = [
        {
            '$lookup': {
                'from': 'user',
                'localField': 'authorId',
                'foreignField': '_id',
                'as': 'User'
            }
        },
        {
            $project: {
                _id: 1,
                content: 1,
                tags: 1,
                imgUrl: 1,
                authorId: 1,
                comments: 1,
                likes: 1,
                createdAt: 1,
                updatedAt: 1,
                User: { $first: "$User" }
            }
        }
    ]
    const cache = JSON.parse(await redis.get('data'))

    if (!cache) {
        const data = await db.collection('post').aggregate(agg).toArray()
        await redis.set('data', JSON.stringify(data))
    }
    return cache
}

module.exports = {
    registerUser, loginUser, findUser, addPosting,
    addCommentUser, addLike, getDataFollow, getUser, getPostByIdUser, getAllPost
}