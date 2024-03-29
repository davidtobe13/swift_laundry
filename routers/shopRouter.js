const router = require("express").Router()
const {registerShop, verifyShop, signInShop, signOutShop, forgotShopPassword, resetShopPasswordPage, resetShopPassword, updateShop, getShopOrders, getShopPendingOrders, getShopCompletedOrders, getOneUser, getAllUsers, shopSilverPlan, shopGoldPlan, updateOrderStatusToCompleted, reverifyShop, getThisShop} = require('../controllers/shopController')
const { authenticate, authenticateAdmin } = require("../middlewares/authentication")
const myValidation = require("../middlewares/validation")
const upload = require("../utils/multer")


router.post("/register-shop",myValidation, registerShop)
router.post("/get-this-shop", getThisShop)
router.post("/login-shop",signInShop)
router.post("/logout",authenticate,signOutShop)
router.get("/verify-shop/:id/:token", verifyShop)
router.post('/reverify-shop', reverifyShop)
router.post("/forgot-shop-password", forgotShopPassword)
router.get("/shop-reset/:id", resetShopPasswordPage)
router.post("/shop-reset-password/:id", resetShopPassword)
router.put('/update-shop', upload.single("profileImage"),authenticate, authenticateAdmin, updateShop)
router.get('/get-shop-orders', authenticate, authenticateAdmin, getShopOrders)
router.get('/get-shop-pending-orders', authenticate, authenticateAdmin, getShopPendingOrders)
router.get('/get-shop-completed-orders', authenticate, getShopCompletedOrders)
router.get('/get-one-user/:id', authenticate, authenticateAdmin, getOneUser)
router.get('/get-all-users', authenticate, authenticateAdmin, getAllUsers)
router.post('/shop-silver-plan', authenticate, authenticateAdmin, shopSilverPlan)
router.post('/shop-gold-plan', authenticate, authenticateAdmin, shopGoldPlan)
router.post('/complete-order/:orderId', authenticate, authenticateAdmin, updateOrderStatusToCompleted)

module.exports = router
