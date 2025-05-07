const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const app = express();
const PORT = process.env.PORT || 4000;
const bcrypt = require("bcrypt");
const prisma = require("./db");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");

dotenv.config();

app.use(cors()); // allow cross-origin requests
app.use(express.json()); // parse incoming JSON data

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

const upload = multer({ storage });

app.use("/uploads", express.static("uploads"));

app.post("/api/upload-profile", upload.single("profile"), async (req, res) => {
  const { token } = req.headers;

  if (!token || !req.file) return res.status(400).json({ error: "Missing token or file" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");

    const imagePath = `/uploads/${req.file.filename}`;

    await prisma.user.update({
      where: { id: decoded.userId },
      data: { profilePicture: imagePath },
    });

    res.json({ message: "Uploaded successfully", imagePath });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Invalid token" });
  }
});

app.get("/api/users/me", async (req, res) => {
  const { token } = req.headers;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { profilePicture: true, email: true },
    });

    res.json(user);
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});

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

app.post("/api/shelf", async (req, res) => {
  const { token } = req.headers;
  const { malId, title, imageUrl } = req.body;

  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");

    const shelfItem = await prisma.animeShelf.create({
      data: {
        userId: decoded.userId,
        malId,
        title,
        imageUrl,
      },
    });
    res.status(201).json({ message: "Added to shelf!", shelfItem });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Invalid token or failed to save" });
  }
});

app.get("/api/shelf", async (req, res) => {
  const { token } = req.headers;

  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");

    const shelf = await prisma.animeShelf.findMany({
      where: { userId: decoded.userId },
      orderBy: { addedAt: "desc" },
    });

    res.json ({ shelf });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Invalid token" });
  }
});

app.delete("/api/shelf/:id", async (req, res) => {
  const { token } = req.headers;
  const shelfId = parseInt(req.params.id);

  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");

    const shelfItem = await prisma.animeShelf.findUnique({
      where: { id: shelfId },
    });

    if (!shelfItem || shelfItem.userId !== decoded.userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await prisma.animeShelf.delete({ where: { id: shelfId } });

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete shelf item" });
  }
});

app.patch("/api/shelf/:id", async (req, res) => {
  const { token } = req.headers;
  const shelfId = parseInt(req.params.id);
  const { status } = req.body;

  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");

    //Verify ownership
    const shelfItem = await prisma.animeShelf.findUnique({
      where: { id: shelfId },
    });

    if (!shelfItem || shelfItem.userId !== decoded.userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    //Update Status
    const updatedItem = await prisma.animeShelf.update({
      where: { id: shelfId },
      data: { status },
  });

    res.json({ message: "Status updated", updatedItem });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update status" });
  }
});

app.post("/api/reset-password", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required." });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const hashed = await bcrypt.hash(password, 10);

    await prisma.user.update({ 
      where: { email },
      data: { password: hashed },
    });

    res.json({ message: "password updated successfully." });
  } catch (err) {
    console.error("Reset Failed:", err);
    res.status(500).json({ error: "Server error." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
