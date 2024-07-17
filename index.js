const express = require("express");
const cors = require("cors");
const pool = require("./db");
const app = express();
const PORT = 5002;

const corsOption = {
  origin: ["http://localhost:5173"],
  optionSuccessStatus: 200,
};

app.use(cors(corsOption));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("first Page");
});

app.get("/api", (req, res) => {
  pool.query("SELECT * FROM users", (errors, results) => {
    if (errors) throw errors;
    return res.status(200).json(results.rows);
  });
});

app.post("/api/login", (req, res) => {
  const { username, email, password } = req.body;

  pool.query(
    "SELECT username, email, password FROM users WHERE username = $1",
    [username],
    (errors, results) => {
      if (errors) throw errors;

      if (results.rowCount === 0 || null) {
        return res.status(404).send("ユーザーネームが違います。");
      }
      const user = results.rows[0];
      if (user.email !== email) {
        return res.status(401).send("メールアドレスが違います。");
      }
      if (user.password !== password) {
        return res.status(401).send("パスワードが違います。");
      }

      return res.status(200).send("ログインに成功しました。");
    }
  );
});

app.post("/api/signup", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const checkUsername = await pool.query(
      "SELECT username FROM users WHERE username = $1",
      [username]
    );

    if (checkUsername.rows.length > 0) {
      return res.status(409).send("このユーザーネームは使用されています。");
    }

    const checkEmail = await pool.query(
      "SELECT email FROM users WHERE email = $1",
      [email]
    );

    if (checkEmail.rows.length > 0) {
      return res.status(409).send("このメールアドレスは使用されています。");
    }
    const result = await pool.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3)",
      [username, email, password]
    );

    res.status(201).send("ユーザーの作成に成功しました。");
  } catch (err) {
    console.error("Error executing query:", err);
    res.status(500).send("ユーザーの作成に失敗しました。");
  }
});

app.delete("/api/:id", (req, res) => {
  const id = req.params.id;

  pool.query("SELECT * FROM users WHERE id = $1", [id], (errors, results) => {
    if (errors) throw errors;

    const notUser = results.rows.length;
    if (!notUser) {
      return res.status(404).send("ユーザーが存在しません。");
    }
  });

  pool.query("DELETE FROM users WHERE id = $1", [id], (errors, results) => {
    if (errors) throw errors;
    return res.status(200).send("削除に成功しました。");
  });
});

app.listen(PORT, () => {
  console.log(`サーバー${PORT}を立ち上げました。`);
});
