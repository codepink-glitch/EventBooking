const express = require('express');
const bodyParser = require('body-parser');
const { graphqlHTTP } = require('express-graphql');
const mongoose = require('mongoose');
const cors = require('cors');
const graphQLSchema = require('./graphql/schema/index');
const graphQLResolvers = require('./graphql/resolvers/index');
const isAuth = require('./middleware/is-auth');


const app = express();

app.use(bodyParser.json());

app.use(cors());

app.use(isAuth);

app.use("/graphql", graphqlHTTP({
    schema: graphQLSchema,
    rootValue: graphQLResolvers,
    graphiql: true
}));

//TODO wire up db login and password from file
mongoose.connect(`mongodb://EventsAdmin:EventsAdminPassword@localhost:27017/events`)
    .then(() => app.listen(8080))
    .catch(console.log);
