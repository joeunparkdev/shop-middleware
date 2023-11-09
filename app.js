const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

mongoose.connect("mongodb://localhost:27017/shopping_mall", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));

const app = express();
const router = express.Router();

app.use("/api", express.urlencoded({ extended: false }), router);
app.use(express.static("assets"));

const User = require("./models/user");

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
  
  //login
router.post("/auth", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  // NOTE: 인증 메세지는 자세히 설명하지 않는것을 원칙으로 한다: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#authentication-responses
  if (!user) {
    res.status(400).send({
      errorMessage: "이메일 또는 패스워드가 틀렸습니다.",
    });
    return;
  }
  bcrypt.compare(password, user.password, (compareError, isMatch) => {
    if (compareError || !isMatch) {
        res.status(400).send( {
            errorMessage: "이메일 또는 패스워드가 틀렸습니다.",
        })
    }
  })

  res.send({
    token: jwt.sign({ userId: user.userId }, "customized-secret-key"),
  });
});
  app.listen(8080, () => {
    console.log("서버가 요청을 받을 준비가 됐어요");
  });