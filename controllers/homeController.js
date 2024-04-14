require("dotenv").config();
const nodemailer = require("nodemailer");
const User = require("../models/users");

const viewHome = async (req,res,message,errors) => {
    try {
        const id = req.session.user_id;
        const user = await User.findOne({_id:id});
        res.render("home", { title: "Lets Code" ,user,message,errors});
    } catch (error) {
        console.log(error.message);
        res.status(500).render("../views/serverError", { error: error.message });
    }
}


const sendEmail = (req, res) => {
    const output = `
    <p>You have a new contact request</p>
    <h3>Contact Details</h3>
    <ul>  
    <li>Name: ${req.body.firstName} ${req.body.lastName}</li>
    <li>Email: ${req.body.email}</li>
    </ul>
    <h3>Message</h3>
    <p>${req.body.subject}</p>
    `;
    let transporter = nodemailer.createTransport({
        host:process.env.MAIL_SERVER,
        port: process.env.SMTP_PORT,
        secure: false,
        auth: {
            user: "",//add email is less secure 
            pass: "",//add real password for the email
        },
        tls: {
            rejectUnauthorized: false,
        },
    });
    let mailOptions = {
        from: req.body.email,
        to: process.env.SENT_FROM,
        subject: "Node Contact Request",
        text: output,
        html: output,
    };
    transporter.sendMail(mailOptions, (errors, info) => {
        if (errors) {
            viewHome(req,res,"masege not send")
        }else{  
            viewHome(req,res,"message sent scssfley")
        }
    });
};

module.exports = {
    sendEmail,
    viewHome
};
