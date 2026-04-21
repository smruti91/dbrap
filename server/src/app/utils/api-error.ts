class ApiError extends Error{
    statusCode:number;
    isOperational: boolean;
    errors?: any;

    constructor(statusCode:number, message: string, errors?:any){
        super(message);
        this.statusCode = statusCode
        this.errors = errors
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor)
    }

    static badRequest(message = "Bad request") {
        return new ApiError(400, message);
    }
   static validationError(message = "Bad request", errors:any) {
        return new ApiError(400, message, errors);
    }
    static unauthorized(message = "Unauthorized") {
        return new ApiError(401, message);
    }
    static conflict(message = "Conflict") {
        return new ApiError(409, message);
    }
    static forbidden(message = "forbidden") {
        return new ApiError(412, message);
    }
    static notfound(message = "notfound") {
        return new ApiError(412, message);
    }
}

export default ApiError;