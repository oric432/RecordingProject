const router = require("express").Router();
const { getAllRecordings, addRecording } = require("../controllers/recordings");

router.route("/").get(getAllRecordings).post(addRecording);

module.exports = router;
