const router = require("express").Router()
const { registerUser, verifyUser, signIn, signOut, forgotPassword, resetPasswordPage, resetPassword, updateUser, getAllOrders, getAllPendingOrders, getAllCompletedOrders, getOneOrder, getOneShop, getAllShop, userSilverPlan, userGoldPlan, getOneUser, reverifyUser, updateAddress, getShops, getTheShops } = require("../controllers/userController")
const { authenticate } = require("../middlewares/authentication")
const userValidation = require("../middlewares/userVal")
const upload = require("../utils/multer")

router.post("/register-User", userValidation,registerUser)
router.post('/reverify-user', reverifyUser)
router.get("/verify-User/:id/:token", verifyUser)
router.post("/sign-In",signIn)
router.get('/get-user', authenticate, getOneUser)
router.post("/sign-Out",authenticate ,signOut)
router.get("/forget-Password" ,forgotPassword)
router.get("/reset-Password-Page/:id", resetPasswordPage)
router.put("/reset-Password/:id", resetPassword)
router.put("/update-User", upload.single("profileImage"),authenticate, updateUser)
router.put("/update-user-Address", authenticate, updateAddress)
router.get("/get-all-orders", authenticate, getAllOrders)
router.get("/get-All-Pending-Orders",authenticate, getAllPendingOrders)
router.get("/get-All-Completed-Orders",authenticate, getAllCompletedOrders)
router.get("/get-One-Order/:orderId",authenticate, getOneOrder)
router.get("/get-One-Shop/:id", authenticate, getOneShop )
router.get("/get-All-Shop", authenticate, getAllShop)
router.get("/get-my-shops", getTheShops) 
router.get("/get-All-Shops", authenticate, getShops)
router.get("/user-Silver-Plan",authenticate, userSilverPlan)
router.get("/user-Gold-Plan",authenticate, userGoldPlan)

module.exports = router
