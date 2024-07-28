const express = require("express");
const pool = require("./db");

const app = express();
const PORT = 5002;

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

app.post("/api/signup", (req, res) => {
  const { username, email, password } = req.body;

  if (!username)
    return res.status(401).send("ユーザーネームを入力してください。");
  if (!email) return res.status(401).send("メールアドレスを入力してください。");
  if (!password) return res.status(401).send("パスワードを入力してください。");

  pool.query(
    "SELECT username FROM users WHERE username = $1",
    [username],
    (errors, response) => {
      if (errors) throw errors;

      if (response.rowCount > 0)
        return res.status(409).send("このユーザーネームは使用されています。");
    }
  );

  pool.query(
    "SELECT email FROM users WHERE email = $1",
    [email],
    (errors, response) => {
      if (errors) throw errors;

      if (response.rowCount > 0)
        return res.status(409).send("このメールアドレスは使用されています。");
    }
  );

  pool.query(
    "INSERT INTO users (username, email, password) VALUES ($1, $2, $3)",
    [username, email, password],
    (errors) => {
      if (errors) throw errors;

      return res.status(200).send("ユーザーの作成に成功しました。");
    }
  );
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
