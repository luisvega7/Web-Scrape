// Grab the db movies as a json
$.getJSON("/Articles", function (data) {
    // For each one
    for (var i = 0; i < data.length; i++) {
        // Display the apropos information on the page
        $("#Articles").append("<p data-id='" + data[i]._id + "'>" + "Title: " + data[i].title + 
        "<br />" + "Summary : " + data[i].summary + 
        "<br />" + "Link: " + data[i].link + "</p>");
    }
});


// Whenever someone clicks a p tag
$(document).on("click", "p", function () {
    // Empty the notes from the note section
    $("#notes").empty();
    $('#noteModal').modal('show')
    // Save the id from the p tag
    var thisId = $(this).attr("data-id");

    $.ajax({
        method: "GET",
        url: "/Articles/" + thisId
    })
        // With that done, add the note information to the page
        .then(function (data) {
            console.log(data);
            // The title of the movie
            $("#notes").append("<h2>" + data.title + "</h2>");
            // A textarea to add a new note body
            $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
            // A button to submit a new note, with the id of the article saved to it
            $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

            // If there's a note in the article
            if (data.note) {
                // Place the body of the note in the body textarea
                $("#notes").val(data.note.body);
            }
        });
});

// When you click the savenote button
$(document).on("click", "#saveNote", function() {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");
  
    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
      method: "POST",
      url: "/articles/" + thisId,
      data: {
        // Value taken from note textarea
        body: $("#notes").val()
      }
    })
      // With that done
      .then(function(data) {
        // Log the response
        console.log(data);
      });
  
    // Also, remove the values entered in the input and textarea for note entry
    $("#notes").val("");
  });
  