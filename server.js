//Requiring Packages
const dotenv = require("dotenv").config();
const express = require("express");
const app = express();
const methodOverride = require('method-override');
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const jwtDecode = require("jwt-decode");
const { Auth } = require("./middleware/auth");

//Set Middlewares
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'))
app.use(methodOverride('_method'))

//MongoDB Connection
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  dbName: "nourghazy",
};

mongoose
  .connect(process.env.DB_CONNECTION, options)
  .then(() => console.log("Connected to mongodb!"))
  .catch((err) => console.log(err));
mongoose.set("useCreateIndex", true);

//Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`listening to port ${PORT}`));

//Making JWT Tokens
const expireTime = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, process.env.SECRET, {
    expiresIn: expireTime,
  });
};

//Handling Errs
const handleErr = (err) => {
  console.log(err.message, err.code);
  let errors = { email: "", password: "" };
  if (err.code === 11000) {
    errors.email = "That email is already registered";
    return errors;
  }
  if (err.message.includes("User validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }
  //Login Errs 

  if (err.message === "Incorrect Email") {
    errors.email = "Incorrect Email";
  }
  if (err.message === "Incorrect Password") {
    errors.password = "Incorrect Password";
  }
  return errors;
};

//Routes

//Rendering Pages
function getBlogs(page, res, title, css) {
  try {
    Blog.find().then((result) =>
      res.render(page, { blogs: result, title: title, css: css  })
    );
  } catch (err) {
    console.log(err);
  }
}

app.get("/", (req, res) => getBlogs("guest", res , '/guest.css'));
app.get("/signup", (req, res) => res.render("signup",{ title: "Sign Up" , css: "/signup-login.css"}));
app.get("/login", (req, res) => res.render("login",{ title: "Login", css: "/signup-login.css"}));
app.get("/createblog", Auth, (req, res) =>
  res.render("create", { title: "Create A Blog", css: '/createblog.css' })
);
app.get("/dashboard", Auth, async (req, res) =>
  getBlogs("dashboard", res, "Dashboard",  '/blog.css')
);
app.get("/profile/:email", (req, res) => {
  const user = req.cookies.jwt;

  const userID = jwtDecode(user).id;
  User.findById(userID, (err, user) => {
    if (err) {
      console.log(err);
    } else {
      Blog.find({ author: user.fullname }, (err, blog) => {
        res.render("myprofile", { user, title: user.fullname, blogs: blog, css: '/profile.css',length: blog.length });
      });
    }
  });
});
app.get("/blogs/:id", (req, res) => {
    const blogID = req.params.id;
    Blog.findById(blogID, async (err, blog) => {
      const user = await req.cookies.jwt;
        if (err) {
          console.log(err);
        } else {
          if(user){
            res.render('usershowblog',{blog,title: blog.title, css:'/show.css'})
          }else{
            res.render('guestblog',{blog,title: blog.title, css:'/show.css'})
          }
        }
      });
  });

app.get("/profile", (req, res) => {
  const user = req.cookies.jwt;

  const userID = jwtDecode(user).id;
  User.findById(userID, (err, user) => {
    if (err) {
      console.log(err);
    } else {
        res.redirect(`/profile/${user.email}`);
    }
  });
})
app.delete('/blog/:_id', async (req,res) => {
  await Blog.findByIdAndDelete(req.params._id)
  res.redirect('/profile')
})

const { User } = require("./Models/User");
app.post("/signup", (req, res) => {
  const newUser = new User({
    fullname: req.body.fullname,
    email: req.body.email,
    password: req.body.password,
  }).save((err, user) => {
    try {
      const token = createToken(user._id);
      res.cookie("jwt", token, { httpOnly: true, maxAge: expireTime * 1000 });
      res.json({ user });
    } catch {
      const errs = handleErr(err);
      console.log(err);
      res.status(400).json({ errs });
    }
  });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: expireTime * 1000 });
    res.status(200).json({ user: user._id });
  } catch (err) {
    const errs = handleErr(err);
    res.status(400).json({ errs });
  }
});

app.get('/logout',(req,res) => {
    res.cookie('jwt','',{maxAge:1})
    res.redirect('/')
})



const { Blog } = require("./Models/Blog");
app.post("/createblog", (req, res) => {
  const user = req.cookies.jwt;

  const userID = jwtDecode(user).id;
  console.log(userID);

  User.findById(userID, (err, user) => {
    if (err) {
      console.log(err);
    } else {
      const newBlog = new Blog({
        title: req.body.title,
        description: req.body.description,
        body: req.body.body,
        author: user.fullname,
      }).save((err, blog) => {
        User.findByIdAndUpdate(
          userID,
          { $push: { blogs: { blog } } },
          { new: true },
          (err, result) => {
            if (err) {
              console.log(err);
            } else {
              console.log("Done");
            }
          }
        );
        res.send({ blog });
      });
    }
  });
});

//API
app.get("/api/blogs", async (req, res) => {
  try {
    const blogs = await Blog.find({});
    res.json(blogs);
  } catch (err) {
    console.log(err);
  }
});
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (err) {
    console.log(err);
  }
});
