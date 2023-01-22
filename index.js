const { ApolloServer } = require("apollo-server-express");
const express = require("express");
const { GraphQLScalarType } = require("graphql");

const typeDefs = `
scalar DateTime
enum PhotoCategory {
  SELFIE
  PORTRAIT
  ACTION
  LANDSCAPE
  GRAPHIC
}
type User {
  githubLogin: ID!
  name: String
  avatar: String
  postedPhotos: [Photo!]!
  inPhotos: [Photo!]!
}
type Photo {
  id: ID!
  url: String!
  name: String!
  description: String
  category: PhotoCategory!
  postedBy: User!
  taggedUsers: [User!]!
  created: DateTime!
}
input PostPhotoInput {
  name: String!
  category: PhotoCategory=PORTRAIT
  description: String
}
type Query {
  totalPhotos: Int!
  allPhotos(after: DateTime): [Photo!]!
}
type Mutation {
  postPhoto(input: PostPhotoInput!): Photo!
}
`;

let _id = 0;

var users = [
  { githubLogin: "mHattrup", name: "Mike Hattrup" },
  { githubLogin: "gPlake", name: "Glen Plake" },
  { githubLogin: "sSchmidt", name: "Scot Schmidt" },
];

var photos = [
  {
    id: "1",
    name: "Dropping the Heart Chute",
    description: "The heart chute is one of my favorite chutes",
    category: "ACTION",
    githubUser: "gPlake",
    created: "2022-04-15T19:09:57.308Z",
  },
  {
    id: "2",
    name: "Enjoying the sunshine",
    category: "SELFIE",
    githubUser: "sSchmidt",
    created: "2022-04-15T19:09:57.308Z",
  },
  {
    id: "3",
    name: "Gunbarrel 25",
    description: "25 laps on gunbarrel today",
    category: "LANDSCAPE",
    githubUser: "sSchmidt",
    created: "2022-04-15T19:09:57.308Z",
  },
];

var tags = [
  { photoID: "1", userID: "gPlake" },
  { photoID: "2", userID: "sSchmidt" },
  { photoID: "2", userID: "mHattrup" },
  { photoID: "2", userID: "gPlake" },
];

const resolvers = {
  Query: {
    totalPhotos: () => 42,
    allPhotos: (parent, args) => {
      const { after } = args;
      console.log("allPhotos", after);
      if (after) {
        return photos.filter(
          (photo) => new Date(photo.created) > new Date(after)
        );
      }
      return photos;
    },
  },
  Mutation: {
    postPhoto(parent, args) {
      const newPhoto = {
        id: _id++,
        ...args.input,
        created: new Date(),
      };
      photos.push(newPhoto);
      return newPhoto;
    },
  },
  Photo: {
    url: (parent) => `https://blog.cawpea.me/${parent.id}.jpg`,
    postedBy: (parent) => {
      return users.find((user) => user.githubLogin === parent.githubUser);
    },
    taggedUsers: (parent) => {
      return tags
        .filter((tag) => tag.photoID === parent.id)
        .map((tag) => tag.userID)
        .map((userID) => users.find((user) => user.githubLogin === userID));
    },
  },
  User: {
    postedPhotos: (parent) => {
      return photos.filter((photo) => photo.githubUser === parent.githubLogin);
    },
    inPhotos: (parent) => {
      return tags
        .filter((tag) => tag.userID === parent.id)
        .map((tag) => tag.photoID)
        .map((photoID) => photos.find((photo) => photo.id === photoID));
    },
  },
  DateTime: new GraphQLScalarType({
    name: `DateTime`,
    description: `A valid date time value.`,
    parseValue: (value) => new Date(value), // Queryの引数に渡されるときに適用される関数
    serialize: (value) => new Date(value).toISOString(), // Queryを返却するときに適用される関数
    parseLiteral: (ast) => ast.value, // Query変数ではなく、直接Query引数で指定された場合に適用される関数
  }),
};

async function startApolloServer() {
  const app = express();
  // サーバーのインスタンスを作成、その際、typeDefs（スキーマ）とリゾルバを引数に取る
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();
  server.applyMiddleware({ app });

  app.get("/", (req, res) => res.end(`Welcome to the PhotoShare API`));

  // Webサーバーを起動
  app.listen({ port: 4000 }, () => {
    console.log(
      `GraphQL Server running @ http://localhost:4000${server.graphqlPath}`
    );
  });
}

startApolloServer();
