var mongodb = require("mongodb");
var mongoclient = mongodb.MongoClient;
let connection;
let db;
const dotenv = require("dotenv").config()
var URL = process.env.DB;

async function connectDb(){
    connection = await mongoclient.connect(URL);
    db = connection.db("CRM");
    return db
}

async function closeConnection(){
    if(connection){
        await connection.close()
    }else{
        console.log("No connection")
    }
}

module.exports ={connectDb, closeConnection,connection,db}