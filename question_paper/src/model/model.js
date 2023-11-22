const mongoose = require('mongoose');
 
const StudentSchema = new mongoose.Schema({
    Questions: String,
    Subject: String,
    Topic: String,
    Difficulty: String,
    Marks: Number
});
 
const Ques=mongoose.model("question",StudentSchema);
module.exports = Ques;