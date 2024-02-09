const router = require("express").Router()
const { withdraw } = require("../controllers/withdrawCon")
const authenticate = require("../middlewares/authentication")

router.put("/withdraw",authenticate,withdraw)

module.exports = router