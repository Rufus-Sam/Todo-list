const bodyParser = require("body-parser");
const express = require("express");
const methodOverride = require("method-override");
const mongoose = require("mongoose");

var dbUrl = "mongodb+srv://sunil1906:srk12345@cluster0.dr6jp.mongodb.net/todoList?retryWrites=true&w=majority" || "mongodb://localhost:27017/todoList";
// var dbUrl = "mongodb://localhost:27017/todoList";
mongoose.connect(dbUrl, { useNewUrlParser: true,  useUnifiedTopology: true});
const app = express();
const logicModule = require('./public/views/logic.js')

const userSchema = new mongoose.Schema({
    Name: String,
    Password: String,
    Email: String,
    quantum: Number,
    workingHoursPerDay: Number,
    startingTime: String,
	todo:[
		{
            title: String,
            body: String,
            deadline: Date,
            hours: Number,
            minutes: Number,
            bt: Number,
            priority: Number,
            from: {dd: 0, mm: 0, yy:0, hh:0},
            to: {dd: 0, mm: 0, yy:0, hh:0}
		}
	]
});
const user = mongoose.model("USER", userSchema);


app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(methodOverride("_method"));
var username = "";
var password = "";
var email = "";
var id = "";
var failed = false;
var settingFailed = false;

function calendarDetails(answer, startingTime, i){
    data = []
    startingTime = Number(startingTime)
    answer[i].forEach(function(td){
        var single = {};
        single['title'] = td.title;
        var y = String(td.from.yy);
        var m = String(td.from.mm);
        var d = String(td.from.dd);
        var h = String(Math.floor(td.from.hh) + startingTime);
        var mi = String(Math.round((td.from.hh % 1) * 60 ));
        if(m.length == 1){ m = '0' + m}
        if(d.length == 1){ d = '0' + d}
        if(h.length == 1){ h = '0' + h}
        if(mi.length == 1){ mi = '0' + mi}
        var fromDay = y + '-' + m + '-' + d + 'T';
        var fromTime = h + ":" + mi + ":00"
        single['start'] = fromDay + fromTime;

        var y = String(td.to.yy);
        var m = String(td.to.mm);
        var d = String(td.to.dd);
        var h = String(Math.floor(td.to.hh) + startingTime);
        var mi = String(Math.round((td.to.hh % 1) * 60 ));
        if(m.length == 1){ m = '0' + m}
        if(d.length == 1){ d = '0' + d}
        if(h.length == 1){ h = '0' + h}
        if(mi.length == 1){ mi = '0' + mi}
        var toDay = y + '-' + m + '-' + d + 'T';
        var toTime = h + ":" + mi + ":00"
        single['end'] = toDay + toTime;
        single['color'] = "#" + ((1<<24)*Math.random() | 0).toString(16);
        data.push(single);
    });
    return data;
}

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/public/views/index.html");
});
app.get("/login", function (req, res) {
    failed = false;
    res.render(__dirname + "/public/views/login", { failed: failed });
});
app.get("/signup", function (req, res) {
    failed = false;
    res.render(__dirname + "/public/views/signup", { failed: failed });
});
app.post("/login", function (req, res) {
    username = req.body.username;
    password = req.body.password;
    
    //Database searching
    user.find({ Name: username, Password: password }, function (err, ans) {
        if (err) {
            console.log("Something went wrong.");
        }
        else {
            if (ans.length == 1) {
                id = ans[0]._id;
                res.redirect("/homepage");
            }
            else {
                failed = true;
                res.render(__dirname + '/public/views/login', { failed: failed });
            }
        }
    });
});
app.post("/signup", function (req, res) {
    username = req.body.username;
    email = req.body.email;
    password = req.body.password;
    
    const newUser = new user({
        Name: username,
        Password: password,
        Email: email,
        quantum: 2,
        workingHoursPerDay: 12,
        startingTime: "00"
    });
    //First we find whether the user already exists
    user.find({ Name: username }, function (err, ans) {
        if (err) {
            console.log(err);
        }
        else {
            if (ans.length == 1) {
                failed = true;
                res.render(__dirname + "/public/views/signup", { failed: failed });
            }
            else {
                //add the new record to database
                newUser.save();
                res.redirect("/login");
            }
        }
    });
});
app.get("/new", function (req, res) {
    res.render(__dirname + "/public/views/new", { Usrnm: username });;
});
app.get("/homepage", function (req, res) {

	user.findById(id, function(err, userFound){
		if(err){
			console.log(err);
		} else {
			res.render(__dirname + "/public/views/Homepage", { user:userFound, Usrnm:username});
		}
	});

})

app.get("/efficiency", function (req, res) {

	user.findById(id, function(err, userFound){
		if(err){
			console.log(err);
		} else {
            var answer = logicModule.logic(userFound.todo, userFound.quantum, userFound.workingHoursPerDay);
            var wt_tat = answer.slice(4, 12);
			res.render(__dirname + "/public/views/efficiency", { user:userFound, Usrnm:username, wt_tat: wt_tat});
		}
	});

})

