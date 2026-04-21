import 'dotenv/config';
import jwt  from "jsonwebtoken"

export interface UserTokenPayload {
    id:number
}

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_ACCESS_SECRET || !JWT_REFRESH_SECRET) {
    throw new Error("JWT secrets are not defined in .env");
}

export const generateAccessToken = (payload: UserTokenPayload)=>{
    const token = jwt.sign(payload, JWT_ACCESS_SECRET, {
        expiresIn: "5m"
    })
    return token;
}

export const verifyAccessToken = (token: string):UserTokenPayload | null =>{
    try {
        const payload = jwt.verify(token, JWT_ACCESS_SECRET) as UserTokenPayload
        return payload
    } catch (error) {
        return null
    }
    
}

export const generateRefreshToken = (payload: UserTokenPayload)=>{
    const token = jwt.sign(payload, JWT_REFRESH_SECRET, {
        expiresIn: "1d"
    })
    return token;
}

export const verifyRefreshToken = (token: string)=>{
    try {
        const payload = jwt.verify(token, JWT_REFRESH_SECRET)
        return payload
    } catch (error) {
        return null
    }
    
}