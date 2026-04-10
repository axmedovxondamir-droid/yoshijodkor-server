const express = require('express')
const router = express.Router()
const db = require('../db')
const { authMiddleware, adminOnly } = require('../middleware/auth')

// POST /api/custom-orders — yuborish
router.post('/', (req, res) => {
  const order = {
    ...req.body,
    id: 'CUS-' + Date.now(),
    status: 'new',
    createdAt: new Date().toISOString()
  }
  db.get('customOrders').unshift(order).write()
  res.status(201).json({ id: order.id, success: true })
})

// GET /api/custom-orders (admin)
router.get('/', authMiddleware, adminOnly, (req, res) => {
  res.json(db.get('customOrders').value())
})

// PUT /api/custom-orders/:id/status (admin)
router.put('/:id/status', authMiddleware, adminOnly, (req, res) => {
  const { status } = req.body
  db.get('customOrders').find({ id: req.params.id }).assign({ status }).write()
  res.json({ success: true })
})

module.exports = router
