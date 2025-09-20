const router = require('express').Router();

router.get('/', (req, res) => {
  return res.json({ orders: [] });
});

module.exports = router;


