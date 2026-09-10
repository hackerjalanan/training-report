const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const logger = require("morgan");
const path = require("path");

const indexRouter = require("./router/index.route");
const { urlValidation, handleErrors } = require("./error");

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:4000",
  "https://fe-training-gii.vercel.app",
];


const corsOptions = {
  origin: function (origin, callback) {
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      /^https:\/\/fe-training-gii-.*\.vercel\.app$/.test(origin) // izinkan semua preview deploy
    ) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "x-api-key",
    "x-payload",
    "timezone",
    "utc-offset",
  ],
  exposedHeaders: ["Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "script-src 'self' 'unsafe-inline'");
  next();
});

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(logger("dev"));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api", indexRouter);

app.use(urlValidation);
app.use(handleErrors);

module.exports = app;