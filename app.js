var express=require('express');

var bodyParser=require('body-parser');

var http=require('http');

var MongoClient = require('mongodb').MongoClient;

var app=express();


// mongo connect
const connection = (closure) => {
    return MongoClient.connect('mongodb://project:tracking@ds229648.mlab.com:29648/project_tracking', (err, db) => {
        if (err) return console.log(err);

        closure(db);
    });
};

// body-parser

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));

//access-control

app.use(function(req,res,next){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();	
    });

// for response    
//  let err = {
//         status: 400,
//         data: [],
//         message:null
// };
// for creating user 

app.post('/adduser',function(req,res){
    var newUser={
        username:req.body.username,
        email:req.body.email,
        password:req.body.password,
        role:req.body.role
    }
    connection((db)=>{
        db.collection('allusers')
        .insertOne(newUser)
        .then((User)=>{
            res.send(newUser);
        });
    });
});

//login find object

app.post('/findprofile',function(req,res){
    var user_id={
        email:req.body.email,
        password:req.body.password,
    }
    connection((db)=>{
        db.collection('allusers')
        .findOne(user_id)
        .then((fullProfile)=>{
            if(fullProfile && fullProfile.username){
                console.log(fullProfile);
                res.send(fullProfile);
            }else{
                res.status(400).send({'status':'profile invalid'})
                console.log("invalid")
            }
        });
    });
});

//get all users
app.get('/getallusers',function(req,res){
    connection((db)=>{
        db.collection('allusers')
        .find()
        .toArray({})
        .then((alusers)=>{
            if(allusers){
               
                res.send(allusers);
            }else{
                res.status(400).send({'status':'cannot get'});
            }
        })
    })
})
//forgot password, get object using email

app.post('/forgotpwd',function(req,res){
    var user_email={ 
        email:req.body.email,
    }
    connection((db)=>{
        db.collection('allusers')
        .findOne(user_email)
        .then((fullProfile)=>{
            if(fullProfile && fullProfile.username){
                res.send(fullProfile);
            }else{
                res.status(400).send({'status':'invalid user'})
            }
        });
    });
});

//change paasword

app.post('/changepassword',function(req,res){
    var old_pwd={
        email:req.body.email,
        password:req.body.password
    };
    var new_pwd={
        updatepassword:req.body.updatepassword,
    };
    connection((db)=>{
        db.collection('allusers')
        .updateOne(old_pwd,{"$set":(new_pwd)},function(err,result){
            res.send(new_pwd);

        });
    });
});

// get dashbord details

app.get('/projectlists',function(req,res){
    connection((db)=>{
        db.collection('projects')
        .find()
        .toArray({})
        .then((dash_details)=>{
            if(dash_details){
                res.send(dash_details);
            }else{
                res.send({'status':'cannot get'})
            };
        });
    });
});

// for updating project status

app.post('/projectupdate',function(req,res){
    var selected_project={
        appname:req.body.appname,
        client:req.body.client
    };
    console.log(selected_project);
    var for_update={
        date:req.body.date,
        appstatus:req.body.appstatus,
        comment:req.body.comment
    }
connection((db)=>{
    db.collection('projects')
    .updateOne(selected_project,{"$set":(for_update)},function(err,result){
        res.send(result);
    });
});
});

// create new project

app.post('/newproject',function(req,res){
    var new_project={
        appname:req.body.appname,
        client:req.body.client,
        timelimit:req.body.timelimit,
        startdate:req.body.startdate,
        description:req.body.description
    }
    connection((db)=>{
        db.collection('projects')
        .insertOne(new_project)
        .then((project)=>{
            res.send(project);
        })
    })
});











var port=process.env.PORT || '4000';

app.set('port',port);

// var server=http.createServer(app);

app.listen(port, () => console.log(`Running on localhost:4000`));