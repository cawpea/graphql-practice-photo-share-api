const { ApolloServer } = require("apollo-server");

const typeDefs = `
type Query {
  totalPhotos: Int!
}
type Mutation {
  postPhoto(name: String! description: String): Boolean!
}
`;

const photos = [];

const resolvers = {
  Query: {
    totalPhotos: () => 42,
  },
  Mutation: {
    postPhoto(parent, args) {
      photos.push(args);
      return true;
    },
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
