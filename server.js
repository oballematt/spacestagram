const express = require("express");
const exphbs = require("express-handlebars");
const path = require("path");
const compression = require('compression')
require("dotenv").config();

const port = process.env.PORT || 3000;

const app = express();



//Handlebars Middleware
app.engine(
  "handlebars",
  exphbs.engine({
    defaultLayout: "main",
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true,
    },
  })
);

app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

//Compression Middleware
app.use(compression({
  level: 9,
  threshold: 0
}))

//Express Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', require('./routes/marsRoverRoute'))

app.get("/", (req, res) =>
  res.render("home")
);

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
