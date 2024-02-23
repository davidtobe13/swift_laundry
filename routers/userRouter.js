const router = require("express").Router()

const {registerUser,verifyUser, signIn,signOut,forgotPassword,resetPasswordPage,resetPassword,
    updateUser,getAllOrders,getAllPendingOrders, getAllCompletedOrders,getOneOrder, getOneShop, getAllShop,
    userSilverPlan, userGoldPlan} = require("../controllers/userController")
const authenticate = require("../middlewares/authentication")
const userValidation = require("../middlewares/userVal")
const upload = require("../utils/multer")

router.post("/register-User", userValidation,registerUser)
router.get("/verify-User/:id/:token", verifyUser)
router.post("/sign-In",signIn)
router.post("/sign-Out",authenticate ,signOut)
router.get("/forget-Password" ,forgotPassword)
router.get("/reset-Password-Page/:id", resetPasswordPage)
router.put("/reset-Password/:id", resetPassword)
router.put("/update-User/:id", upload.single("profileImage"),authenticate, updateUser)
router.get("/get-All-Orders/:userId", authenticate, getAllOrders)
router.get("/get-All-Pending-Orders",authenticate, getAllPendingOrders)
router.get("/get-All-Completed-Orders",authenticate, getAllCompletedOrders)
router.get("/get-One-Order/:userId/:orderId",authenticate, getOneOrder)
router.get("/get-One-Shop/:/userId:shopId ", authenticate,getOneShop )
router.get("/get-All-Shop/:userId", authenticate,getAllShop)
router.get("/user-Silver-Plan",authenticate, userSilverPlan)
router.get("/user-Gold-Plan",authenticate, userGoldPlan)


module.exports = router