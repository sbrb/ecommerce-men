const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const route = require('./routes/route');
require('dotenv/config');
const app = express();

app.use(express.json());
app.use(multer().any());
const PORT = process.env.PORT;

mongoose.set('strictQuery', true);
mongoose.connect(process.env.DB, {
    useNewUrlParser: true
}).then(() => console.log('MongoDb is connected'))
    .catch(err => console.log(err));

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    console.log(`ip ${req.ip}`)
    next();
});

app.use('/', route);

app.use((req, res) => res.status(400).json({ status: false, message: `'${req.url}' this URL is Invalid.` }));
app.listen(PORT, () => console.log(`Express app is running on port ${PORT}`));