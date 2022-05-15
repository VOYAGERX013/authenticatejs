const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

require("dotenv").config();

const initialize = (app) => {
    app.use(cookieParser());
}

const login = async (res, Model, username_val, password_val, username_field, password_field) => {
    let queryFields = {};
    if (!username_field) username_field = "username";
    if (!password_field) password_field = "password";
    queryFields[username_field] = username_val;
    const user = await Model.findOne(queryFields);
    if (user){
        const isCorrectPassword = await bcrypt.compare(password_val, user[password_field]);
        if (isCorrectPassword){
            let signObject = {};
            signObject[username_field] = username_val;
            signObject[password_field] = password_val;
            const token = jwt.sign(signObject, process.env.SECRET);
            res.cookie("token", token);
            return {success: true};
        } else{
            return {success: false, msg: "IncorrectPassword"}
        }
    } else{
        return {success: false, msg: "UserDoesNotExist"};
    }
}

const logout = async (res) => {
    res.cookie("token", "", {expires: new Date(0)});
}

const register = async (Model, username_val, password_val, username_field, password_field, additional_details) => {
    let queryFields = {};
    if (!username_field) username_field = "username";
    if (!password_field) password_field = "password";
    queryFields[username_field] = username_val;
    const user = await Model.findOne(queryFields);
    if (!user){
        let modelProps = {};
        modelProps[username_field] = username_val;
        const salt = await bcrypt.genSalt(10);
        modelProps[password_field] = await bcrypt.hash(password_val, salt);
        if (additional_details){
            additional_details.map((elem) => {
                modelProps[elem[0]] = modelProps[elem[1]];
            });    
        }
        const newUser = new Model(modelProps);
        newUser.save();
        return { success: true };
    } else{
        return { success: false, msg: "UserExists" };
    }
}

const isLoggedIn = (req) => {
    console.log(req.cookies);
    if (req.cookies){
        const tokenVal = req.cookies.token;
        if (tokenVal){
            const verified = jwt.verify(tokenVal, process.env.SECRET);
            if (verified){
                return true;
            } else{
                return false;
            }
        } else{
            return false;
        }    
    } else{
        return false;
    }
}

const getUserData = (req, field) => {
    if (!field) field = "username";
    const tokenVal = req.cookies.token;
    if (tokenVal){
        const username = jwt.verify(tokenVal, process.env.SECRET)[field];
        if (username){
            return username;
        } else{
            return null;
        }
    } else{
        return null;
    }
}

module.exports.login = login;
module.exports.register = register;
module.exports.logout = logout;
module.exports.isLoggedIn =isLoggedIn;
module.exports.getUserData = getUserData;
module.exports.initialize = initialize;