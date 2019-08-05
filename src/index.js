const app = require('./app');
const port = process.env.PORT;

app.listen(port, () => { console.info(`Server is up on port ${port}`); });
