const asyncHandler = require("express-async-handler");
const Cart = require("../model/cartModel");
const Order = require("../model/orderModel");
const Menu = require("../model/menuModel");


//@desc Get customer cart
//@route GET /api/cart
//@access Private
const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ customerId: req.user.id }).populate(
    "items.menuItem"
  );
  res.status(200).json(cart || { items: [] });
});

//@desc Add item to cart
//@route POST /api/cart
//@access Private
const addToCart = asyncHandler(async (req, res) => {
  const { menuItemId, quantity } = req.body;
  const customerId = req.user.id;

  let cart = await Cart.findOne({ customerId });

  if (!cart) {
    cart = new Cart({ customerId, items: [] });
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.menuItem.toString() === menuItemId
  );

  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += quantity;
  } else {
    cart.items.push({ menuItem: menuItemId, quantity });
  }

  await cart.save();
  res.status(200).json(cart);
});

//@desc Remove item from cart
//@route DELETE /api/cart/:itemId
//@access Private
const removeFromCart = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const customerId = req.user.id;

  const cart = await Cart.findOne({ customerId });
  if (!cart) {
    res.status(404).json({message :"Cart not found"});
  }

  cart.items = cart.items.filter((item) => item.menuItem.toString() !== itemId);
  await cart.save();

  res.status(200).json(cart);
});

//@desc Checkout and create order
//@route POST /api/cart/checkout
//@access Private
const checkout = asyncHandler(async (req, res) => {
  const customerId = req.user.id;

  const cart = await Cart.findOne({ customerId }).populate("items.menuItem");
  if (!cart || cart.items.length === 0) {
    res.status(400).json({message :"Cart is empty"});
  }

  const total = cart.items.reduce(
    (acc, item) => acc + item.menuItem.price * item.quantity,
    0
  );

  const order = await Order.create({
    customerId,
    items: cart.items,
    total,
  });

  // Clear the cart
  cart.items = [];
  await cart.save();

  res.status(201).json(order);
});

module.exports = { getCart, addToCart, removeFromCart, checkout };
