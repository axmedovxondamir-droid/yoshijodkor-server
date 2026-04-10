const jwt = require('jsonwebtoken')
const SECRET = process.env.JWT_SECRET || 'maktab_market_secret_2024'

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Token kerak' })
  try {
    req.user = jwt.verify(token, SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Token yaroqsiz' })
  }
}

function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin huquqi kerak' })
  }
  next()
}

module.exports = { authMiddleware, adminOnly }
