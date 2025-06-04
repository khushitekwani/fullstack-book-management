var express=require("express");
let bodyParser=require("body-parser");
let app_routing=require("./modules/app-routing");
const cors = require('cors');

require('dotenv').config();
let app=express();
app.use(cors());

app.use(bodyParser.text());
app.use('/',require('./middleware/validators').extractHeaderLanguage);// extranting language from header
app.use('/',require('./middleware/validators').validateApiKey);//validating api key
app.use('/',require('./middleware/validators').validateHeaderToken);//validating token


app_routing.v1(app);





const port = process.env.PORT || 27566;
app.listen(port, function() {
    console.log("Server running on port " + port);
});