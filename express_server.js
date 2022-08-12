const express = require("express");
const app = express();
const PORT = 8080;
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const {
  getUserByEmail,
  generateRandomString,
  urlsForUser,
  urlDatabase,
} = require("./helpers");

///MIDDLEWARE //////
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
    maxAge: 24 * 60 * 60 * 1000, // 24 HOURS
  })
);
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

/// DATA ////

/// USERS DATABASE
let users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "klasdgfhkjrujrkeuijksdfg;lkjsdgfpslkfdgkjl", /// HashedPassword
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "kjaksfgjkljsldfkglkjfgjkfgsdkjg;sd;fglsdkfg", /// HashedPassword
  },
};

/// ROUTING ////

/// HOME PAGE
app.get("/", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  const user = users[req.session.user_id];
  const templateVars = {
    urls: urlsForUser(req.session.user_id),
    user,
  };
  res.render("urls_index", templateVars);
});
/// REQUESTING URLS IN JSON FORMAT
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
/// REQUEST MAIN PAGE WITH THE LIST OF SHORTENED URLS
app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  const user = users[req.session.user_id];
  const templateVars = {
    urls: urlsForUser(req.session.user_id),
    user,
  };
  res.render("urls_index", templateVars);
});

/// REQUEST TO NEW SHORT URL PAGE
app.get("/urls/new", (req, res) => {
  if (!req.session["user_id"]) {
    return res.redirect("/login");
  }
  const user = users[req.session.user_id];
  const templateVars = {
    user,
  };
  res.render("urls_new", templateVars);
});

/// REQUEST TO EDIT SHORT URLS
app.get("/urls/:id", (req, res) => {
  const user = users[req.session.user_id];
  const templateVars = {
    user,
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    urls: urlDatabase,
  };
  res.render("urls_show", templateVars);
});

/// POST REQUEST TO ADD NEW ID + LONG URL TO THE DATABASE
app.post("/urls", (req, res) => {
  let id = generateRandomString();
  urlDatabase[id] = { longURL: req.body.longURL, userID: req.session.user_id };
  res.redirect(`/urls/${id}`);
});

// TO REDIRECT FROM SHORT URL TO THE ACTUAL WEBSITE
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  const url = longURL["longURL"];

  if (longURL) {
    res.redirect(url);
  } else {
    res.statusCode = 404;
    res.send("<h2>404 Not Found<br>This short URL does not exist.</h2>");
  }
});
/// POST REQUEST TO DELETE URL
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect(`/urls`);
});

/// POST REQUEST TO UPDATE LONG URL
app.post("/urls/:id/update", (req, res) => {
  urlDatabase[req.params.id] = {
    longURL: req.body.newLongURL,
    userID: req.session.user_id,
  };
  res.redirect("/urls");
});

//// POST REQUEST FOR LOGIN  PAGE
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  for (let key in users) {
    let user = users[key];
    if (
      email === user.email &&
      bcrypt.compareSync(password, users[key].hashedPassword)
    ) {
      req.session.user_id = user.id;
      res.redirect("/urls");
      return;
    }
  }
  res.status(403).send("Error : Please re-enter your Email or Password!");
});

/// POST REQUEST TO LOGOUT & CLEAR USERID / SESSION
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

/// REQUEST TO GET THE REGISTRATION PAGE
app.get("/register", (req, res) => {
  if (req.session["user_id"]) {
    return res.redirect("/urls");
  }
  const templateVars = {};
  res.render("registration", templateVars);
});

/// POST REQUEST WHEN SUBMITTING REGISTRATION FORM
app.post("/register", (req, res) => {
  const email = req.body.email;
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  const checkIfEmailExist = getUserByEmail(email, users);
  if (email === "" || hashedPassword === "") {
    return res.status(400).send("Error: Please enter email & password ");
  }
  if (checkIfEmailExist) {
    return res.status(400).send(`Error: this email: ${email} already exists`);
  }
  const id = generateRandomString();

  users[id] = {
    id,
    email,
    hashedPassword,
  };
  req.session.user_id = id;
  res.redirect("/urls/");
});

//// REQUEST TO GET THE LOGIN PAGE
app.get("/login", (req, res) => {
  if (req.session["user_id"]) {
    return res.redirect("/urls");
  }
  res.render("login");
});

/// TO LISTEN FOR THE PORT
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
