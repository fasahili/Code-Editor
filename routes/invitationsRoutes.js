const express = require("express");
const router = express.Router();
const { createInvitation, addCollaborator } = require("../controllers/invitationsController");
const { viewEditor } = require("../controllers/editorController");
const Invitation = require("../models/invitations");


router.post("/code/invitation", async (req, res) => {
  try {
    await createInvitation(req, res);
  } catch (error) {
    console.log(error.message);
    res.send({ message: "invitation" });
  }
});

router.get("/invite?:id", async (req, res) => {
  try {
    const InvitationID = req.query.id;
    const currInvitation = await Invitation.findOne({_id:InvitationID});
    const {taskId,project} = currInvitation;
    console.log(taskId,project);
    await addCollaborator(req, res);
    res.redirect(`/code/task=${taskId}&project=${project}`)
  } catch (error) {
    console.log(error.message);
    res.send({ message: "server error" });
  }
});

module.exports = router;