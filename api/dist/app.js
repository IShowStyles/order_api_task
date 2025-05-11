"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const winston_1 = __importDefault(require("winston"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
const rate_limit_1 = require("./utils/rate-limit");
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
app.use(express_1.default.json());
const logger = winston_1.default.createLogger({
    level: "info",
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
    transports: [new winston_1.default.transports.Console()],
});
app.use((0, morgan_1.default)("combined", {
    stream: { write: (msg) => logger.info(msg.trim()) },
}));
app.post("/orders", rate_limit_1.createOrderLimiter, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { userId, productId, quantity } = req.body;
    if (!userId || !productId || !quantity) {
        res
            .status(400)
            .json({ error: "userId, productId and quantity are required." });
        return;
    }
    try {
        const user = yield prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            res.status(404).json({ error: "User not found." });
            return;
        }
        const product = yield prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product) {
            res.status(404).json({ error: "Product not found." });
            return;
        }
        const price = product.price;
        const totalPrice = (_a = price === null || price === void 0 ? void 0 : price.toNumber()) !== null && _a !== void 0 ? _a : 0 * quantity;
        if (totalPrice <= 0) {
            res.status(400).json({ error: "Invalid total price." });
            return;
        }
        const userBalance = user.balance;
        const userBalanceNumber = (_b = userBalance === null || userBalance === void 0 ? void 0 : userBalance.toNumber()) !== null && _b !== void 0 ? _b : 0;
        if (userBalanceNumber < totalPrice) {
            res.status(403).json({ error: "Insufficient balance." });
            return;
        }
        if (product.stock < quantity) {
            res.status(400).json({ error: "Insufficient stock." });
            return;
        }
        // ─── transactional update ─────────────────────────────────────────────
        const order = yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            yield tx.user.update({
                where: { id: userId },
                data: { balance: { decrement: totalPrice } },
            });
            yield tx.product.update({
                where: { id: productId },
                data: { stock: { decrement: quantity } },
            });
            return tx.order.create({
                data: { userId, productId, quantity, totalPrice },
            });
        }));
        logger.info(`Order created: ${order.id}`, { order });
        res.status(201).json(order);
    }
    catch (err) {
        next(err);
    }
}));
// ─── GET /orders/:userId ────────────────────────────────────────────────────────
app.get("/orders/:userId", rate_limit_1.getOrdersLimiter, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const user = yield prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            res.status(404).json({ error: "User not found." });
            return;
        }
        const orders = yield prisma.order.findMany({
            where: { userId },
            include: { product: true },
        });
        res.json(orders);
    }
    catch (err) {
        next(err);
    }
}));
app.use((err, req, res, next) => {
    logger.error(err.message, { stack: err.stack });
    res.status(500).json({ error: "Internal server error." });
});
const PORT = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : 3000;
app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
});
