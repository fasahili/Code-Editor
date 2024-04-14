const Tasks = require("../models/tasks");
const chart = async (req,res) => {
    const completedTask = await Tasks.countDocuments({
        completed:true
    })
    const unCompletedTask = await Tasks.countDocuments({
        completed:false
    })
    const taskStatus = [completedTask,unCompletedTask];
    
    await Tasks.aggregate([
        {
          $group: {
            _id: { $month: "$createdAt" },
            counts: { $sum: 1 }
          }
        }   
      ], (err, result) => {
        if (err) {
          console.log(err);
        } else {
          console.log(result);
          var month =[];
          var count =[];
         result.forEach((obj) => {
             month.push(obj._id);
             count.push(obj.counts);
        })
        res.render('dashboard',{title:'dashboard' , "tasksDone":taskStatus , "months":month , "counts" : count})
           
        }
      });



}

module.exports = {
    chart
};