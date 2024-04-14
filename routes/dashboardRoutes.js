const express = require("express");
const router = express.Router();
const dashboards = require("../controllers/dashboardController");

router.get('/dashboard' , (req,res) => {
   dashboards.chart(req,res);
})


module.exports = router;