// Tämä tiedosto sisältää funktioita, jotka käsittelevät blogeihin liittyviä operaatioita, kuten tykkäysten laskemista ja suosituimman blogin löytämistä


// Palauttaa aina 1, ja sitä käytetään testien apufunktiona
const dummy = (blogs) => {
    return 1
}


// Laskee kaikkien blogien tykkäykset. Jos lista on tyhjä, palautetaan 0
// Muussa tapauksessa käytetään reduce-funktiota summan laskemiseen
const totalLikes = (blogs) => {
  const reducer = (sum, item) => {
    return sum + item.likes
  }
  return blogs.length === 0
    ? 0
    : blogs.reduce(reducer, 0)
}


// Etsii ja palauttaa blogin, jolla on eniten tykkäyksiä.
// Jos lista on tyhjä, palautetaan null.
const favoriteBlogs = (blogs) => {
  if (blogs.length === 0) {
    return null
  }
  return blogs.reduce((prev, current) => {
    return (prev.likes > current.likes) ? prev : current
  })
}


module.exports = {
  dummy,
  totalLikes,
  favoriteBlogs
}