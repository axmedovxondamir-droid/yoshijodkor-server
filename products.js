const express = require('express')
const router = express.Router()
const db = require('../db')
const { authMiddleware, adminOnly } = require('../middleware/auth')
const { v4: uuidv4 } = require('uuid')

// GET /api/products — barchasi
router.get('/', (req, res) => {
  const { category, search } = req.query
  let products = db.get('products').value()

  if (category && category !== 'all') {
    products = products.filter(p => p.category === category)
  }
  if (search) {
    const q = search.toLowerCase()
    products = products.filter(p =>
      p.name_uz?.toLowerCase().includes(q) ||
      p.name_ru?.toLowerCase().includes(q) ||
      p.author?.toLowerCase().includes(q)
    )
  }
  res.json(products)
})

// GET /api/products/:id — bitta
router.get('/:id', (req, res) => {
  const product = db.get('products').find({ id: Number(req.params.id) }).value()
  if (!product) return res.status(404).json({ error: 'Mahsulot topilmadi' })
  res.json(product)
})

// POST /api/products — qo'shish (admin)
router.post('/', authMiddleware, adminOnly, (req, res) => {
  const product = {
    ...req.body,
    id: Date.now(),
    price: Number(req.body.price),
    stock: Number(req.body.stock),
    createdAt: new Date().toISOString()
  }
  db.get('products').unshift(product).write()
  res.status(201).json(product)
})

// PUT /api/products/:id — yangilash (admin)
router.put('/:id', authMiddleware, adminOnly, (req, res) => {
  const id = Number(req.params.id)
  const exists = db.get('products').find({ id }).value()
  if (!exists) return res.status(404).json({ error: 'Mahsulot topilmadi' })

  db.get('products').find({ id }).assign({
    ...req.body,
    price: Number(req.body.price),
    stock: Number(req.body.stock)
  }).write()

  res.json(db.get('products').find({ id }).value())
})

// DELETE /api/products/:id — o'chirish (admin)
router.delete('/:id', authMiddleware, adminOnly, (req, res) => {
  const id = Number(req.params.id)
  db.get('products').remove({ id }).write()
  res.json({ success: true })
})

module.exports = router
