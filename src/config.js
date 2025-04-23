import { readFileSync } from "fs";
import path from "path"; 

const env = process.env.NODE_ENV || "development";


const configPath = path.resolve("./config.json");
const configFile = readFileSync(configPath, "utf-8");
const config = JSON.parse(configFile)[env];

export default config;