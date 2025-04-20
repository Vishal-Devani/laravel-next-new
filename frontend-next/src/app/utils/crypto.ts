import CryptoJS from "crypto-js";

const SECRET_KEY = "LaravelNext";

export const encrypt = (data: string) => {
    return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
};

export const decrypt = (ciphertext: string) => {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
};
