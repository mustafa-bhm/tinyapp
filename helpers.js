//// helper functions /////

//// to search user by email
const getUserByEmail = (email, users) => {
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return null;
};

/// To generat randome string
function generateRandomString() {
  let char = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomStr = "";
  for (let i = 0; i < 6; i++) {
    randomStr += char[Math.floor(Math.random() * char.length)];
  }
  return randomStr;
}

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

module.exports = {
  getUserByEmail,
  generateRandomString,
  urlsForUser,
  urlDatabase,
};
