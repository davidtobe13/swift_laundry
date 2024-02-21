const router = require(express).Router()

const {registerUser,signIn,signOut,forgotPassword,resetPasswordPage,resetPassword} = require("../controllers/userController")
const authenticate = require("../middlewares/authentication")
const myValidation = require("../middlewares/validation")
// const upload = require("../utils/multer")

router.post("/register-user", myValidation,registerUser)
router.post("/signin",authenticate ,signIn)
router.post("/signout",authenticate ,signOut)
router.get("/forgetpassword" ,forgotPassword)
router.get("/resetpasswordpage", resetPasswordPage)
router.put("/resetpassword", myValidation, resetPassword)


module.exports = router