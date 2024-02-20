const router = require("express").Router();
const {
  getRunningRecordings,
} = require("../controllers/runningRecording");

router.route("/").get(getRunningRecordings)

module.exports = router;
