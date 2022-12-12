var express = require('express');
const dotenv = require("dotenv").config()
const { connectDb, closeConnection } = require('../config');
var router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto")
const JWT_SC = process.env.secret_key;
const mongodb = require("mongodb")

const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "d73330670@gmail.com",
        pass: "fxploecdfmhtiyaa"
    }
})

router.post('/register', async function (req, res, next) {
    try {
        const db = await connectDb();
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(req.body.password, salt)
        req.body.password = hash
        const user = await db.collection("users").insertOne(req.body);
        await closeConnection()
        res.json({ message: "User created" })
    } catch (error) {
        console.log(error);
        res.json({ message: "user not created" })
    }
});

router.post('/login', async function (req, res, next) {
    try {
        const db = await connectDb();
        const user = await db.collection("users").findOne({ email: req.body.email });
        if (user) {
            const passwordcheck = await bcrypt.compare(req.body.password, user.password)
            if (passwordcheck) {
                const token = jwt.sign({ _id: user._id }, JWT_SC, { expiresIn: "1h" })
                res.json({ message: "Success", token, role: user.role })

            } else {
                res.json({ message: "Incorrect email/password" })
            }
        } else {
            res.status(404).json({ message: "Incorrect email/password" })
        }
        await closeConnection()
    }
    catch (error) {
        console.log(error);
        res.json({ message: "User not found" })
    }
})

router.post('/forgotpassword', async function (req, res, next) {
    try {
        const db = await connectDb();
        const user = await db.collection("users").findOne({ email: req.body.email });
        if (user) {
            const randomUrl = crypto.randomBytes(16).toString('hex');
            const mailOptions = {
                from: "d73330670@gmail.com",
                to: user.email,
                subject: "Reset your password",
                html: `<p>Click <a href="http://localhost:3000/reset-password?url=${randomUrl}">here</a> to reset your password.</p>`
            }
            console.log(mailOptions.html)
            await db.collection("users").updateOne({ _id: user._id }, { $set: { token: randomUrl } })
            await closeConnection()
            res.json({ message: "Email sent", token: randomUrl })
            transport.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error)
                } else {
                    console.log(`Email sent: ${info.response}`)
                }
            })
        } else {
            res.json({ message: "Email address not valid" })
        }
    } catch (error) {
        console.log(error)
    }
})

router.post('/reset-password-page', async (req, res) => {
    try {
        const userid = req.query.id;
        const db = await connectDb();
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(req.body.password, salt)
        req.body.password = hash
        await db.collection("users").updateOne({ _id: mongodb.ObjectId(userid) }, { $set: { password: req.body.password } })
        await closeConnection()
        res.json({ message: "Password has been reset" })
    } catch (error) {
        console.log(error)
    }
})


module.exports = router;
