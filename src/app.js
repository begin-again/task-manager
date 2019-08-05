const express = require('express');
require('./db/mongoose');

const routeUser = require('./routes/user');
const routeTask = require('./routes/task');

const app = express();

// app.use((req, res, next) => {
//   res.status(503).send('Server undergoing maintenance - check back later');
// });
app.use(express.json());
app.use(routeUser);
app.use(routeTask);

module.exports = app;
