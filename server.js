const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require("dotenv").config();
const app = express();
const { router } = require("./middleware/authMiddleware");


const taskRoutes = require("./routes/taskRoutes");
const projectRoutes = require("./routes/projectRoutes");
const editorRoutes = require("./routes/editorRoutes");
const authRoutes = require("./routes/authRoutes");
const homeRoutes = require("./routes/homeRoutes");
const editProfileRoutes = require("./routes/editProfileRoutes");
const invitationsRoutes = require("./routes/invitationsRoutes");
const dashboard = require("./routes/dashboardRoutes");
app.use(router);
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "/public")));
app.set("views", path.join(__dirname, "/views"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/", dashboard);
app.use("/", homeRoutes);
app.use("/", editorRoutes);
app.use("/", authRoutes);
app.use("/", editProfileRoutes);
app.use("/", invitationsRoutes);
app.use("/", projectRoutes);
app.use("/", taskRoutes);
app.get("/*", (req, res) => {
  res.render("404", { title: "404 Not Found" });
});

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Listening on port ${process.env.PORT}`);
      console.log(`http://localhost:${process.env.PORT}`);
    });
  })
  .catch((error) => console.log(error));
