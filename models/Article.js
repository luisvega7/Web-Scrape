
// Require mongoose
var mongoose = require("mongoose");

// Create a schema class using mongoose's schema method
var Schema = mongoose.Schema;

var ArticleSchema = new Schema({
    //title
    title: {
        type: String,
        required: true,
        unique: true

    },
    //summary
    summary: {
        type: String,
        required: false
    },
    //link
    link: { 
        type: String,
        required: true,
        unique: true
    },
    note :{
        type: Schema.Types.ObjectId,
        ref: "Note"
    }

});
  // This creates our model from the above schema, using mongoose's model method
  let Article = mongoose.model("Article", ArticleSchema);

// Export the Article model
module.exports = Article;
