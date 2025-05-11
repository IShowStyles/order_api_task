"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class IndexController {
    getIndex(req, res) {
        res.send('Welcome to the Express app!');
    }
}
exports.default = IndexController;
