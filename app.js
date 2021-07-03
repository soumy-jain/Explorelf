var express = require("express");
var app=express();
var bodyParser=require("body-parser");
var mongoose=require("mongoose");
var passport=require("passport");
var localStrategy=require("passport-local");
var User=require("./modules/user");
var Question=require("./modules/questions");
var Answer=require("./modules/answer");
var Comment=require("./modules/comment");

mongoose.connect("", { useNewUrlParser: true });
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname+"/public"));


//passport setup/configuration
app.use(require("express-session")({
    secret: "I'm building Quora",
    resave: false,
    saveUninitialized: false
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  passport.use(new localStrategy(User.authenticate()));
  passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser());
  
  //for hiding options when user has logged in or logged Out
  app.use(function(req,res,next){
    res.locals.currentUser=req.user;
    next();
  });

app.get("/",function(req,res){
    // res.render("landing.ejs",{questions:questions});
    Question.find({},function(err,allQuestions){
        if(err){
            console.log(err);
        }else{
            res.render("landing.ejs",{questions:allQuestions});
        }
    });
});

app.get("/new",isLoggedIn,function(req,res){
    res.render("new.ejs");
});

app.post("/new",function(req,res){
    var Name=req.body.name;
    var Quest=req.body.question;
    var Cate = req.body.category;
    var Code = req.body.code;
    var Avatar = req.body.photoURL;
    var temp = new Date();
    var Time = temp.toString();
    Time = Time.slice(0,21);
    var likes = 0;
    var newQuestion={user:Name, category: Cate, question:Quest, like:likes, avatar:Avatar, time:Time, code:Code};
    // questions.push(newQuestion);
    Question.create(newQuestion,function(err,question){
        if(err){
            console.log(err);
        } else{
            console.log("new question added");
        }
    });
    res.redirect("/");
});
app.get("/question/:id",function(req,res){
    var id=req.params.id;
    Question.findById(id).populate("answers").exec(function(err,foundQuestion){
        if(err){
            console.log(err);
        }
        else{
            console.log(foundQuestion);
            res.render("question.ejs",{quest:foundQuestion});
        }
    })
})


app.get("/question/:id/answers/new",isLoggedIn,function(req,res){
    Question.findById(req.params.id,function(err,question){
        if(err){
            console.log(err);
        }
        else{

            res.render("newAnswer.ejs",{quest:question});
        }
    })
});

app.post("/question/:id/answers",function(req,res){
    Question.findById(req.params.id, function(err,question){
        if(err){
            console.log(err);
        }
        else{
            console.log(req.body.ans);
            Answer.create(req.body.ans,function(err,answer){
                if(err){
                    console.log(err);
                }
                else{
                    question.answers.push(answer);
                    question.save();
                    res.redirect("/question/"+question._id);
                }
            })
        }
    })
});

app.get("/question/:id/:quesid/comments/new",isLoggedIn, function(req,res){
    Answer.findById(req.params.id,function(err,answer){
        if(err){
            console.log(err);
        }
        else{
            res.render("newComment.ejs",{ans:answer,quesid:req.params.quesid});
        }
    })
});

app.post("/question/:id/:quesid/comments",function(req,res){
    Answer.findById(req.params.id ,function(err,answer){
        if(err){
            console.log(err)
        }
        else{
            console.log(req.body.comment);
            Comment.create(req.body.comment,function(err,comment){
                if(err)
                {
                    console.log(err);
                }
                else{
                    console.log(comment);
                    answer.comments.push(comment);
                    answer.save();
                    res.redirect("/question/"+req.params.quesid);
                }
            })
        }
    })
})


app.get("/myQuestion", isLoggedIn, (req, res, next) => {
    Question.find({},function(err,allQuestions){
        if(err){
            console.log(err);
        }else{
            res.render("myQuestion.ejs",{questions:allQuestions});
        }
    });
})



//AuTH routes
app.get("/register",function(req,res){
    res.render("register.ejs");
  });
  
  app.post("/register",function(req,res){
    var newUser=new User({username: req.body.username, place:req.body.place, profile:req.body.photo});
    //register this user using passport
    User.register(newUser,req.body.password,function(err,user){
      if(err){
        console.log(err);
        return res.render("register.ejs");
      }
      passport.authenticate("local")(req,res,function(){
        res.redirect("/");
      });
    });
  });
  
  //login routes
  app.get("/login",function(req,res){
    res.render("login.ejs");
  });
  
  app.post("/login",passport.authenticate("local",{
    successRedirect:"/",
    failureRedirect:"/login"
  }), function(req,res){
    res.send("Login logic happes here");
  });
  
  //logout routes
  app.get("/logout",function(req,res){
    req.logout();
    res.redirect("/");
  });
  
  function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
      return next();
    }
    res.redirect("/login");
  }


app.listen(5000,function(){
    console.log("App running at 5000")
});
