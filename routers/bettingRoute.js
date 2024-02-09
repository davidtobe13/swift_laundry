const router = require("express").Router()
const { betting } = require("../controllers/bettingCon")
const authenticate = require("../middlewares/authentication")

router.put("/betting",authenticate,betting)

module.exports = router