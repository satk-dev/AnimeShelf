const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const app = express();
const PORT = process.env.PORT || 4000;
const bcrypt = require("bcrypt");
const prisma = require("./db");
const jwt = require("jsonwebtoken");

dotenv.config();

app.use(cors()); // allow cross-origin requests
app.use(express.json()); // parse incoming JSON data

// Basic test route
app.get("/", (req, res) => {
  res.send("AnimeShelf backend is running! 🚀");
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required." });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "dev-secret",
      { expiresIn: "7d" }
    );

    res.json({ message: "Login Successful", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login Failed." });
  }
});

// Placeholder for your future API
app.post("/api/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password){
    return res.status(400).json({ error: "Email and Password are required." });
  }

  try{
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: { email, password: hashedPassword },
    });
    
    res.status(201).json({ message: "User created!", user: { id: user.id, email: user.email } });

  } catch (err) {
    if (err.code === "P2002" && err.meta?.target?.includes("email")) {
      return res.status(409).json({ error: "Email already exists." });
    }

    console.error(err);
    res.status(500).json({ error: "Something went wrong." });
  }

  console.log("Received registration:", email, password);

});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
