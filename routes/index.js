const dotenv = require("dotenv").config()
var express = require('express');
const { connectDb, closeConnection, db } = require('../config');
var router = express.Router();
const mongodb = require('mongodb')
const jwt = require("jsonwebtoken");
const JWT_SC = process.env.secret_key;
const nodemailer = require("nodemailer");



const transport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: "d73330670@gmail.com",
    pass: "fxploecdfmhtiyaa"
  }
})
const authorize = (req, res, next) => {
  try {
    if (req.headers.authorization) {
      const tokenverify = jwt.verify(req.headers.authorization, JWT_SC)
      if (tokenverify) {
        next()
      } else {
        res.status(401).json({ message: "Token expired" })
      }
    }
    else {
      res.status(401).json({ message: "Token not found" })
    }
  }
  catch (error) {
    console.log(error)
    res.status(401).json({ message: "Unauthorized" })
  }
}

/* GET home page. */
router.get('/reset-password', async (req, res) => {
  try {
    const db = await connectDb();
    const user = await db.collection("users").findOne({ token: req.query.url });
    console.log(req.query.url)
    if (user.token == req.query.url) {
      res.redirect(`https://silly-profiterole-5d81bd.netlify.app/user/reset-password-page?id=${user._id}`)
    } await closeConnection()
  } catch (error) {
    console.log(error)
    res.json("Invalid url")
  }
});

router.post('/create/service-request', authorize, async function (req, res, next) {
  try {
    const db = await connectDb();
    console.log("hi")
    const servicerequest = await db.collection("servicerequests").insertOne(req.body);
    await closeConnection()
    res.json({ message: "Service request created", id: servicerequest.insertedId })
  } catch (error) {
    res.json({ message: "Service request not created" })
  }
});

router.post('/create/lead', authorize, async function (req, res, next) {
  try {
    const db = await connectDb();
    const lead = await db.collection("leads").insertOne(req.body);
    await closeConnection()
    res.json({ message: "lead created", id: lead.insertedId })
  } catch (error) {
    res.json({ message: "lead not created" })
  }
});

router.post('/create/contact', authorize, async function (req, res, next) {
  try {
    const db = await connectDb();
    const contact = await db.collection("contacts").insertOne(req.body);
    await closeConnection()
    res.json({ message: "Contact created", id: contact.insertedId })
  } catch (error) {
    res.json({ message: "Contact created" })
  }
})

router.get('/service-requests', authorize, async function (req, res, next) {
  try {
    const db = await connectDb();
    const servicerequests = await db.collection("servicerequests").find().toArray()
    await closeConnection()
    res.json(servicerequests)
  } catch (error) {
    res.json({ message: "Something went wrong" })
  }
})

router.get('/contacts', authorize, async function (req, res, next) {
  try {
    const db = await connectDb();
    const contacts = await db.collection("contacts").find().toArray()
    await closeConnection()
    res.json(contacts)
  } catch (error) {
    res.json({ message: "Something went wrong" })
  }
})

router.get('/leads', authorize, async function (req, res, next) {
  try {
    const db = await connectDb();
    const leads = await db.collection("leads").find().toArray()
    await closeConnection()
    res.json(leads)
  } catch (error) {
    res.json({ message: "Something went wrong" })
  }
})

router.put('/service-request/:servicereqid', authorize, async function (req, res, next) {
  try {
    const db = await connectDb();
    const user = await db.collection("users").findOne({ email: req.body.email });
    delete req.body._id
    const servicerequest = await db.collection("servicerequests").updateOne({ _id: mongodb.ObjectId(req.params.servicereqid) }, { $set: req.body })
    await closeConnection()
    res.json({ message: "Service request updated" })
  } catch (error) {
    res.json({ message: "Something went wrong" })
  }
})

router.put('/lead/:leadid', authorize, async function (req, res, next) {
  try {
    const db = await connectDb();
    delete req.body._id
    const lead = await db.collection("leads").updateOne({ _id: mongodb.ObjectId(req.params.leadid) }, { $set: req.body })
    await closeConnection()
    res.json({ message: "Lead updated" })
  } catch (error) {
    res.json({ message: "Something went wrong" })
  }
})

router.put('/contact/:contactid', authorize, async function (req, res, next) {
  try {
    const db = await connectDb();
    delete req.body._id
    const contact = await db.collection("contacts").updateOne({ _id: mongodb.ObjectId(req.params.contactid) }, { $set: req.body })
    await closeConnection()
    res.json({ message: "Contact updated" })
  } catch (error) {
    res.json({ message: "Something went wrong" })
  }
})

router.get("/lead/:leadid", authorize, async (req, res) => {
  try {
    const db = await connectDb();
    const lead = await db.collection("leads").findOne({ _id: mongodb.ObjectId(req.params.leadid) })
    await closeConnection()
    res.json(lead)
  } catch (error) {
    console.log(error)
  }
})

router.get("/contact/:contactid", authorize, async (req, res) => {
  try {
    const db = await connectDb();
    const contact = await db.collection("contacts").findOne({ _id: mongodb.ObjectId(req.params.contactid) })
    await closeConnection()
    res.json(contact)
  } catch (error) {
    console.log(error)
  }
})
router.get("/service-request/:servicereqid", authorize, async (req, res) => {
  try {
    const db = await connectDb();
    const servicereq = await db.collection("servicerequests").findOne({ _id: mongodb.ObjectId(req.params.servicereqid) })
    await closeConnection
    res.json(servicereq)
  } catch (error) {
    console.log(error)
  }
})

router.get("/dashboard", authorize, async (req, res) => {
  try {
    const db = await connectDb();
    const lead = await db.collection("leads").find().toArray()
    const leadlength = lead.length
    const sreq = await db.collection("servicerequests").find().toArray()
    const sreqlength = sreq.length
    const cont = await db.collection("contacts").find().toArray()
    const contlength = cont.length
    await closeConnection()
    res.json({ leadlength, sreqlength, contlength })
  } catch (error) {
    console.log(error)
  }
})

module.exports = router;
