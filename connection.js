const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

//connect to db
mongoose.connect("mongodb://localhost/auth", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

mongoose.connection
  .once("open", function () {
    console.log("connection has been made, now make fireworks 1 2 3...");
  })
  .on("error", function (error) {
    console.log("Connection error: ", error);
  });
