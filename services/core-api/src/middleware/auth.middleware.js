const jwt = require('jsonwebtoken')

module.exports = function (req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({message: "Доступ запрещен. Токен не предоставлен"})
  }

  const token = authHeader.split(' ')[1]

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch (e) {
    return res.status(403).json({ error: 'Недействительный или просроченный токен' });
  }
}