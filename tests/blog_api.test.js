// API-testit blogien käsittelyyn
// Testataan reittien toimivuutta ja varmistetaan, että blogit palautetaan JSON-muodossa

const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const assert = require('node:assert')
const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcrypt')
const helper = require('./test_helper')

const api = supertest(app)

const initialBlogs = [                                         // Alustetaan testidataa
  {     
    title: 'Test Blog 1',
    author: 'Author 1',
    url: 'http://testblog1.com',
    likes: 5
  },
  {   
    title: 'Test Blog 2',
    author: 'Author 2',
    url: 'http://testblog2.com',
    likes: 10
  },
]

// Ennen kaikkia testejä tyhjennetään tietokanta ja luodaan yksi käyttäjä, jolla on kaksi blogia
beforeEach(async () => {
  await Blog.deleteMany({});                                                // Poistetaan kaikki blogit tietokannasta ennen jokaista testiä
  await User.deleteMany({});                                                // Poistetaan kaikki käyttäjät tietokannasta ennen jokaista testiä

  const passwordHash = await bcrypt.hash('sekret', 10)                      // Hashataan salasana bcrypt-kirjastolla, 10 on suolauskerroin eli kuinka monta kertaa salasana hashataan 
  const user = new User({ username: 'root', passwordHash })                 // Luodaan uusi käyttäjä, jolla on käyttäjätunnus 'root' ja hashattu salasana

  await user.save()                                                         // Tallennetaan käyttäjä tietokantaan

  const users = await helper.usersInDb()                                    // Haetaan kaikki käyttäjät tietokannasta

  const blogObject1 = new Blog({ ...initialBlogs[0], user: users[0].id });  // Luodaan uusi blogi, joka sisältää ensimmäisen testiblogin tiedot ja käyttäjän ID:n
  await blogObject1.save();                                                 // Tallennetaan blogi tietokantaan     

  const blogObject2 = new Blog({ ...initialBlogs[1], user: users[0].id });  // Luodaan toinen blogi, joka sisältää toisen testiblogin tiedot ja käyttäjän ID:n
  await blogObject2.save();                                                 // Tallennetaan toinen blogi tietokantaan
  
})


describe('when there is initially one user at db', () => {                  // Testataan käyttäjien luomista ja hallintaa

  beforeEach(async () => {                                                  // Ennen jokaista testiä tyhjennetään tietokanta ja luodaan yksi käyttäjä
    await User.deleteMany({})                                               // Poistetaan kaikki käyttäjät tietokannasta
    const passwordHash = await bcrypt.hash('sekret', 10)                    // Hashataan salasana bcrypt-kirjastolla
    const user = new User({ username: 'root', passwordHash })               // Luodaan uusi käyttäjä, jolla on käyttäjätunnus 'root' ja hashattu salasana
    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {             // Testaa, että uusi käyttäjä voidaan luoda
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    assert(usernames.includes(newUser.username))
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert(result.body.error.includes('expected `username` to be unique'))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })
})

test('blogs are returned as json', async () => {                          // Testaa, että blogit palautetaan JSON-muodossa
    const response = await api.get('/api/blogs')                          // Tulostetaan blogit konsoliin jotta nähdään kongreettisesti mitä palautetaan
    console.log(response.body)                                            // Konsoliin tulostetaan blogit
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('all blogs are returned', async () => {                              // Testaa, että kaikki blogit palautetaan
  const response = await api.get('/api/blogs')

  assert.strictEqual(response.body.length, initialBlogs.length)
})

test('blogs have an id field', async () => {
  const response = await api.get('/api/blogs')

  response.body.forEach(blog => {                                                         // Käydään läpi jokainen blogi ja tarkistetaan, että id-kenttä on olemassa
    assert.strictEqual(typeof blog.id, 'string', 'Blogilla ei ole id kenttää tai se ei ole merkkijono')
  })
})

test('a valid blog can be added', async () => {                                           // Testaa, että uusi blogi voidaan lisätä
  const newBlog = {                                                                       // Määritellään uusi blogi 
    title: 'New Blog',
    author: 'New Author',
    url: 'http://newblog.com',
    likes: 7
    };

    await api                                                                             // Lähetetään POST-pyyntö uuden blogin lisäämiseksi
    .post('/api/blogs')
    .send(newBlog)  
    .expect(201)
    .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')  
    const titles = response.body.map(blog => blog.title)

  // Tarkistetaan, että blogien määrä on kasvanut yhdellä
  assert.strictEqual(response.body.length, initialBlogs.length + 1)                         // Tarkistaa, että blogin määrä on kasvanut yhdellä
  assert.ok(titles.includes(newBlog.title), 'Uusi blogi ei löytynyt blogien joukosta') 
  console.log('Uusi blogi lisätty:', newBlog.title)                                         // Tulostaa konsoliin uuden blogin nimen
  console.log('Kaikki blogit:', response.body)                                              // Tulostaa konsoliin kaikki blogit
  })

  test('a blog can be deleted', async () => {                                               // Testaa, että blogi voidaan poistaa
    const blogsAtStart = await api.get('/api/blogs')                                        // Haetaan kaikki blogit alussa
    const blogToDelete = blogsAtStart.body[0]                                               // Valitaan ensimmäinen blogi poistettavaksi

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)                                              // Lähetetään DELETE-pyyntö blogin poistamiseksi
      .expect(204)                                                                          // Odotetaan 204-tilakoodia, joka tarkoittaa onnistunutta poistoa

    const blogsAtEnd = await api.get('/api/blogs')                                          // Haetaan kaikki blogit lopussa
    assert.strictEqual(blogsAtEnd.body.length, initialBlogs.length - 1)                     // Tarkistetaan, että blogien määrä on vähentynyt yhdellä
    console.log('Blogi poistettu:', blogToDelete.title)                                     // Tulostaa konsoliin poistetun blogin nimen
    console.log('Jäljellä olevat blogit:', blogsAtEnd.body)                                 // Tulostaa konsoliin jäljellä olevat blogit
  })


after(async () => {
  await mongoose.connection.close()
})