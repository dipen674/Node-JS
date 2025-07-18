require("dotenv").config({ path: "./config.env" });
const express = require("express");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const authModel = require("./Models/Model");
const bcrypt = require("bcrypt");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const TodoRoutes = require("./Routes/TodoRoutes");
const NoteRoutes = require("./Routes/NoteRoutes");
const TaskRoutes = require("./Routes/TaskRoutes");

const PORT = 5000;
const app = express();

// Middleware
app.use([
  cors({
    origin: process.env.FRONTEND_DOMAIN,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE","OPTIONS"],
  }),
  express.json(),
  express.urlencoded({ extended: true }),
]);

// Session setup
const sessionStore = MongoStore.create({
  mongoUrl: process.env.MONGO_URL,
  collectionName: "session",
});
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: 'mongodb://mongodb:27017/mydatabase',
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

// Basic route
app.get("/", (req, res) => {
  res.json("Hello");
});

// Register user
app.post("/register", async (req, res) => {
  const { userName, email, password } = req.body;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  try {
    const user = await authModel.findOne({ email: email });
    if (user) res.json("Already Registered");
    else {
      const newAuth = new authModel({ userName, email, password: hashedPassword });
      const savedUser = await newAuth.save();
      res.send(savedUser);
    }
  } catch (err) {
    res.status(400).send(err);
  }
});
// Login (manual logic instead of passport)
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await authModel.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid email or password" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid email or password" });

    req.session.user = user; // store user in session
    res.json({ success: "Logged in", user });
  } catch (err) {
    res.status(500).send(err);
  }
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) res.send(err);
    else res.json({ success: "Logged out" });
  });
});

// Get current user from session
app.get("/getUser", (req, res) => {
  if (req.session.user) res.json(req.session.user);
  else res.status(401).json({ error: "No user logged in" });
});

// Forgot and Reset Password
app.post("/forgotpass", async (req, res) => {
  const { email } = req.body;
  const user = await authModel.findOne({ email });
  if (!user) return res.send({ Status: "Enter a valid email" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "1d",
  });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "jhonmoorthi85131@docker push deependrabhatta/jenkins_data:tagnamegmail.com",
      pass: "12345678", // (consider using env variable instead!)
    },
  });

  const mailOptions = {
    from: "jhonmoorthi85131@gmail.com",
    to: email,
    subject: "Forgot password for task manager",
    text: `${process.env.FRONTEND_DOMAIN}/ResetPass/${user._id}/${token}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      return res.status(500).send({ Status: "Email failed" });
    }
    res.send({ Status: "success" });
  });
});

app.post("/resetPassword/:id/:token", async (req, res) => {
  const { id, token } = req.params;
  const { newPassword } = req.body;

  jwt.verify(token, process.env.JWT_SECRET_KEY, async (err) => {
    if (err) return res.send({ Status: "Token expired. Try again." });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    try {
      await authModel.findByIdAndUpdate(id, { password: hashedPassword });
      res.send({ Status: "Password updated" });
    } catch (err) {
      res.send({ Status: err });
    }
  });
});

// Authentication middleware
const authenticator = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Login Required" });
  }
  next();
};

app.use((req, res, next) => {
  if (req.session.user) {
    req.user = req.session.user;
  }
  next();
});


// Routes
app.use("/todo", [authenticator, TodoRoutes]);
app.use("/note", [authenticator, NoteRoutes]);
app.use("/task", [authenticator, TaskRoutes]);

app.listen(PORT, '0.0.0.0',() => {
  console.log(`Server Running On Port: ${PORT}`);
});

module.exports = app;
