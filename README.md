
# authenticatejs

Authenticatejs helps simplify your authentication system using node js. You can easily login, register and logout your users with just one line of code!


## Installation

Install authenticatejs with npm

```bash
  npm i authenticatejs
```
    
## Documentation

You must import the authenticatejs after installing the package:

```javascript
const auth = require("authenticatejs");
```

Next, make a mongoose model that authenticatejs will use to register users:

```javascript
mongoose.connect("mongodb://localhost:27017/authDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const userSchema = new mongoose.Schema({
    email: String,
    password: String
})

const User = mongoose.model("User", userSchema);
```

It is critical to run the initialize function first. Else, the authenticatejs authentication system would fail. Make sure you pass your express app function as a parameter.

```javascript
app = express();
auth.initialize(app);
```

Now to register a user after retrieving form data, you can use the register function. 

```javascript
app.post("/register", async (req, res) => {
    const register = await auth.register(User, req.body.email, req.body.password);
    if (register.success){
        res.send("Success!")
    } else{
        res.send("Could not register!");
    }
})
```

In the register function, the default field names that authenticatejs would use would be username and password. Since, our User model has the schema that uses the field name email instead of username, we can pass this

```javascript
const register = await auth.register(User, req.body.email, req.body.password, "email", "password");
```

Now, the second last and last parameter we pass to the register function has the field names that authenticatejs must use for the User model

If you want the register function to save additional details such as name, age, gender when registering the user, you must first modify the schema of your mongoose model

```javascript
const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    name: String,
    age: Number,
    gender: Boolean
});
```

Now, you can pass the field names and the values to authenticatejs register function and it will save these details as well

```javascript
const register = await auth.register(User, req.body.email, req.body.password, "email", "password", [["name", req.body.name], ["age", req.body.age], ["gender", req.body.gender]]);
```

If you want to login a user, you can use the login function. The first parameter to pass is the response you receive from a callback in an express route:

```javascript
app.post("/login", async (req, res) => {
    const login = await auth.login(res, User, req.body.email, req.body.password, "email", "password");
    if (login.success){
        res.send("Logged in!");
    } else{
        res.send("Not logged in!");
    }
})

```

If you have a certain page that should be accessed only by users who are logged in, you can do this check by using the isLoggedIn function:

```javascript
app.get("/", (req, res) => {
    if (auth.isLoggedIn(req)){
        res.send("Hello User");
    } else{
        res.redirect("/login");
    }
})

```

In order to retrieve the email of our user, we can use the getUserData function:

```javascript
app.get("/", (req, res) => {
    if (auth.isLoggedIn(req)){
        const username = auth.getUserData(req, "email");
        res.send(`Hello ${username}!`);
    }
})
```

The parameter we have passed in the getUserData function is the field name we want to access

You can make the user logout as well:

```javascript
app.post("/logout", (req, res) => {
    auth.logout(res);
})
```

Here is a list of errors that can occur while using authenticatejs. You can use these names to show appropriate errors to the user:

| Function        | Error |
| ------------- |:-------------:|
| Register      | UserExists | 
| Login      | IncorrectPassword |
| Login | UserDoesNotExist |

You access the type of error that has occurred using the following code:

```javascript
const login = await auth.login(res, User, req.body.email, req.body.password, "email", "password");
if (login.success){
    res.send("Logged in!");
} else{
    const errorMsg = login.msg;
    res.send(`The following error has occurred: ${errorMsg}`);
}
```

## Authors

- [@aryaanhegde](https://www.github.com/VOYAGERX013)