import rateLimit from "express-rate-limit";
import type { Request } from "express";

const createOrderLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  keyGenerator: (req: Request) => {
    if (req.body && req.body.userId) {
      return String(req.body.userId);
    }
    if (req.ip) {
      return req.ip;
    }
    const forwarded = req.headers["x-forwarded-for"];
    if (Array.isArray(forwarded)) {
      return forwarded[0];
    }
    if (typeof forwarded === "string") {
      return forwarded;
    }
    return "";
  },
  handler: (_req, res) =>
    res
      .status(429)
      .json({ error: "Too many requests, please try again later." }),
});

const getOrdersLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  keyGenerator: (req: Request) => {
    if (req.params && req.params.userId) {
      return String(req.params.userId);
    }
    if (req.ip) {
      return req.ip;
    }
    const forwarded = req.headers["x-forwarded-for"];
    if (Array.isArray(forwarded)) {
      return forwarded[0];
    }
    if (typeof forwarded === "string") {
      return forwarded;
    }
    return "";
  },
  handler: (_req, res) =>
    res
      .status(429)
      .json({ error: "Too many requests, please try again later." }),
});

export { createOrderLimiter, getOrdersLimiter };
