import jwt from 'jsonwebtoken'
import { config } from '../config/env.js'

export function generateToken(payload){
   return jwt.sign(payload, config.JWT_SECRET, {expiresIn: config.JWT_EXPIRY})
}


export function verifyToken(token){
   try{
      return jwt.verify(token, config.JWT_SECRET)
   }catch(err){
      return null
   }
}

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid token' })
  }

  const token = authHeader.split(' ')[1]
  const decoded = verifyToken(token)
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid token' })
  }

  req.user = decoded
  next()
}
