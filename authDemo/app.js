var     express      =require ("express"),
        mongoose     =require("mongoose"),
        passport     =require("passport"),
        bodyParser   =require("body-parser"),
        User         =require("./models/user"),
        LocalStrategy=require("passport-local"),
        path = require('path'),
        formidable = require('formidable'),
        walk    = require('walk'),
        fs = require('fs-promise'),
        files   = [],
        passportLocalMongoose= require("passport-local-mongoose");

mongoose.connect("mongodb://localhost/auth_demo_app");



var app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(require("express-session")({
    secret:"Konrad is the best",
    resave:"false",
    saveUninitialized:"false"
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/", function(req,res){
    res.render("home");
});

app.get("/secret",isLoggedIn,function(req,res){
    res.sendFile(path.join(__dirname, 'views/index.html'));
});

app.get("/register" ,function(req,res){
    res.render("register");
});

app.post("/register" ,function(req,res){
    req.body.username;
    req.body.password;
    User.register(new User({username:req.body.username}),req.body.password, function(err,user){
        if(err){
            console.log(err);
            return res.render("register");
            }
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secret")
            });
    });
});

app.get("/login" ,function(req,res){
    res.render("login");
});


app.get("/uploads" ,function(req,res){
        var walker  = walk.walk('./uploads', { followLinks: true });
        walker.on('file', function(root, stat, next) {
            // Add this file to the list of files
        files.push(stat.name);
        next();
});
walker.on('end', function() {
    res.render("show", {thingVar:files});
});
});

app.post("/login" , passport.authenticate("local", {
    successRedirect: "/secret",
    failureRedirect: "/login"
    }) ,   function(req,res){
 });
 

app.get("/logout" ,function(req,res){
    req.logout();
    res.redirect("/");
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login")
}



app.post('/upload', function(req, res){

  // create an incoming form object
  var form = new formidable.IncomingForm();

  // specify that we want to allow the user to upload multiple files in a single request
  form.multiples = true;

  // store all uploads in the /uploads directory
  form.uploadDir = path.join(__dirname, '/uploads');

  // every time a file has been uploaded successfully,
  // rename it to it's orignal name
  form.on('file', function(field, file) {
    fs.rename(file.path, path.join(form.uploadDir, file.name));
  });

  // log any errors that occur
  form.on('error', function(err) {
    console.log('An error has occured: \n' + err);
  });

  // once all the files have been uploaded, send a response to the client
  form.on('end', function() {
    res.end('success');
  });

  // parse the incoming request containing the form data
  form.parse(req);

});



app.listen(process.env.PORT, process.env.IP, function(){
    console.log("server started....");
})