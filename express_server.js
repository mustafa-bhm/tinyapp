const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser");

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
//// helper functions /////

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
const searchByEmail = (email, users) => {
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return null;
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};
app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
/// Route for urls_index
app.get("/urls", (req, res) => {
  const user = users[req.cookies.user_id];
  const templateVars = { user, urls: urlDatabase };
  res.render("urls_index", templateVars);
});
/// GET Route to Show the Form
app.get("/urls/new", (req, res) => {
  const user = users[req.cookies.user_id];
  const templateVars = {
    user,
    // urls: urlDatabase, /// check if this line can be deleted without any side effects
  };

  res.render("urls_new", templateVars);
});

/// Route for urls_show
app.get("/urls/:id", (req, res) => {
  const user = users[req.cookies.user_id];
  const templateVars = {
    user,
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    urls: urlDatabase,
  };

  res.render("urls_show", templateVars);
});

/// Post request & add new id + long url to urlDatabase & redirect to :id
app.post("/urls", (req, res) => {
  let id = generateRandomString();
  let longUrl = req.body.longURL;
  urlDatabase[id] = longUrl;
  res.redirect(`/urls/${id}`); // should redirect to /urls/:id. with the new created id
});

// to redirect from Short url to long url
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];

  if (longURL) {
    res.redirect(longURL);
  } else {
    res.statusCode = 404;
    res.send("<h2>404 Not Found<br>This short URL does not exist.</h2>");
  }
});
/// POST route to remove url
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect(`/urls`);
});

/// to Update Urls and redirect to urls page
app.post("/urls/:id/update", (req, res) => {
  urlDatabase[req.params.id] = req.body.newLongURL;
  res.redirect("/urls");
});

//// POST for login updated
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  for (let key in users) {
    let user = users[key];
    if (email === user.email && password === user.password) {
      res.cookie("user_id", user.id);
      res.redirect("/urls");
      return;
    }
  }
  res.status(403).send("Error : Please re-enter your Email or Password!");
});

/// to logout & clear user_id
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

/// TO GET the registration page
app.get("/register", (req, res) => {
  if (req.cookies["user_id"]) {
    return res.redirect("/urls");
  }
  const templateVars = {};
  res.render("registration", templateVars);
});

/// handling POST req when submitting the reg form

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const checkIfEmailExist = searchByEmail(email, users);
  if (email === "" || password === "") {
    return res.status(400).send("Error: Please enter email & password ");
  }
  if (checkIfEmailExist) {
    return res.status(400).send(`Error: this email: ${email} already exists`);
  }
  const id = generateRandomString();

  users[id] = {
    id,
    email,
    password,
  };

  res.cookie("user_id", id);

  res.redirect("/urls/");
});

//// GET login
app.get("/login", (req, res) => {
  if (req.cookies["user_id"]) {
    return res.redirect("/urls");
  }
  res.render("login");
});

/// to listen for the port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
