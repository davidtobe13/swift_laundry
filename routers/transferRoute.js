const router = require("express").Router()
const { transfer } = require("../controllers/transferCon")
const authenticate = require("../middlewares/authentication")

router.put("/transfer",authenticate,transfer)

module.exports = router