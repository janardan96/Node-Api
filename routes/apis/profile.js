const express = require('express');
const router = express.Router();

router.get('/test', (req, res) => res.json({
    msg: "Profiles works"
}))

module.exports = router;