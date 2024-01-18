require('dotenv').config()
const express = require('express');
const fs = require('fs');
const AppleAuth = require('apple-auth');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const pg = require('pg');



const config = JSON.parse(fs.readFileSync("./config/config.json"));
const applePrivateKey = fs.readFileSync("./config/AuthKey_DCP9TAQA3W.p8").toString();

const auth = new AppleAuth(config, applePrivateKey, "text");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true
})

app.post('/consultaEmail', async (req, res) => {
    try {
        console.log("req1", req.body.data);
        const result = await pool.query(`Select correo from usuarios where correo = $1`, [req.body.data])
        
        if(!result.rows[0]){
            return res.status(400).json({"error":"correo no encontrado"})
        }else {
            return res.status(200).json(result.rows[0])
        }

    }catch(error){
        console.error(error)
    }
} )

app.get('/fecha', async (req, res) => {
    try {
        const result = await pool.query(`SELECT NOW()`)
        return res.json(result.rows[0])

    }catch(error){
        return error
    }
} )

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