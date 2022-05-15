require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const router = express.Router();
const formidable = require("express-formidable");

//authentification
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

const app = express();

app.use(cors());
app.use(formidable());

//local port :
const local = 4000;

router.get("/", (req, res) => {
  res.json("Welcome to Marvel API !");
});

//List of comics
router.get("/comics", async (req, res) => {
  try {
    const response = await axios.get(
      `https://lereacteur-marvel-api.herokuapp.com/comics?apiKey=${process.env.MARVEL_API_KEY}`
    );
    res.json(response.data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
//List of comics containing a specific character
router.get("comics/:characterId", async (req, res) => {
  try {
    const response = await axios.get(
      `https://lereacteur-marvel-api.herokuapp.com/comics/${req.params.characterId}?apiKey=${process.env.MARVEL_API_KEY}`
    );
    res.json(response.data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//List of characters
router.get("/characters", async (req, res) => {
  try {
    const response = await axios.get(
      `https://lereacteur-marvel-api.herokuapp.com/characters?apiKey=${process.env.MARVEL_API_KEY}`
    );

    res.json(response.data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//List of infos of a specific character
router.get("/character/:characterId", async (req, res) => {
  try {
    const response = await axios.get(
      `https://lereacteur-marvel-api.herokuapp.com/character/${req.params.characterId}?apiKey=${process.env.MARVEL_API_KEY}`
    );
    res.json(response.data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//route pour créer un nouveau compte
router.post("/signup", async (req, res) => {
  try {
    const userExist = await User.findOne({ email: req.fields.email });

    if (userExist) {
      res.status(400).json({ message: "Le mail existe déjà" });
    } else if (!req.fields.username) {
      res.status(400).json({ message: "Il manque un pseudo" });
    } else {
      const salt = uid2(32);
      const hash = SHA256(req.fields.password + salt).toString(encBase64);
      const token = uid2(16);
      const newUser = new User({
        email: req.fields.email,
        account: {
          username: req.fields.username,
        },
        token: token,
        hash: hash,
        salt: salt,
      });
      await newUser.save();
      res.status(200).json({
        _id: newUser._id,
        token: newUser.token,
        account: newUser.account,
      });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//deuxieme route pour la connection
router.post("/login", async (req, res) => {
  try {
    const userToCheck = await User.findOne({ email: req.fields.email });
    if (userToCheck === null) {
      res.status(401).json({ message: "Unauthorized" });
    } else {
      const newHash = SHA256(req.fields.password + userToCheck.salt).toString(
        encBase64
      );
      if (userToCheck.hash === newHash) {
        res.json({
          _id: userToCheck._id,
          token: userToCheck.token,
          account: userToCheck.account,
        });
      } else {
        res.status(401).json({ message: "Unauthorized !" });
      }
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.all("*", (req, res) => {
  res.status(400).json("Route introuvable");
});

app.listen(process.env.PORT || local, () => {
  console.log("Server started !!");
});
