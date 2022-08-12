const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
// const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],

    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);
// app.use(cookieParser());
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
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const searchByEmail = (email, users) => {
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return null;
};

let users = {
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
/// function to find urls for each user
const urlsForUser = (id) => {
  let urls = {};

  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      urls[shortURL] = {
        longURL: urlDatabase[shortURL].longURL,
      };
    }
  }
  return urls;
};

app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
/// Route for urls_index
app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  const user = users[req.session.user_id];
  const templateVars = {
    urls: urlsForUser(req.session.user_id),
    user,
  };
  // console.log("----", req.cookies["user_id"]);
  // const templateVars = { user, urls: urlDatabase };
  res.render("urls_index", templateVars);
});
/// GET Route to Show the Form
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

/// Route for urls_show
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

/// Post request & add new id + long url to urlDatabase & redirect to :id
app.post("/urls", (req, res) => {
  let id = generateRandomString();

  urlDatabase[id] = { longURL: req.body.longURL, userID: req.session.user_id };
  console.log("+++++", urlDatabase);

  res.redirect(`/urls/${id}`); // should redirect to /urls/:id. with the new created id
});

// to redirect from Short url to long url
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  const url = longURL["longURL"];

  if (longURL) {
    res.redirect(url);
    // console.log("00000", longURL);
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
  urlDatabase[req.params.id] = {
    longURL: req.body.newLongURL,
    userID: req.session.user_id,
  };

  res.redirect("/urls");
});

//// POST for login updated
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

/// to logout & clear user_id
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

/// TO GET the registration page
app.get("/register", (req, res) => {
  if (req.session["user_id"]) {
    return res.redirect("/urls");
  }
  const templateVars = {};
  res.render("registration", templateVars);
});

/// handling POST req when submitting the reg form

app.post("/register", (req, res) => {
  const email = req.body.email;
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  const checkIfEmailExist = searchByEmail(email, users);
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

//// GET login
app.get("/login", (req, res) => {
  if (req.session["user_id"]) {
    return res.redirect("/urls");
  }
  res.render("login");
});

/// to listen for the port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
