const { GraphQLScalarType } = require("graphql");

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
    totalPhotos: (parent, args, { db }) => {
      return db.collection("photos").estimatedDocumentCount();
    },
    allPhotos: (parent, args, { db }) => {
      // const { after } = args;
      // console.log("allPhotos", after);
      // if (after) {
      //   return photos.filter(
      //     (photo) => new Date(photo.created) > new Date(after)
      //   );
      // }
      // return photos;
      return db.collection("photos").find({}).toArray();
    },
    totalUsers: (parent, args, { db }) => {
      return db.collection("users").estimatedDocumentCount();
    },
    allUsers: (parent, args, { db }) => {
      return db.collection("users").find().toArray();
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

module.exports = resolvers;
