"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrdersLimiter = exports.createOrderLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const createOrderLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 10,
    keyGenerator: (req) => {
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
    handler: (_req, res) => res
        .status(429)
        .json({ error: "Too many requests, please try again later." }),
});
exports.createOrderLimiter = createOrderLimiter;
const getOrdersLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 10,
    keyGenerator: (req) => {
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
    handler: (_req, res) => res
        .status(429)
        .json({ error: "Too many requests, please try again later." }),
});
exports.getOrdersLimiter = getOrdersLimiter;
