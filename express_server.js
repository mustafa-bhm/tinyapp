const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs"); // setting up ejs as the view engine.
app.use(express.urlencoded({ extended: true }));

function generateRandomString() {
  let char = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomStr = "";
  for (let i = 0; i < 6; i++) {
    randomStr += char[Math.floor(Math.random() * char.length)];
  }
  return randomStr;
}

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
/// Route for urls_index
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});
/// GET Route to Show the Form
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

/// Route for urls_show
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
  };

  res.render("urls_show", templateVars);
});

/// Post request & add new id + long url to urlDatabase & redirect to :id
app.post("/urls", (req, res) => {
  // Log the POST request body to the console
  let id = generateRandomString();
  let longUrl = req.body.longURL;
  urlDatabase[id] = longUrl;

  console.log(urlDatabase);
  res.redirect("/urls/:id"); // should to /urls/:id. with the new created id
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
