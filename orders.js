const express = require('express')
const router = express.Router()
const db = require('../db')
const { authMiddleware, adminOnly } = require('../middleware/auth')

// POST /api/orders — yangi buyurtma
router.post('/', (req, res) => {
  const order = {
    ...req.body,
    id: 'ORD-' + Date.now(),
    status: 'new',
    createdAt: new Date().toISOString()
  }
  db.get('orders').unshift(order).write()

  // Reduce stock
  if (req.body.items) {
    req.body.items.forEach(item => {
      const product = db.get('products').find({ id: item.id }).value()
      if (product) {
        db.get('products').find({ id: item.id }).assign({
          stock: Math.max(0, product.stock - item.qty)
        }).write()
      }
    })
  }

  res.status(201).json({ id: order.id, success: true })
})

// GET /api/orders — barchasi (admin)
router.get('/', authMiddleware, adminOnly, (req, res) => {
  res.json(db.get('orders').value())
})

// PUT /api/orders/:id/status — holat o'zgartirish (admin)
router.put('/:id/status', authMiddleware, adminOnly, (req, res) => {
  const { status } = req.body
  db.get('orders').find({ id: req.params.id }).assign({ status }).write()
  res.json({ success: true })
})

module.exports = router
