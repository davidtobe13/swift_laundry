const router = require("express").Router()
const { deposit } = require("../controllers/depositeCon")
const authenticate = require("../middlewares/authentication")

router.put("/deposit",authenticate,deposit)

module.exports = router