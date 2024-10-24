const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

let Schema = mongoose.Schema;
let userSchema = new Schema({
    userName: {
        type: String,
        unique: true
    },
    password: String,
    email: String,
    loginHistory:[{dateTime: Date, userAgent: String
    }]
});

let User;

module.exports.initialize = function ()
{
    return new Promise((resolve, reject) =>
    {
        let connect = mongoose.createConnection('mongodb+srv://shara1:<fg7sm98iMq2XpTTI>@cluster0.4ktkkpn.mongodb.net/?retryWrites=true&w=majority');
        connect.on('error', (err) => {
            reject(err);
        });
        connect.once('open', () =>
        {
            User = connect.model('users', userSchema);
            resolve();
        });
    });
}

module.exports.registerUser = function(userData){
    return new Promise((resolve, reject) =>
    {
        if (userData.password === userData.password2)
        {
            User.find({ userName: userData.userName }).exec()
                .then(data =>
                {
                    if (data.length === 0)
                    {
                        let newUser = new User(userData);
                        bcrypt.hash(newUser.password, 10).then(hash =>
                        {
                            newUser.password = hash
                            newUser.save().then(() => resolve()).catch(err =>
                                { 
                                    if (err.code == 11000)
                                    {
                                        reject("Username already exists");
                                    } else
                                    {
                                        reject('There was an error creating the user: ' + err);
                                    }
                                });

                        }).catch(err => reject("There was an error encrypting the password"));
                        
                    } else
                    {
                        reject('User Name already taken');
                    }
                })
        } else
        {
            reject('Passwords dont match');
            }
    })
}

module.exports.checkUser = function(userData)
{
    return new Promise((resolve, reject) =>
    {
        User.find({ userName: userData.userName }).exec()
            .then(data =>
            {
                if (data.length == 0)
                {
                    reject('Unable to find user: ' + userData.userName)
                }
                bcrypt.compare(userData.password, data[0].password).then(result =>
                {
                    if (!result)
                    {  
                        reject('Incorrect Password for user ' + userData.userName)
                    } else
                    { 
                        data[0].loginHistory.push({ dateTime: (new Date()).toString(), userAgent: userData.userAgent });
                        User.updateOne(
                            { userName: data[0].userName },
                            { $set: { loginHistory: data[0].loginHistory } }
                        ).exec().then(() =>
                        {
                            resolve(data[0]);
                        }).catch(err => reject('There was an error verifying the user: ' + err));
                    }

                });
                    
            }).catch(err => 'Unable to find user ' + userData.userName);
    });
}


