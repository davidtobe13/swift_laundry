const router = require("express").Router()
const { electronic } = require("../controllers/electronicsCon")
const authenticate = require("../middlewares/authentication")

router.put("/electronic",authenticate,electronic)

module.exports = router