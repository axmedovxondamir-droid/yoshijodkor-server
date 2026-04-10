const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const db = require('../db')
const { authMiddleware, adminOnly } = require('../middleware/auth')

// GET /api/users (admin)
router.get('/', authMiddleware, adminOnly, (req, res) => {
  const users = db.get('users').value().map(({ password, ...u }) => u)
  res.json(users)
})

// POST /api/users — qo'shish (admin)
router.post('/', authMiddleware, adminOnly, (req, res) => {
  const { name, username, password, email, role } = req.body
  if (!name || !username || !password)
    return res.status(400).json({ error: "Ism, username va parol majburiy" })

  const exists = db.get('users').find({ username }).value()
  if (exists) return res.status(400).json({ error: "Bu username band" })

  const user = {
    id: Date.now(),
    name, username,
    password: bcrypt.hashSync(password, 10),
    email: email || '',
    role: role || 'user',
    active: true,
    createdAt: new Date().toISOString()
  }
  db.get('users').push(user).write()
  const { password: _, ...safeUser } = user
  res.status(201).json(safeUser)
})

// PUT /api/users/:id — yangilash (admin)
router.put('/:id', authMiddleware, adminOnly, (req, res) => {
  const id = Number(req.params.id)
  const update = { ...req.body }
  if (update.password) update.password = bcrypt.hashSync(update.password, 10)
  db.get('users').find({ id }).assign(update).write()
  res.json({ success: true })
})

// DELETE /api/users/:id (admin, o'zini o'chira olmaydi)
router.delete('/:id', authMiddleware, adminOnly, (req, res) => {
  const id = Number(req.params.id)
  if (id === req.user.id) return res.status(400).json({ error: "O'zingizni o'chira olmaysiz" })
  db.get('users').remove({ id }).write()
  res.json({ success: true })
})

// PATCH /api/users/:id/toggle — bloklash/faollashtirish (admin)
router.patch('/:id/toggle', authMiddleware, adminOnly, (req, res) => {
  const id = Number(req.params.id)
  const user = db.get('users').find({ id }).value()
  if (!user) return res.status(404).json({ error: 'Topilmadi' })
  db.get('users').find({ id }).assign({ active: !user.active }).write()
  res.json({ success: true, active: !user.active })
})

module.exports = router