app.post("/task", function (req, res) {
    user.findById( id, function (err, userFound) {
        if (err) {
            console.log("Something went wrong.");
        }
        else {
            var newItem = req.body.todo;
            newItem.bt = Number(newItem.hours) + Number(newItem.minutes)/60;
            newItem.priority = Number(newItem.priority);
            newItem.from = {dd: 0, mm: 0, yy:0, hh:0};
            newItem.to = {dd: 0, mm: 0, yy:0, hh:0};
            userFound.todo.push(newItem);
            userFound.save();
            res.redirect("/homepage");
        }
    });
});

app.get("/algo/:query", function(req, res){
    user.findById(id, function(err, userFound){
        if(err){
            console.log("Error!");
        }else{
            var answer = logicModule.logic(userFound.todo, userFound.quantum, userFound.workingHoursPerDay);
            var startHrs = userFound.startingTime;
            var endHrs = String(userFound.workingHoursPerDay + Number(startHrs));
            if(endHrs.length == 1) {endHrs = '0' + endHrs}
            if(req.params.query === "ffcs"){
                data = calendarDetails(answer, userFound.startingTime, 0);
                res.render(__dirname + "/public/views/logicDisplay", { Usrnm:username, algo: answer[0], name: "FCFS", startHrs: startHrs, endHrs: endHrs, data: data, tat: answer[4], wt: answer[5]})
            }
            if(req.params.query === "sjf"){
                data = calendarDetails(answer, userFound.startingTime, 1);
                res.render(__dirname + "/public/views/logicDisplay", { Usrnm:username, algo: answer[1], name: "SJF", startHrs: startHrs, endHrs: endHrs, data: data, tat: answer[6], wt: answer[7]})
            }
            if(req.params.query === "priority"){
                data = calendarDetails(answer, userFound.startingTime, 2);
                res.render(__dirname + "/public/views/logicDisplay", { Usrnm:username, algo: answer[2], name: "Priority", startHrs: startHrs, endHrs: endHrs, data: data, tat: answer[8], wt: answer[9]})
            }
            if(req.params.query === "rr"){
                data = calendarDetails(answer, userFound.startingTime, 3);
                res.render(__dirname + "/public/views/logicDisplay", { Usrnm:username, algo: answer[3], name: "Round Robin", startHrs: startHrs, endHrs: endHrs, data: data, tat: answer[10], wt: answer[11]})
            }
        }
    });
});

app.get("/delete/:id", function(req,res){
    user.findById(id, function(err, userFound){
        if(err){
            console.log('Error!');
        } else{
            var arr = userFound.todo;
            arr = arr.filter((item) => item.id !== req.params.id);
            userFound.todo = arr;
            userFound.save();
            res.redirect("/homepage");
        }
    });
});

app.get("/modify/:id", function(req,res){
    user.findById(id, function(err, userFound){
        if(err){
            console.log('Error!');
        } else{
            var arr = userFound.todo;
            var mod = arr.filter((item) => item.id === req.params.id);
            res.render(__dirname + "/public/views/modify", {Usrnm:username, todoModify: mod[0]});
        }
    });
});

app.post("/modify/:id", function (req, res) {
    user.findById( id, function (err, userFound) {
        if (err) {
            console.log("Something went wrong.");
        }
        else {
            var index = -1;
            for(var i=0;i<userFound.todo.length;i++)
                if(userFound["todo"][i]["_id"] == req.params.id){ index = i}   
            var newItem = req.body.todo;
            newItem.bt = Number(newItem.hours) + Number(newItem.minutes)/60;
            newItem.priority = Number(newItem.priority);
            newItem.from = {dd: 0, mm: 0, yy:0, hh:0};
            newItem.to = {dd: 0, mm: 0, yy:0, hh:0};
            userFound["todo"][index] = newItem;
            userFound.save();
            res.redirect("/homepage");
        }
    });
});

app.get("/settings", function(req, res){
    user.findById(id, function(err, userFound){
        if(err){
            console.log("Error!");
        } else{
            res.render(__dirname + "/public/views/settings", {failed: settingFailed, quantum: userFound.quantum, start: (userFound.startingTime+":00"), hrs:userFound.workingHoursPerDay, Usrnm:username});
        }
    });
    
});

app.post("/settings",function(req, res){
    user.findById(id, function(err, userFound){
        if(err){
            console.log("Error!");
        } else{
            var startHour = req.body.startHour.slice(0, 2);
            if(Number(req.body.workingHoursPerDay) + Number(startHour) > 24){
                settingFailed = true;
                res.redirect("/settings");
            }
            else{
                settingFailed = false;
                userFound.startingTime = startHour;
                userFound.quantum = req.body.quantum;
                userFound.workingHoursPerDay = req.body.workingHoursPerDay;
                userFound.save();
                res.redirect("/homepage");
            }
        }
    });
});

const port = process.env.PORT || 3000;

app.listen(port, function (req, res) {
    console.log("Server Started at " + String(port)) ;
});