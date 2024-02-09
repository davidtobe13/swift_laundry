const router = require("express").Router()
const {registerUser, signIn, signOut, allUsers} = require("../controllers/userController")
const authenticate = require("../middlewares/authentication")
const myValidation = require("../middlewares/validation")

router.post("/register",myValidation,registerUser)
router.post("/login",signIn)
router.post("/logout",authenticate,signOut)
// router.get("/allusers",authenticate,allUsers)

module.exports = router