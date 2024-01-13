const express = require('express');
const fs = require('fs');
const AppleAuth = require('apple-auth');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');

const config = JSON.parse(fs.readFileSync("./config/config.json"));
const applePrivateKey = fs.readFileSync("./config/AuthKey_M62NV4DLY5.p8").toString();

const auth = new AppleAuth(config, applePrivateKey, "text");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/auth", async (req, res) => {
  try {
    const response = await auth.accessToken(req.body.authorization.code);
    const idToken = jwt.decode(response.id_token);

    const user = { id: idToken.sub };
    if (idToken.email) user.email = idToken.email;

    if (req.body.user) {
      const { name } = JSON.parse(req.body.user);
      user.name = name;
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

const PORT = 3001;
const server = app.listen(PORT, () => {
    const host = server.address().address;
    const port = server.address().port;

    console.log(`Server running at http://${host}:${port}`);
});