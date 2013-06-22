var http = require('http');
var express = require('express');
var passport = require('passport');
var util = require('util');
var PodioStrategy = require('../../');

// API Access link for creating client ID and secret:
// https://code.google.com/apis/console/
var PODIO_CLIENT_ID = "...";
var PODIO_CLIENT_SECRET = "...";


// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Podio profile is
//   serialized and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


// Use the PodioStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Podio
//   profile), and invoke a callback with a user object.
passport.use(new PodioStrategy({
    clientID: PODIO_CLIENT_ID,
    clientSecret: PODIO_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/podio/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      // To keep the example simple, the user's Podio profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Podio account with a user record in your database,
      // and return that user instead.
      console.log(profile);
      return done(null, profile);
    });
  }
));


var app = express();

// configure Express
app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'keyboard cat' }));
  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});


app.get('/', function(req, res){
  res.render('index', { user: req.user });
});

app.get('/login', function(req, res){
  res.render('login', { user: req.user });
});

// GET /auth/podio
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Podio authentication will involve
//   redirecting the user to podio.com.  After authorization, Podio
//   will redirect the user back to this application at /auth/podio/callback
app.get('/auth/podio',
  passport.authenticate('podio'),
  function(req, res){
    // The request will be redirected to Podio for authentication, so this
    // function will not be called.
  });

// GET /auth/podio/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/podio/callback',
  passport.authenticate('podio', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

// Start the server
var server = http.createServer(app);
server.listen(3000, function() {
    console.log("Express server listening on port 3000");
});


// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}
