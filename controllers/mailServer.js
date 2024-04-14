require("dotenv").config();
const nodemailer = require("nodemailer");
const notifier = require("node-notifier");
const { exec } = require("child_process");
const { getLoggedInUserId } = require("../middleware/authMiddleware");
const Invitation = require("../models/invitations");
const User = require("../models/users");
async function sendMail(req, inviteLink) {
  let transporter = nodemailer.createTransport({
    host: process.env.MAIL_SERVER,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: "",
      pass: "",
    },
  });

  let mailOptions = {
    from: process.env.SENT_FROM,
    to: req.body.email,
    text: `<a href="${inviteLink}">Click here</a>`,
    html: `<p>Hello </p><p> i want you to help me in my task </p>
    <p> ${inviteLink}</p>
    <p> if u want come </p><a href="${inviteLink}">Click here</a>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      return false;
    }
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    return true;
  });
}

const notifierFunc = async (req, res) => {
  const userId = await getLoggedInUserId(req,res)
  const invitations = await Invitation.find({ sentTo: userId });
  for (let i = 0; i < invitations.length; i++) {
    if (!invitations[i].accepted) {
      const invitedBy = await User.findById({ _id: invitations[i].invitedBy });
      const email=invitedBy.email
      notifier.notify({
        title: "invition form LtesCode",
        message: `from: ${email}
          can you help me?`,
        sound: true,
        wait: true,
      });
      notifier.on("click", function () {
        exec(`start "" "${invitations[i].link}"`, (error) => {
          if (error) {
            console.error("Failed to open link:", error);
          }
        });
      });
    }
  }
};

module.exports = { sendMail, notifierFunc };
