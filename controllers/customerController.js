const asyncHandler = require("express-async-handler");
const User = require("../model/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//@desc Register a Customer
//@route POST /api/customer/register
//@access Public
const registerCustomer = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    res.status(400);
    throw new Error("All fields are mandatory");
  }

  const customerExists = await User.findOne({ email, role: "customer" });
  if (customerExists) {
    res.status(400);
    throw new Error("Customer already registered");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const customer = await User.create({
    username,
    email,
    password: hashedPassword,
    role: "customer",
  });

  if (customer) {
    res.status(201).json({ _id: customer.id, email: customer.email, role: customer.role });
  } else {
    res.status(400).json({message :"Invalid customer data"});
  }
});

//@desc Login a Customer
//@route POST /api/customer/login
//@access Public
const loginCustomer = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({message :"All fields are mandatory"});
  }

  const customer = await User.findOne({ email, role: "customer" });

  if (customer && (await bcrypt.compare(password, customer.password))) {
    const accessToken = jwt.sign(
      {
        user: {
          username: customer.username,
          email: customer.email,
          id: customer.id,
          role: customer.role,
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

//@desc Get Current Customer
//@route GET /api/customer/current
//@access Private
const currentCustomer = asyncHandler(async (req, res) => {
  if (req.user.role !== "customer") {
    res.status(403).json({message :"Access denied"});
  }

  res.status(200).json({
    id: req.user.id,
    username: req.user.username,
    email: req.user.email,
    role: req.user.role,
  });
});

module.exports = { registerCustomer, loginCustomer, currentCustomer };
