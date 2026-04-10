const express = require('express')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 5000
const SECRET = process.env.JWT_SECRET || 'yoshijodkor_secret_2024'
const DB_FILE = path.join(__dirname, 'db.json')

// ── Simple JSON Database ──
function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const init = {
        users: [{ id: 1, name: 'Bosh Admin', username: 'admin', password: bcrypt.hashSync('admin2008#', 10), role: 'admin', active: true, email: 'admin@yoshijodkor.uz', createdAt: new Date().toISOString() }],
        products: [], orders: [], customOrders: []
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(init, null, 2))
      return init
    }
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'))
  } catch(e) {
    return { users: [], products: [], orders: [], customOrders: [] }
  }
}

function writeDB(data) {
  try { fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2)) } catch(e) {}
}

// ── Middleware ──
app.use(cors({ origin: '*', credentials: true }))
app.use(express.json({ limit: '10mb' }))

// ── Auth middleware ──
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Token kerak' })
  try { req.user = jwt.verify(token, SECRET); next() }
  catch { res.status(401).json({ error: 'Token yaroqsiz' }) }
}
function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin huquqi kerak' })
  next()
}

// ── HEALTH ──
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'Yoshijodkor API ishlayapti!' }))

// ── AUTH ──
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body
  const db = readDB()
  const user = db.users.find(u => u.username === username?.trim() && u.active)
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ error: "Login yoki parol noto'g'ri" })
  const token = jwt.sign({ id: user.id, username: user.username, role: user.role, name: user.name }, SECRET, { expiresIn: '7d' })
  const { password: _, ...safeUser } = user
  res.json({ token, user: safeUser })
})

app.get('/api/auth/me', auth, (req, res) => {
  const db = readDB()
  const user = db.users.find(u => u.id === req.user.id)
  if (!user) return res.status(404).json({ error: 'Topilmadi' })
  const { password, ...safeUser } = user
  res.json(safeUser)
})

// ── PRODUCTS ──
app.get('/api/products', (req, res) => {
  const db = readDB()
  let products = db.products
  const { category, search } = req.query
  if (category && category !== 'all') products = products.filter(p => p.category === category)
  if (search) { const q = search.toLowerCase(); products = products.filter(p => p.name_uz?.toLowerCase().includes(q) || p.author?.toLowerCase().includes(q)) }
  res.json(products)
})
app.get('/api/products/:id', (req, res) => {
  const db = readDB()
  const p = db.products.find(p => p.id === Number(req.params.id))
  p ? res.json(p) : res.status(404).json({ error: 'Topilmadi' })
})
app.post('/api/products', auth, adminOnly, (req, res) => {
  const db = readDB()
  const product = { ...req.body, id: Date.now(), price: Number(req.body.price)||0, stock: Number(req.body.stock)||0, createdAt: new Date().toISOString() }
  db.products.unshift(product); writeDB(db)
  res.status(201).json(product)
})
app.put('/api/products/:id', auth, adminOnly, (req, res) => {
  const db = readDB(); const id = Number(req.params.id)
  const i = db.products.findIndex(p => p.id === id)
  if (i < 0) return res.status(404).json({ error: 'Topilmadi' })
  db.products[i] = { ...db.products[i], ...req.body, price: Number(req.body.price)||0, stock: Number(req.body.stock)||0 }
  writeDB(db); res.json(db.products[i])
})
app.delete('/api/products/:id', auth, adminOnly, (req, res) => {
  const db = readDB()
  db.products = db.products.filter(p => p.id !== Number(req.params.id))
  writeDB(db); res.json({ success: true })
})

// ── ORDERS ──
app.post('/api/orders', (req, res) => {
  const db = readDB()
  const order = { ...req.body, id: 'ORD-' + Date.now(), status: 'new', createdAt: new Date().toISOString() }
  db.orders.unshift(order); writeDB(db)
  res.status(201).json({ id: order.id, success: true })
})
app.get('/api/orders', auth, adminOnly, (req, res) => res.json(readDB().orders))
app.put('/api/orders/:id/status', auth, adminOnly, (req, res) => {
  const db = readDB(); const o = db.orders.find(o => o.id === req.params.id)
  if (o) { o.status = req.body.status; writeDB(db) }
  res.json({ success: true })
})

// ── CUSTOM ORDERS ──
app.post('/api/custom-orders', (req, res) => {
  const db = readDB()
  const order = { ...req.body, id: 'CUS-' + Date.now(), status: 'new', createdAt: new Date().toISOString() }
  db.customOrders.unshift(order); writeDB(db)
  res.status(201).json({ id: order.id, success: true })
})
app.get('/api/custom-orders', auth, adminOnly, (req, res) => res.json(readDB().customOrders))
app.put('/api/custom-orders/:id/status', auth, adminOnly, (req, res) => {
  const db = readDB(); const o = db.customOrders.find(o => o.id === req.params.id)
  if (o) { o.status = req.body.status; writeDB(db) }
  res.json({ success: true })
})

// ── USERS ──
app.get('/api/users', auth, adminOnly, (req, res) => {
  res.json(readDB().users.map(({ password, ...u }) => u))
})
app.post('/api/users', auth, adminOnly, (req, res) => {
  const db = readDB()
  if (db.users.find(u => u.username === req.body.username)) return res.status(400).json({ error: 'Bu username band' })
  const user = { ...req.body, id: Date.now(), password: bcrypt.hashSync(req.body.password, 10), active: true, createdAt: new Date().toISOString() }
  db.users.push(user); writeDB(db)
  const { password, ...safeUser } = user
  res.status(201).json(safeUser)
})
app.put('/api/users/:id', auth, adminOnly, (req, res) => {
  const db = readDB(); const id = Number(req.params.id)
  const i = db.users.findIndex(u => u.id === id)
  if (i < 0) return res.status(404).json({ error: 'Topilmadi' })
  const update = { ...req.body }
  if (update.password) update.password = bcrypt.hashSync(update.password, 10)
  db.users[i] = { ...db.users[i], ...update }; writeDB(db)
  res.json({ success: true })
})
app.delete('/api/users/:id', auth, adminOnly, (req, res) => {
  const db = readDB(); const id = Number(req.params.id)
  if (id === req.user.id) return res.status(400).json({ error: "O'zingizni o'chira olmaysiz" })
  db.users = db.users.filter(u => u.id !== id); writeDB(db)
  res.json({ success: true })
})
app.patch('/api/users/:id/toggle', auth, adminOnly, (req, res) => {
  const db = readDB(); const id = Number(req.params.id)
  const u = db.users.find(u => u.id === id)
  if (!u) return res.status(404).json({ error: 'Topilmadi' })
  u.active = !u.active; writeDB(db)
  res.json({ success: true, active: u.active })
})

// ── START ──
app.listen(PORT, '0.0.0.0', () => {
  console.log('Server started on port ' + PORT)
})
