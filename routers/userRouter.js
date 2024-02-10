const router = require("express").Router()
const {registerUser, signIn, signOut} = require("../controllers/userController")
const authenticate = require("../middlewares/authentication")
const userValidation = require("../middlewares/userVal")

router.post("/register",userValidation,registerUser)
router.post("/login",signIn)
router.post("/logout",authenticate,signOut)
// router.get("/allusers",authenticate,allUsers)

module.exports = router