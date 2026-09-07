const jwt = require('jsonwebtoken');
const { AuthenticationError } = require('../error/authentication.error');

// 1. validation
const validationRole = (allowedRoles = []) => {
  return (req, res, next) => {
    const token = req.cookies?.auth_token; // ← ambil dari 'auth_token' sesuai screenshot

    if (!token) {
      return next(new AuthenticationError("Token not found in cookies. Please login."));
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        const cause = err.name === "TokenExpiredError"
          ? "Token has expired."
          : err.name === "JsonWebTokenError"
          ? "Token is invalid."
          : "Unknown token verification error.";

        return next(new AuthenticationError(cause));
      }

      const { staff_id, username, email, name, role_id, role_name } = decoded;

      req.staff_id = staff_id;
      req.username = username;
      req.role_id = role_id;
      req.email = email;
      req.role_name = role_name;
      req.name = name;

      if (!allowedRoles.includes(role_id)) {
        return next(new AuthenticationError("Access denied. Role not authorized."));
      }

      const refreshedToken = jwt.sign(
        { staff_id, username, name, role_id, role_name, email },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.cookie("auth_token", refreshedToken, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 60 * 60 * 1000
      });

      next();
    });
  };
};



const verifyToken = (req, res, next) => {
  const token = req.cookies?.auth_token; // ← Ambil dari cookie, bukan header

  if (!token) {
    return res.status(401).json({
      metaData: {
        message: "Token tidak ditemukan di cookie.",
        code: "401",
        response_code: "AUTH_REQUIRED",
      },
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.staff_id = decoded.staff_id;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      metaData: {
        message: "Token tidak valid atau kadaluarsa.",
        code: "401",
        response_code: "TOKEN_INVALID",
      },
    });
  }
};


module.exports = {
  verifyToken,
  validationRole
};
