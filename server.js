const express = require('express');
const FS = require('fs');
const app = express();
const PORT = 6060;

app.use(express.json());
app.use(express.static("public"));

app.post("/api/auth/login", (req, res) => {
    const {email, password} = req.body;
    if (!email || !password) {
        return res.status(400).json({
            "success": false,
            "error": "Email and password are required"
        });
    }
    FS.readFile(`db/users.json`, 'utf8', (err, data) => {
        if(err){
            return res.status(500).json({
                "success": false,
                "error": "Server error"
            });
        }

        const users = JSON.parse(data);
        let existingUser = {};
        for(let i=0; i<users.length; i++){
            if(users[i].email === email && users[i].password === password){
                existingUser = users[i];
            }
        }
        console.log(existingUser);
        if(!existingUser){
            res.json({
                "success": false,
                "error": "Invalid credentials"
            }).status(401);
            return;
        }
        console.log(existingUser);
        res.json({
            "success": true, 
            "user": existingUser
        }).status(200);
    })
})

app.post("/api/auth/signup", (req,res) => {
    const {id, username, email, password, isAdmin} = req.body;
    if (!email || !password || !username) {
        return res.status(400).json({
            "success": false,
            "error": "Required fields are missing"
        });
    }
    FS.readFile(`db/users.json`, 'utf8', (err, data) => {
        if(err){
            return res.status(500).json({
                "success": false,
                "error": "Server error"
            });
        }

        const users = JSON.parse(data);
        const newUser = {id, username, email, password, isAdmin};
        const isExist = users.some(user => user.email === newUser.email)

        if(isExist){
            res.json({
                "success": false,
                "error": "User already exists"
            }).status(500);
            return;
        }
        users.push(newUser);

        FS.writeFile(`db/users.json`, JSON.stringify(users, null, 2), (err) => {
            if(err){
                return res.status(500).json({
                    "success": false,
                    "error": "Failed to save user"
                });
            }
            return res.status(201).json({
                "success": true, 
                "user": newUser
            });
        });
    })
})

app.listen(PORT, () => {
    console.log(`server is running on http://localhost:${PORT}`);
})