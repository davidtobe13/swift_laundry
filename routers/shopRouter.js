const router = require("express").Router()
const {registerShop, verifyShop, signInShop, signOutShop, forgotShopPassword, resetShopPasswordPage, resetShopPassword, updateShop, getShopOrders, getShopPendingOrders, getShopCompletedOrders, getOneUser, getAllUsers, shopSilverPlan, shopGoldPlan, updateOrderStatusToCompleted} = require('../controllers/shopController')
const authenticate = require("../middlewares/authentication")
const myValidation = require("../middlewares/validation")

router.post("/register-shop",myValidation, registerShop)
router.post("/login-shop",signInShop)
router.post("/logout",authenticate,signOutShop)
router.get("/verify-shop/:id/:token", verifyShop)
router.post("/forgot-shop-password", forgotShopPassword)
router.get("/shop-reset/:id", resetShopPasswordPage)
router.post("/shop-reset-password/:id", resetShopPassword)
router.put('/update-shop/:userId', authenticate, updateShop)
router.get('/get-shop-orders/:shopId', authenticate, getShopOrders)
router.get('/get-shop-pending-orders', authenticate, getShopPendingOrders)
router.get('/get-shop-completed-orders', authenticate, getShopCompletedOrders)
router.get('/get-one-user/:shopId/:userId', authenticate, getOneUser)
router.get('/get-all-users/:shopId', authenticate, getAllUsers)
router.post('/shop-silver-plan', authenticate, shopSilverPlan)
router.post('/shop-gold-plan', authenticate, shopGoldPlan)
router.post('/complete-order/:shopId/:orderId', authenticate, updateOrderStatusToCompleted)

module.exports = router