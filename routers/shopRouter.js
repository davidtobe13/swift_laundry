const router = require("express").Router()
const {signOut, verify, registerShop, signInShop, resetShopPasswordPage, forgotShopPassword, resetShopPassword} = require("../controllers/shopController")
const authenticate = require("../middlewares/authentication")
const myValidation = require("../middlewares/validation")

router.post("/register-shop",myValidation,registerShop)
router.post("/login-shop",signInShop)
router.post("/logout",authenticate,signOut)
router.get("/verify-shop/:id/:token", verify)
router.post("/forgot-shop-password", forgotShopPassword)
router.get("/shop-reset/:id", resetShopPasswordPage)
router.post("/shop-reset-password/:id", resetShopPassword)
// router.get("/allusers",authenticate,allUsers)

module.exports = router