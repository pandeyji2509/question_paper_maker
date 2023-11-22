const express = require('express');
const app = express();
const fetch = require("node-fetch");
const port = 5000;
require("dotenv").config();
const mongoose = require('mongoose')
const questionModel=require("./model/model");
const bodyParser = require('body-parser');
const MongoClient = require("mongodb").MongoClient;
var cors = require("cors");

var urlencodedParser=bodyParser.urlencoded({extended:false});
  app.use(express.json());
  app.use(cors({ origin: true }));
  const connectionParams={
    useNewUrlParser: true,
    useUnifiedTopology: true 
  }
  console.log(process.env.MONGO_URI);
  // questions
  mongoose.connect(`${process.env.MONGO_URI}/questions`,connectionParams);
    const db=mongoose.connection;
    db.on("error",console.error.bind(console,"connection failed: "));
    db.once("open",function(){
      console.log("Connected to the database successfully");
    });
app.get('/', (req, res) => {
  res.send('Hello World!');
}); 

app.post("/add_questions",async(req,res)=>{
  const que=new questionModel(req.body);
  try{    
    await que.save();
    res.send(que);
  }catch(error){
    res.status(500).send(error);
  }
});

app.post("/question_paper",urlencodedParser,async(req,res)=>{
  var num_easy=parseInt(req.body.Difficulty.Easy);
  var num_moderate=parseInt(req.body.Difficulty.Moderate);
  var num_hard=parseInt(req.body.Difficulty.Hard);
  var total=parseInt(req.body.Total_Marks);
  var sum=num_easy+num_moderate+num_hard;
  console.log(num_easy,num_moderate,num_hard,total,sum);
  if(sum!=total){
    res.status(500).json({error:"sum of Percentages should be equal to 100"});
    return;
  } 
  if( ((total*num_easy)/100)%5!==0){
    res.status(500).json({error:"Number of Easy question should be a multiple of 5"});
    return;
  }  
  if( ((total*num_moderate)/100)%10!==0){
    res.status(500).json({error:"Number of Moderate question should be a multiple of 5"});
    return;
  }
  if( ((total*num_hard)/100)%15!==0){
    res.status(500).json({error:"Number of Hard question should be a multiple of 5"});
    return;
  }
  try{
  var e=0,m=0,h=0;
  var p=[];
  // for randomly shuffle question so that each time question are randomly selected
  function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle.
    while (currentIndex > 0) {
  
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
  }
    await questionModel.find({"Difficulty":"Easy"}).then((allTasks)=>{
      shuffle(allTasks);
      allTasks.map(async tasks=>{
        e=e+tasks.Marks;
        if(e<=(total*num_easy)/100){
          p.push({"question": tasks.Questions,"Topic": tasks.Topic,"Subject": tasks.Subject,"Difficulty":tasks.Difficulty,"Marks":tasks.Marks});
        }       
      });
      console.log(h);
      if(e<(total*num_easy)/100){
        res.status(500).json({error:"Not Enough question in Database , so first add some Easy questions"});
        return;
      }
    });
    
    await questionModel.find({"Difficulty":"Moderate"}).then((allTasks)=>{
      // console.log(allTasks.length)
      shuffle(allTasks);
      allTasks.map(async tasks=>{
        m=m+tasks.Marks;
        if(m<=(total*num_moderate)/100){
          p.push({"question":tasks.Questions,"Topic":tasks.Topic,"Subject":tasks.Subject,"Difficulty":tasks.Difficulty,"Marks":tasks.Marks});
        } 
      });
      if(m<(total*num_moderate)/100){
        res.status(500).json({error:"Not Enough question in Database , so first add some Moderate questions"});
        return;
      }     
    });
    await questionModel.find({"Difficulty":"Hard"}).then((allTasks)=>{
      shuffle(allTasks);
      allTasks.map(async tasks=>{
        h=h+tasks.Marks;
        if(h<=(total*num_hard)/100){
          p.push({"question":tasks.Questions,"Topic":tasks.Topic,"Subject":tasks.Subject,"Difficulty":tasks.Difficulty,"Marks":tasks.Marks});
        }
      });  
      if(h<(total*num_hard)/100){
        res.status(500).json({error:"Not Enough question in Database , so first add some hard  questions"});
        return;
      }
    })
  res.send(p);
  return;
  }
  catch(e){
   res.sendStatus(501);
   return;
  } 
});

app.get("/question", urlencodedParser, async(req,res)=>{
  const que=await questionModel.find({},);
  try{
    res.send(que);
  }catch(error){
    res.status(500).send(error);
  }
});  
app.post("/question_api",urlencodedParser,async (req,res)=>{
  console.log(req.body.number);
  const response=await fetch(`https://behavioural-recruitment-api.azurewebsites.net/api/questions/random/${req.body.number}`);
  const question=await response.json();
  console.log(question);
res.send(question.array);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});