import ApiError from "../utils/api-error.js"
import type { Request, Response } from "express"
import { signinPayloadModel, signupPayloadModel } from "./auth.models.js"
import {db} from '../../db/index.js'
import { usersTable } from '../../db/schema.js'
import { eq } from "drizzle-orm"
import { createHmac, randomBytes } from "node:crypto"
import ApiResponse from "../utils/api-response.js"
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, type UserTokenPayload } from "../utils/jwt.utils.js"


class AuthController{
    public handleSignup = async (req: Request, res: Response) => {
    const validationResult = await signupPayloadModel.safeParseAsync(req.body);
    
    if (!validationResult.success) {
        const formattedErrors = validationResult.error.issues.reduce(
            (acc: Record<string, string>, err) => {
            const field = err.path[0] as string;
            acc[field] = err.message;
            return acc;
            },
            {}
        );
        throw ApiError.validationError(
            "Validation failed",
            formattedErrors
        );
    }

    const { username, password, role } = validationResult.data;

    const userResults = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.username, username));

    if (userResults.length > 0) {
        throw ApiError.badRequest("User already exists");
    }

    const salt = randomBytes(32).toString('hex');
    const hash = createHmac('sha256', salt).update(password).digest('hex');

    const [result] = await db
        .insert(usersTable)
        .values({
            username,
            password: hash,
            role,
            salt
        })
        .$returningId();

    return ApiResponse.created(res, "User created", {
        result
    });
};

public handleSignIn = async (req: Request, res: Response) => {

    const validationResult = await signinPayloadModel.safeParseAsync(req.body);

    if (!validationResult.success) {
        const formattedErrors = validationResult.error.issues.reduce(
            (acc: Record<string, string>, err) => {
                const field = err.path[0] as string;
                acc[field] = err.message;
                return acc;
            },
            {}
        );

        throw ApiError.validationError("Validation failed", formattedErrors);
    }

    const { username, password } = validationResult.data;

    const [user] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.username, username));

    if (!user) {
        throw ApiError.notfound("User not found");
    }

    // 🔐 Verify password
    const hash = createHmac('sha256', user.salt!)
        .update(password)
        .digest('hex');

    if (user.password !== hash) {
        throw ApiError.unauthorized("Invalid username or password");
    }

    //  Generate tokens
    const payload = { id: user.id };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    //  Save refresh token in DB
    await db
        .update(usersTable)
        .set({
            refreshToken: refreshToken
        })
        .where(eq(usersTable.id, user.id));

    // Return response
    // 🍪 Set cookies
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false, // true in production (HTTPS)
        sameSite: "lax",
        maxAge: 5 * 60 * 1000, // 5 min
    });

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
    return ApiResponse.ok(res, "Signin successful", {
        accessToken,
        refreshToken,
        user: {               // ← add this
        id:   user.id,
        name: user.username,
        role: user.role,
    }
    });
};

public handleRefreshToken = async (req: Request, res: Response) => {

  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    throw ApiError.unauthorized("Refresh token missing");
  }

  const payload = verifyRefreshToken(refreshToken) as UserTokenPayload;

  if (!payload) {
    throw ApiError.unauthorized("Invalid refresh token");
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, payload.id));

  if (!user || user.refreshToken !== refreshToken) {
    throw ApiError.unauthorized("Invalid refresh token");
  }

  const newAccessToken = generateAccessToken({ id: user.id });
  const newRefreshToken = generateRefreshToken({ id: user.id });

  await db.update(usersTable)
    .set({ refreshToken: newRefreshToken })
    .where(eq(usersTable.id, user.id));

  // 🍪 Update cookies
  res.cookie("accessToken", newAccessToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 5 * 60 * 1000,
  });

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000,
  });

  return ApiResponse.ok(res, "Token refreshed");
};

public handleLogout = async (req: Request, res: Response) => {
     // @ts-ignore
  const userId = req.user?.id;

  if (userId) {
    await db.update(usersTable)
      .set({ refreshToken: null })
      .where(eq(usersTable.id, userId));
  }

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  return ApiResponse.ok(res, "Logged out");
};
public handleMe = async (req: Request, res: Response) => {
     // @ts-ignore
  const { id, username, role } = req.user!;

  
  return res.json({
    username: username,
    role: role
  });
};

}

export default AuthController