const { MongoClient } = require("mongodb");
require("dotenv").config();

const { ApolloServer } = require("apollo-server-express");
const express = require("express");
const expressPlayground =
  require("graphql-playground-middleware-express").default;

const { readFileSync } = require("fs");
const typeDefs = readFileSync(`./typeDefs.graphql`, `UTF-8`);
const resolvers = require("./resolvers");

async function startApolloServer() {
  const app = express();
  const MONGO_DB = process.env.DB_HOST;

  const client = await MongoClient.connect(MONGO_DB, { useNewUrlParser: true });

  client.connect(async (err, dbs) => {
    const db = dbs.db("sample_for_learning_graphql");

    // サーバーのインスタンスを作成、その際、typeDefs（スキーマ）とリゾルバを引数に取る
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      context: async ({ req }) => {
        const githubToken = req.headers.authorization;
        const currentUser = await db
          .collection("users")
          .findOne({ githubToken });
        return { db, currentUser };
      },
    });

    await server.start();
    server.applyMiddleware({ app });

    app.get("/", (req, res) => res.end(`Welcome to the PhotoShare API`));
    app.get("/playground", expressPlayground({ endpoint: `/graphql` }));

    // Webサーバーを起動
    app.listen({ port: 4000 }, () => {
      console.log(
        `GraphQL Server running @ http://localhost:4000${server.graphqlPath}`
      );
    });
  });
}

startApolloServer();
