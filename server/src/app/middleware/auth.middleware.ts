import type { Request, Response, NextFunction } from 'express'
import ApiError from '../utils/api-error.js'
import { verifyAccessToken} from '../utils/jwt.utils.js'
import { usersTable } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import type { JwtPayload } from 'jsonwebtoken';
import { db } from '../../db/index.js';

export function authenticate(){
    return async function(req: Request, res:Response, next: NextFunction){
        

        const token = req.cookies?.accessToken;
         if (!token) {
            return next(ApiError.unauthorized("Access token missing"));
        }
        
        const decoded = verifyAccessToken(token);

        if (!decoded) {
            return next(ApiError.unauthorized("Invalid or expired token"));
        }
       const [user] = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.id, decoded.id));
        // @ts-ignore
        req.user = {
            id:user?.id,
            name: user?.username,
            role: user?.role,
        }

        next();

       
    }


}

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const user = req.user;

    if (!user || !roles.includes((user as any).role)) {
      return next(ApiError.forbidden("You are not allowed"));
    }

    next();
  };
};