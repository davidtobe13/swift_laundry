// const cartModel = require('../models/cartModel');
// const itemsModel = require('../models/itemsModel');

// exports.addToCart = async (req, res) => {
//     try {
//         const { user, itemId, quantity } = req.body;
        
//         // Fetch the item from the ItemModel based on the provided itemId
//         const item = await itemsModel.findById(itemId);
//         if (!item) {
//             return res.status(404).json({ message: 'Item not found' });
//         }
        
//         let cart = await cartModel.findOne({ user });

//         if (!cart) {
//             cart = new cartModel({ user, cart: [{ item: item._id, quantity }] });
//         } else {
//             const existingCartItem = cart.cart.find(cartItem => cartItem.item.toString() === itemId);
//             if (existingCartItem) {
//                 existingCartItem.quantity += quantity;
//             } else {
//                 cart.cart.push({ item: item._id, quantity });
//             }
//         }

//         await cart.save();
//         res.status(200).json({ message: 'Item added to cart successfully' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// };


// const cartModel = require('../models/cartModel');
// const itemsModel = require('../models/itemsModel');
// const userModel = require('../models/userModel');

// exports.addToCart = async (req, res) => {
//     try {
//         const {  itemId, quantity } = req.body;
//         const {userId} = req.user
        
//         const user = await userModel.findById(userId)

//         if(!user){
//             return res.status(404).json({
//                 error: `User not found`
//             })
//         }
        
//         const item = await itemsModel.findById(itemId);
//         if (!item) {
//             return res.status(404).json({ message: 'Item not found' });
//         }
        
//         let cart = await cartModel.findOne({ user:userId }).populate('cart.item');

//         if (!cart) {
//             cart = new cartModel({ user: userId, cart: [{ item: item._id, quantity }] });
//         } else {
//             const existingCartItem = cart.cart.find(cartItem => cartItem.item.toString() === itemId);
//             if (existingCartItem) {
//                 existingCartItem.quantity += quantity;
//             } else {
//                 cart.cart.push({ item: item._id, quantity });
//             }
//         }

//         // Calculate total price
//         let totalPrice = 0;
//         for (const cartItem of cart.cart) {
//             const item = await itemsModel.findById(cartItem.item);
//             if (item) {
//                 totalPrice += item.Price * cartItem.quantity;
//             }
//         }
//         cart.grandTotal = cart.cart.reduce((total, cartItem) => total + cartItem.total, 0);

//         await cart.save();
//         res.status(200).json({ 
//             message: 'Item added to cart successfully',
//             data: cart
//          });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// };




const cartModel = require('../models/cartModel');
const itemsModel = require('../models/itemsModel');
const userModel = require('../models/userModel');

exports.addToCart = async (req, res) => {
    try {
        const { itemId, quantity } = req.body;
        const { userId } = req.user;

        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ error: `User not found` });
        }

        const item = await itemsModel.findById(itemId);

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        let cart = await cartModel.findOne({ user: userId }).populate('cart.item');

        if (!cart) {
            cart = new cartModel({ user: userId, cart: [{ item: item._id, quantity }] });
        } else {
            const existingCartItem = cart.cart.find(cartItem => cartItem.item.toString() === itemId);

            if (existingCartItem) {
                existingCartItem.quantity += quantity;
            } else {
                cart.cart.push({ item: item._id, quantity });
            }
        }

        // Calculate total price for each cart item
        cart.cart.forEach(cartItem => {
            cartItem.total = item.Price * cartItem.quantity;
        });

        // Calculate grand total for the entire cart
        cart.grandTotal = cart.cart.reduce((total, cartItem) => total + cartItem.total, 0);

        await cart.save();

        res.status(200).json({ 
            message: 'Item added to cart successfully',
            data: cart
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
