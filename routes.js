module.exports.setRoutes = setRoutes;
function setRoutes(app, db, passport, faker){

    app.get('/', (req, res) => {
        res.render('home');
    });
    
    
    app.route('/login')
        .get((req, res) => {
            res.render('login');
        })

        .post(async (req, res) => {
            const user = new db.User({
                username: req.body.username,
                password: req.body.password
            });
            req.login(user, function(err) {
                if (err) {
                    console.log(err);
                    res.redirect("/login");
                }else{
                    passport.authenticate("local", {failureRedirect: '/login'})(req, res, function() {
                        renderSecrets(db, res);
                    });
                }
            });
        });


    app.route('/register')
        .get((req, res) => {
            res.render('register');
        })

        .post((req, res) => {
            const username = req.body.username;
            const password = req.body.password;

            db.User.register({username:username, active: false}, password, function(err, user) {
                if (err) {
                    console.log(err);
                    res.redirect("/register");
                }else{
                    passport.authenticate("local")(req, res, function() {
                        renderSecrets(db, res);
                    });
                    }
                }
            );
        });


    app.get('/secrets', async (req, res) => {
        renderSecrets(db, res);
    });


    app.route('/submit')
        .get((req, res) => {
            if(req.isAuthenticated()){
                res.render('submit');
            }else{
                res.redirect('/login');
            }
        })

        .post((req, res) => {
            if(req.isAuthenticated()){
                // console.log(req.user)
                const userId = req.user.id;
                let secret = req.body.secret;
                secret = faker.lorem.lines(1) //Replace original secret to random sentence.
                db.setUserSecret(userId, secret);
                res.redirect('/secrets');
            }else{
                res.redirect('/login');
            }
        })



    app.get('/logout', (req, res) => {
        req.logout(function(err) {
            if (err) { return next(err); }
            res.redirect('/');
        });
    });

    app.get('/auth/google', passport.authenticate('google', { scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
    ]}));

    app.get('/auth/google/secrets', passport.authenticate('google', 
        { failureRedirect: '/login' }), // Failure authentication
        function(req, res) { // Successful authentication
            res.redirect('/secrets');
        });
}

async function renderSecrets(db, res){
    const secrets = await db.getAllSecrets();
    res.render('secrets', {secrets: secrets});
}