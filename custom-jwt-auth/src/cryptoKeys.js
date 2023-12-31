import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

/**
 * Create environment variables PUB_KEY and PRIV_KEY that have
 * relative path + filename of pem key pairs
 * 
 * For develeopment, a .env file can be used for the environmental variables
 * 
 * Private key is used to signed JWT
 * Public key is used to verify JWT was not tampered with and was generated by us
 * 
 * Any JS source file that needs to use PUB_KEY or PRIV_KEY can do:
 * import {PUB_KEY, PRIV_KEY} from "./src/cryptoKeys.js";
 */

export const PUB_KEY = fs.readFileSync(process.env.PUB_KEY_FILE, 'utf8');
export const PRIV_KEY = fs.readFileSync(process.env.PRIV_KEY_FILE, 'utf8');

