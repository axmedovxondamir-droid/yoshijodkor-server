const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const path = require('path')
const bcrypt = require('bcryptjs')

const adapter = new FileSync(path.join(__dirname, 'db.json'))
const db = low(adapter)

// Default data
db.defaults({
  users: [
    {
      id: 1,
      name: 'Bosh Admin',
      username: 'admin',
      password: bcrypt.hashSync('admin123', 10),
      email: 'admin@yoshijodkor.uz',
      role: 'admin',
      active: true,
      createdAt: new Date().toISOString()
    }
  ],
  products: [
    {
      id: 1,
      name_uz: "Qo'lda chizilgan manzara rasmi",
      name_ru: "Пейзаж акварелью",
      desc_uz: "Akvarel bo'yoqda chizilgan, ramkaga joylangan chiroyli manzara rasmi.",
      desc_ru: "Красивый пейзаж, нарисованный акварелью в рамке.",
      price: 80000,
      stock: 1,
      category: 'paintings',
      author: "Dilnoza Yusupova",
      class_uz: "8-sinf",
      class_ru: "8-класс",
      school: '',
      district: 'Qarshi shahri',
      phone: '+998901234567',
      image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=500&q=80",
      isNew: true,
      createdAt: new Date().toISOString()
    }
  ],
  orders: [],
  customOrders: []
}).write()

module.exports = db
