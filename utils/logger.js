// Konsoliin loggaus tämän moduulin vastuulla


// Tämä funktio loggaa konsoliin informaatiota
const info = (...params) => {
  if (process.env.NODE_ENV !== 'test') { 
    console.log(...params)
  }
}


// Tämä funktio loggaa konsoliin virheitä
const error = (...params) => {
  if (process.env.NODE_ENV !== 'test') { 
    console.error(...params)
  }
}

module.exports = { info, error }