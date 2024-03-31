import JWT from "jsonwebtoken";
import { asyncHandler } from "../Utils/AsyncHandler.js";
import { ApiError } from "../Utils/ApiError.js";



const isLoggedIn = asyncHandler((req, res, next) => {
  const {token} = req.cookies|| null;
  //console.log(token)

  if (!token) {
    throw new ApiError(400, " You are not Log In  ");
  }

  const userDetails = JWT.verify(token, process.env.SECRET || 'SECRET');
req.user = userDetails;
//console.log(req.user)

  if (!userDetails) {
    throw new ApiError(400, "Not Login ");
  }

  next();
});


const authorizeRoles = (...roles) => async (req, res, next) => {
  console.log(roles);
  // Check if req.user exists and has a role property
  if (!req.user || !req.user.role) {
      // Handle the case when req.user or req.user.role is null or undefined
      throw new ApiError(403, 'You do not have permission to access this route');
  }
  
  const currentUserRole = req.user.role;
  //console.log(currentUserRole);
  
  if (!roles.includes(currentUserRole)) {
      throw new ApiError(403, 'You do not have permission to access this route');
  }
  
  next();
};






export { isLoggedIn, authorizeRoles };
