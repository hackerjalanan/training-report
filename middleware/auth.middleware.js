const jwt = require("jsonwebtoken");
const AuthenticationError = require("../error/authentication.error").AuthenticationError;

// 1. cec token
const tokenvalidation = (req, res, next) => {
  // Ambil token dari header Authorization atau cookie
  const authorizationHeader = req.headers['authorization'] || req.get("Authorization");
  const tokenFromHeader = authorizationHeader?.split(" ")[1];
  const tokenFromCookie = req.cookies?.auth_token;
  const token = tokenFromHeader || tokenFromCookie;

  if (!token) {
    return next(new AuthenticationError("Token not found, login first!"));
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

    // Set data ke request untuk digunakan di controller
    req.staff_id = staff_id;
    req.username = username;
    req.role_id = role_id;
    req.email = email;
    req.role_name = role_name;
    req.name = name;

    // Buat token baru (refresh token tiap request)
    const refreshedToken = jwt.sign(
      { staff_id, username, name, role_id, role_name, email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Kirim ulang token ke client via header
    res.setHeader("Authorization", `Bearer ${refreshedToken}`);
    res.setHeader("Access-Control-Expose-Headers", "Authorization");

    // ✅ Juga perbarui token di cookie
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 3600000
    });
    next();
  });
};

module.exports = { tokenvalidation };
