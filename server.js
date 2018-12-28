const fileUpload = require('express-fileupload');

const express = require('express'),
    app = express(),
    port = process.env.PORT || 3000,
    bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static('public'));
app.set('view engine', 'pug');
app.use(fileUpload());

const cors = require('cors');
app.use(cors());

const routes = require('./api/routes/routes');
routes(app);

app.listen(port);

console.log('Server started on: ' + port);