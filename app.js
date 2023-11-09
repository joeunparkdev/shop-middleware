const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authMiddleware = require("./middlewares/auth-middleware.js");
mongoose.connect("mongodb://localhost:27017/shopping_mall");


const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));

const app = express();
const router = express.Router();

app.use("/api", express.urlencoded({ extended: false }), router);
app.use(express.static("assets", { extensions: ["js"] }));
const User = require("./models/user");

router.get("/users/me", authMiddleware, (req, res) => {
  const user = res.locals.user;
  res.json({ user });
});

//sign up
router.post("/users", async (req, res) => {
    const { email, nickname, password, confirmPassword } = req.body;
  
    bcrypt.hash(password, 10, async (hashError, hashPassword) => {
      if (hashError) {
        return res.status(500).json({ errorMessage: "비밀번호 해싱 중 오류가 발생했습니다." });
      }
  
      if (password !== confirmPassword) {
        res.status(400).send({
          errorMessage: "패스워드가 패스워드 확인란과 다릅니다.",
        });
        return;
      }
  
      // email or nickname이 동일한게 이미 있는지 확인하기 위해 가져온다.
      const existsUsers = await User.findOne({
        $or: [{ email }, { nickname }],
      });
      if (existsUsers) {
        res.status(400).send({
          errorMessage: "이메일 또는 닉네임이 이미 사용중입니다.",
        });
        return;
      }
  
      const user = new User({ email, nickname, password: hashPassword });
      await user.save();
  
      res.status(201).send({});
    });
  });
  
 // login
router.post("/auth", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      res.status(400).send({
        errorMessage: "이메일 또는 패스워드가 틀렸습니다.",
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      res.send({
        token: jwt.sign({ userId: user.userId }, "customized-secret-key"),
      });
    } else {
      res.status(400).send({
        errorMessage: "이메일 또는 패스워드가 틀렸습니다.",
      });
    }
  } catch (error) {
    res.status(500).send({
      errorMessage: "로그인 중 오류가 발생했습니다.",
    });
  }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
