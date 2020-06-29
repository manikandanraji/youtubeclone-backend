require("dotenv").config();
const express = require("express");
const db = require("./utils/db");
const auth = require("./routes/auth");
const admin = require("./routes/admin");
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// connection to db
db.authenticate()
	.then(res => console.log("connection to database successful"))
	.catch(err => console.log(err));

app.use(express.json());

app.use('/api/v1/auth', auth);
app.use('/api/v1/admin', admin);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`Server started at http://localhost:${PORT}`));
