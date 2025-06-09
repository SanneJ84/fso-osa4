// API-testit blogien käsittelyyn
// Testataan reittien toimivuutta ja varmistetaan, että blogit palautetaan JSON-muodossa

const { test, after, beforeEach } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const assert = require('node:assert')
const Blog = require('../models/blog')

const api = supertest(app)

// Testi blogit

const initialBlogs = [                                         // Alustetaan testidataa
  {     title: 'Test Blog 1',
        author: 'Author 1',
        url: 'http://testblog1.com',
        likes: 5
    },
    {   title: 'Test Blog 2',
        author: 'Author 2',
        url: 'http://testblog2.com',
        likes: 10
    }
]

// Ennen jokaista testiä tyhjennetään tietokanta ja lisätään testiblogit 
beforeEach(async () => {
  await Blog.deleteMany({})
  let blogObject = new Blog(initialBlogs[0])
  await blogObject.save()
  blogObject = new Blog(initialBlogs[1])
  await blogObject.save()
})

test('blogs are returned as json', async () => {            // Testaa, että blogit palautetaan JSON-muodossa
    const response = await api.get('/api/blogs')            // Tulostetaan blogit konsoliin jotta nähdään kongreettisesti mitä palautetaan
    console.log(response.body)                              // Konsoliin tulostetaan blogit
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('all blogs are returned', async () => {                // Testaa, että kaikki blogit palautetaan
  const response = await api.get('/api/blogs')

  assert.strictEqual(response.body.length, initialBlogs.length)
})

test('blogs have an id field', async () => {
  const response = await api.get('/api/blogs')

  response.body.forEach(blog => {                           // Käydään läpi jokainen blogi ja tarkistetaan, että id-kenttä on olemassa
    assert.strictEqual(typeof blog.id, 'string', 'Blogilla ei ole id kenttää tai se ei ole merkkijono')
  })
})

test('a valid blog can be added', async () => {             // Testaa, että uusi blogi voidaan lisätä
  const newBlog = {                                         // Määritellään uusi blogi 
    title: 'New Blog',
    author: 'New Author',
    url: 'http://newblog.com',
    likes: 7
    };

    await api                                               // Lähetetään POST-pyyntö uuden blogin lisäämiseksi
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

  test('a blog can be deleted', async () => {              // Testaa, että blogi voidaan poistaa
    const blogsAtStart = await api.get('/api/blogs')       // Haetaan kaikki blogit alussa
    const blogToDelete = blogsAtStart.body[0]              // Valitaan ensimmäinen blogi poistettavaksi

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)             // Lähetetään DELETE-pyyntö blogin poistamiseksi
      .expect(204)                                         // Odotetaan 204-tilakoodia, joka tarkoittaa onnistunutta poistoa

    const blogsAtEnd = await api.get('/api/blogs')                      // Haetaan kaikki blogit lopussa
    assert.strictEqual(blogsAtEnd.body.length, initialBlogs.length - 1) // Tarkistetaan, että blogien määrä on vähentynyt yhdellä
    console.log('Blogi poistettu:', blogToDelete.title)                 // Tulostaa konsoliin poistetun blogin nimen
    console.log('Jäljellä olevat blogit:', blogsAtEnd.body)             // Tulostaa konsoliin jäljellä olevat blogit
  })


after(async () => {
  await mongoose.connection.close()
})