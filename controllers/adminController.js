const asyncHandler = require("express-async-handler");
const User = require("../model/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//@desc Register an Admin
//@route POST /api/admin/register
//@access Public

const registerAdmin = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    res.status(400).json({message:"All fields are mandatory"});
  }

  const adminExists = await User.findOne({ email, role: "admin" });
  if (adminExists) {
    res.status(400).json({message :"Admin already registered"});
  }

  const hashedPassword = await bcrypt.hash(password, 3); 
  console.log("Hashed password: ", hashedPassword);

  
  const admin = await User.create({
    username,
    email,
    password: hashedPassword,
    role: "admin",
  });

  console.log(`Admin created: ${admin}`);
  if (admin) {
    res.status(201).json({ _id: admin.id, email: admin.email, role: admin.role });
  } else {
    res.status(400).json
    ({message :"Invalid admin data"});
  }
});

//@desc Login an Admin
//@route POST /api/admin/login
//@access Public

const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({message:"All fields are mandatory"});
  }


  const admin = await User.findOne({ email, role: "admin" });

  if (admin && (await bcrypt.compare(password, admin.password))) {
    const accessToken = jwt.sign(
      {
        user: {
          username: admin.username,
          email: admin.email,
          id: admin.id,
          role: admin.role,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "30m" }
    );

    res.status(200).json({ accessToken });
  } else {
    res.status(401).json({message :"Invalid credentials"});
  }
});

//@desc Get Current Admin
//@route GET /api/admin/current
//@access Private

const currentAdmin = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    res.status(403).json({message :"Access denied"});
  }

  res.status(200).json({
    id: req.user.id,
    username: req.user.username,
    email: req.user.email,
    role: req.user.role,
  });
});

module.exports = { registerAdmin, loginAdmin, currentAdmin };
