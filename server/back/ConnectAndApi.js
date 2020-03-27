const Express = require("express");
const BodyParser = require("body-parser");
var MongoClient = require("mongodb").MongoClient;
const graphqlHTTP = require('express-graphql');
const ObjectId = require("mongodb").ObjectID;
const {GraphQLSchema} = require('graphql');
const CONNECTION_URL = "mongodb+srv://aurelrm:aurelrm@thecluster-tygpr.gcp.mongodb.net/test?retryWrites=true&w=majority";
const {queryType} = require('./query.js')
const schema = new GraphQLSchema({ query: queryType });

const DATABASE_NAME = "movies";

var app = Express();

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));

var database, collection;

app.listen(9292, () => {
    
    MongoClient.connect(CONNECTION_URL,{ useNewUrlParser: true }, (error, client) => {
        if(error) {
            
            console.log(error) ;
        }
        database = client.db(DATABASE_NAME);
        collection = database.collection("denzel");
        
        console.log("Connected to `" + DATABASE_NAME + "`!");
    });
});

app.get("/movies/populate", (request, response) => {
    collection.find({}).toArray((error, result) => {
        if(error) {
            return response.status(500).send(error);
        }
        response.send(result);
    });
});
app.get("/movies", (request, response) => {
    collection.findOne( (error, result) => {
        if(error) {
            return response.status(500).send(error);
        }
        response.send(result);
    });
  });

app.get("/movies/search", (request, response) => {
    var req=request.query;
    var metascore;
    if(req.metascore == null)
    {
        metascore=0;
    }else{metascore=Number(req.metascore);}
    
    var limit;
    if(req.limit == null)
    {
        limit = 5
    }
    else{limit=Number(req.limit)}
   
    
    collection.find({ "metascore" : {"$gt":metascore}}).sort({"metascore":-1}).limit(limit).toArray((error, result) => {
        if(error) {
            return response.status(500).send(error);
        }
        response.send(result);
    });
});

app.get("/movie/:id", (request, response) => {
    collection.findOne({ "_id": new ObjectId(request.params.id) }, (error, result) => {
        if(error) {
            return response.status(500).send(error);
        }
        response.send(result);  
    });
});

app.post("/movie/:id", (request, response) => {
    req=request.body;
    collection.updateOne({id:request.params.id},{$set:{date:req.date,review:req.review}},(error, result) => {           
        if(error) {
            return response.status(500).send(error);
        }           
        response.send(result)          
    });
});


app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: true,

}));
