const { getLoggedInUserId } = require("../middleware/authMiddleware");
require("dotenv").config();
const crypto = require("crypto");
const User = require("../models/users");
const Project = require("../models/projects");
const Task = require("../models/tasks");
const Invitation = require("../models/invitations");
const { sendMail } = require("./mailServer");

const generateToken = () => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(16).toString("hex");
  const token = `${timestamp}-${randomString}`;
  return token;
};

const genLink = async (req, res) => {
  const { projectID,taskID } = req.body;


  const inviteeUser = await User.findOne({ email: req.body.email });
  const invitation = await Invitation.create({
    invitedBy: getLoggedInUserId(),
    sentTo: inviteeUser._id.toString(),
    token: generateToken(),
    project: [projectID],
    taskId: [taskID],
  });
  const inviteLink = `${process.env.HOST_URL}:${process.env.PORT}/invite?id=${invitation._id.toString()}&t=${invitation.token}`;
  await invitation.update({
    link:inviteLink
  });
  return inviteLink;
};

const createInvitation = async (req, res) => {
  const { email,taskID } = req.body;
  const invitedBy = await getLoggedInUserId();
  try {
    const invitedUser = await User.findOne({ email });
    if (!invitedUser)
      return res.status(404).send({ message: "The invited user does not exist" });

    if(invitedBy===invitedUser._id.toString())
      return res.status(400).send({message: "You can't invite yourself"});

    const invitation = await genLink(req,res);
    sendMail(req, invitation);
    res.status(200).send({ message: "Invitation sent" });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ message: "Invitation not sent" });
  }
};

const addCollaborator = async (req) => {
  const invitationId = req.query.id;
  const invitation = await Invitation.findById(invitationId);
  const project = await Project.findOneAndUpdate({ _id: invitation.project, deleted: false },
    { $addToSet: { collaborators: invitation.sentTo } }
  );
  Invitation.updateOne(invitationId, { accepted: true });
  const task = await Task.findOneAndUpdate(
    { _id: invitation.taskId[0], deleted: false },
    { $addToSet: { collaborators: invitation.sentTo } },
    { new: true }
  );
  return { project, task };
};

const getInvitation = async (req, res) => {
  const taskId = req.body.id;
  const { id } = req.params;
  try {
    const invitation = await Invitation.findById(id)
      .populate("invitedBy")
      .populate("sentTo")
      .populate("project")
      .populate("taskId");

    if (!invitation) {
      return res
        .status(404)
        .send({ message: "Invitation not found", title: "Profile" });
    }

    const project = await Project.find({ _id: id, deleted: false })
      .populate("owner")
      .populate("collaborators");
    const tasks = await Task.find({ _id: taskId, deleted: false });

    if (!project) {
      return res
        .status(404)
        .send({ message: "Project not found!", title: "Profile" });
    }
    res.render("code", { project });

    if (!tasks) {
      return res
        .status(404)
        .send({ message: "The task not found", title: "Profile" });
    }
    res.render("/", { tasks });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ message: "Server side error" });
  }
};

const deleteInvitation = async (req, res) => {
  try {
    const { id } = req.body;
    const invitation = await Invitation.findById(id);

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(404).send({ message: "id is not valid" });

    if (!invitation) {
      return res.status(404).send({ message: "Invitation not found" });
    }

    if (invitation.accepted || invitation.rejected) {
      return res.status(400).send({
        message:
          "Cannot delete invitation because it has already been accepted or rejected",
      });
    }

    await Invitation.findOneAndUpdate({ _id: id }, { deleted: true });
    res
      .status(200)
      .send({ message: "Invitation has been deleted successfuly" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
};

module.exports = {
  createInvitation,
  getInvitation,
  deleteInvitation,
  addCollaborator,
};
