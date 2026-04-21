import {z} from 'zod'

export const signupPayloadModel = z.object({
    username: z.string().min(2, "Username is required").max(20),
    password: z.string().min(2).max(225),
    role: z.string().min(2, "Role is required").max(10)
})

export const signinPayloadModel = z.object({
    username: z.string(),
    password: z.string().min(4).max(225)
})