/**
 * account file, user account functionalities
 */
module.exports = function (app) {
    var utility = require('./../utility');
    var connection = utility.connection;
    var GoogleAuth = utility.GoogleAuth;
    var hash = utility.hash;

    //this endpoint deletes the user from the database and removes all data associated with them.
    app.post('/deleteAccount', function (req, res) {
        //deep delete the user data and all of the data it points to
        var user = JSON.parse(req.body);
        var email = user.email;


        //get the user ID from the email address:
        connection.query("SELECT * FROM users WHERE email = ?", [email], function (err, result) {
            if (err) {
                res.status(500).send({ success: false, error: error });
            } else {
                console.log("inside user");
                var id = result[0].idUser;
                //query notes for all with this userID:
                connection.query("SELECT * FROM notes WHERE userID = ?", [id], function (err, result) {
                    if (err) {

                    } else {
                        console.log("inside notes");
                        for (var i = 0; i < result.length; i++) {
                            console.log("inside for loop");
                            //delete all the summaries:
                            connection.query("DELETE FROM summaries WHERE noteID = ?", [result[i].noteID], function (err, result) {
                                if (err) {
                                    console.log("Couldn't delete summary");
                                }
                            });

                            //delete the actual note:
                            connection.query("DELETE FROM notes WHERE noteID = ?", [result[i].noteID], function (err, result) {
                                if (err) {
                                    console.log("Couldn't delete note");
                                }
                            });
                        }

                        //all notes deleted, delete the actual user!
                        connection.query("DELETE FROM users WHERE idUser = ?", [id], function (err, result) {
                            if (err) {
                                console.log("Couldn't delete user");
                            } else {
                                console.log("Deleting user!");
                                res.status(200).send({ success: true });
                            }
                        });
                    }
                });
            }
        });
    });

    //lets the user create an account without google authentication by using our database instead.
    app.post('/createAccount', function (req, res) {
        //res.status(500).send({success: false, body: JSON.parse(req.body).name})
        try {
            var user = JSON.parse(req.body);
        } catch (error) {
            console.log('error', error); // TODO this error is always undefined instead define the error here
            // TODO in this case the error would be, invalid format of body, not in proper JSON format
            res.status(500).send({ success: false, error: "Invalid JSON format" });
        }
        var name = user.name;
        var email = user.email;
        var password = user.password;
        var prefersEmailUpdates = user.prefersEmailUpdates;
        var hashedPassword = hash(password);

        //check if this email exists already in the database, if so, return an error.
        connection.query("SELECT * FROM users WHERE email = ?", [email], function (err, result) {
            console.log("inside select");
            if (err) {
                console.log('err', err);
                res.status(500).send({ success: false, error: err });
            }
            console.log('result', result);
            if (result.length > 0) {
                //sorry, this email is already taken!
                console.log("Email address already taken.");
                console.log("email collison: " + result[0].email);
                res.status(500).send({ success: false, error: "This email address is already taken." });
            } else {

                //bcrypt.hash(password, saltRounds, function(err, password) {
                // Store hash in your password DB.
                var newUser = {
                    name: name,
                    email: email,
                    password: hashedPassword,
                    feedback: '',
                    prefersEmailUpdates: prefersEmailUpdates,
                    noteCount: 0
                }
                connection.query('INSERT INTO users SET ?', newUser, function (err, result) {
                    console.log("inside insert");
                    if (err) {
                        res.status(500).send({ success: false, error: err })
                    } else {
                        res.status(200).send({ success: true });
                    }
                });
                //});
            }
        });
    });

    //login endpoint
    //allows the user to login with google authentication
    app.post('/loginToGoogle', function (req, res) {
        if (GoogleAuth.isSignedIn.get()) {
            //user is already signed in!
        } else {
            // User is not signed in. Start Google auth flow.
            GoogleAuth.signIn();
        }

        var token = jwt.sign(payload, "secretString", {
            expiresIn: 60 * 60 * 24 // expires in 24 hours
        });

        res.status(200).send({ success: true, token: token });

        //return JWT token
    });

    app.post('/login', function (req, res) {
        //login without google API
        //email and password given
        try {
            var user = JSON.parse(req.body);
        } catch (error) {
            res.status(500).send({ success: false, error: err });
        }

        var email = user.email;
        var password = user.password;
        var hashedPassword = hash(password);

        //scrypt.kdf(password, )
        //check hashed password against database:
        connection.query("SELECT * FROM users WHERE email = ? AND password = ?", [email, hashedPassword], function (err, result) {
            if (err) {
                res.status(500).send({ success: false, error: err });
            } else {
                console.log(result);
                const payload = {
                    admin: email
                };

                var token = jwt.sign(payload, app.get('superSecret'), {
                    expiresIn: 60 * 60 * 24 // expires in 24 hours
                });

                if (result.length == 1) {
                    //do JWT stuff
                    res.status(200).send({ success: true, token: token });
                } else {
                    res.status(500).send({ success: false, error: "Username or password is incorrect." });
                }
            }
        });
    });
}