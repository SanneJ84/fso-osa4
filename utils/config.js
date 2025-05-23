// Ympäristömuuttujien käsittely tämän moduulin vastuulla

require('dotenv').config()
 
const PORT = 3003
const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster1.lszdbja.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1`
 
module.exports = {
  MONGODB_URI,
  PORT
}