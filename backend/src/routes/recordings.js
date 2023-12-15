const router = require("express").Router();
const {
  getAllRecordings,
  addRecording,
  getSingleRecording,
} = require("../controllers/recordings");

router.route("/").get(getAllRecordings).post(addRecording);
router.route("/:id").get(getSingleRecording);

module.exports = router;
