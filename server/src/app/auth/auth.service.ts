import {z} from 'zod'

export const signupPayloadModel = z.object({
    username: z.string().min(2).max(20),
    password: z.string().min(2).max(225),
    role: z.string().min(2).max(10)
})

export const signinPayloadModel = z.object({
    username: z.string,
    password: z.string().min(6).max(225)
})