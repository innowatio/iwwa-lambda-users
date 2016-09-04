import dotenv from "dotenv";

dotenv.load();

export const MONGODB_URL = process.env.MONGODB_URL || "mongodb://localhost:27017/test";
export const USERS_COLLECTION_NAME = process.env.USERS_COLLECTION_NAME || "users";