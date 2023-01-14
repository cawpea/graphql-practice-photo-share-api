const { ApolloServer } = require("apollo-server");

const typeDefs = `
type Photo {
  id: ID!
  url: String!
  name: String!
  description: String
}
type Query {
  totalPhotos: Int!
  allPhotos: [Photo!]!
}
type Mutation {
  postPhoto(name: String! description: String): Photo!
}
`;

let _id = 0;
const photos = [];

const resolvers = {
  Query: {
    totalPhotos: () => 42,
    allPhotos: () => photos,
  },
  Mutation: {
    postPhoto(parent, args) {
      const newPhoto = {
        id: _id++,
        ...args,
      };
      photos.push(newPhoto);
      return newPhoto;
    },
  },
  Photo: {
    url: (parent) => `https://blog.cawpea.me/${parent.id}.jpg`,
  },
};

// サーバーのインスタンスを作成、その際、typeDefs（スキーマ）とリゾルバを引数に取る
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Webサーバーを起動
server
  .listen()
  .then(({ url }) => console.log(`GraphQL Service running on ${url}`));
