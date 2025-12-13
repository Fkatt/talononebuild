"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decrypt = exports.encrypt = void 0;
const crypto_js_1 = __importDefault(require("crypto-js"));
const config_1 = __importDefault(require("../config"));
const encrypt = (data) => {
    const key = config_1.default.security.encryptionKey;
    const iv = crypto_js_1.default.lib.WordArray.random(16);
    const encrypted = crypto_js_1.default.AES.encrypt(data, crypto_js_1.default.enc.Utf8.parse(key), {
        iv: iv,
        mode: crypto_js_1.default.mode.CBC,
        padding: crypto_js_1.default.pad.Pkcs7,
    });
    return `${iv.toString(crypto_js_1.default.enc.Base64)}:${encrypted.toString()}`;
};
exports.encrypt = encrypt;
const decrypt = (encryptedData) => {
    const key = config_1.default.security.encryptionKey;
    try {
        const parts = encryptedData.split(':');
        if (parts.length !== 2) {
            throw new Error('Invalid encrypted data format');
        }
        const iv = crypto_js_1.default.enc.Base64.parse(parts[0]);
        const ciphertext = parts[1];
        const decrypted = crypto_js_1.default.AES.decrypt(ciphertext, crypto_js_1.default.enc.Utf8.parse(key), {
            iv: iv,
            mode: crypto_js_1.default.mode.CBC,
            padding: crypto_js_1.default.pad.Pkcs7,
        });
        return decrypted.toString(crypto_js_1.default.enc.Utf8);
    }
    catch (error) {
        throw new Error('Failed to decrypt data');
    }
};
exports.decrypt = decrypt;
//# sourceMappingURL=encryption.js.map