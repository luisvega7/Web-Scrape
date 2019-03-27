
let cheerio = require("cheerio");
let express = require("express");
let axios = require("axios");
let exphbs = require("express-handlebars");
let mongoose = require("mongoose");
let logger = require("morgan");
let db = require("./models");

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoScrape";

mongoose.set("userCreateIndex", true);
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });
let PORT = process.env.PORT || 3000


// Instantiate our Express App
let app = express();

// Parse request body as JSON
app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Set Handlebars.
let handleBars = require("express-handlebars");
app.engine("handlebars", handleBars({ defaultLayout: "main" }));
app.set("view engine", "handlebars");


// scrape script
// =============

app.get("/scrape", function (req, res) {
  // Scrape the Bleacher Report  website
  axios.get("http://bleacherreport.com/oakland-raiders").then(function (response) {
    var $ = cheerio.load(response.data);
    //We grab every h2 within the article tag 
    $(".articleSummary").each(function (i, element) {
      let result = {};
      let summary = $(element).find("p").text();
      if(!summary){
        console.log("no summary" + result);
        result.summary = null;
      }else {
        result.summary = summary;
      }
      result.title = $(element).find("h3").text();
       result.link = $(element).find("a").attr("href");
      // Create a new Article using the `result` object built from scraping

      db.Article.create(result).then(function (err, dbArticle) {
        if (err) {
          console.log(err);

        } else {
          console.log(dbArticle);


        }
      });
    });
    res.send("Scrape Complete");
  });
});




//Routes....


//get home route 
// app.get("/", function(req, res) {
//   db.Article.find({}, function(dbArticle) {
//       let artObject = {article: dbArticle};
//     res.render("index", artObject);
//   }).catch(function(err) {
//     res.json(err);
//   });
// });


app.get("/articles", function (req, res) {
  //grab every article we are requesting
  db.Article.find({})
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

app.get("/articles/:id", function (req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(dbArticle => {
      // If we were able to successfully find a movie with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(err => {
      // If an error occurred, send it to the client
      res.json(err);
    });
});


// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function (req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(dbNote => {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(dbArticle => {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(err => {
      // If an error occurred, send it to the client
      res.json(err);
    });
});


//route for null
app.get("/null", function(req, res) {
  db.Article.find({summary:null}).then(function(dbArticle) {
      res.json(dbArticle);
  }).catch(function(err) {
      res.json(err);
  });
});
//route for summary
app.get("/summary", function(req, res) {
  db.Article.find({summary:{$ne: null}}).then(function(dbArticle) {
      res.json(dbArticle);
  }).catch(function(err) {
      res.json(err);
  });
});

// Create a new noteç
app.post("/notes/save/:id", function (req, res) {
  // Create a new note and pass the req.body to the entry
  var newNote = new Note({
    body: req.body.text,
    title: req.params.title
  });
  console.log(req.body)
  // And save the new note the db
  newNote.save(function (error, note) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise
    else {
      // Use the article id to find and update it's notes
      Article.findOneAndUpdate({ "_id": req.params.id }, { $push: { "notes": note } })
        // Execute the above query
        .exec(function (err) {
          // Log any errors
          if (err) {
            console.log(err);
            res.send(err);
          }
          else {
            // Or send the note to the browser
            res.send(note);
          }
        });
    }
  });
});





// Listen on the port
app.listen(PORT, function () {
  console.log("Listening on port: " + PORT);
});
