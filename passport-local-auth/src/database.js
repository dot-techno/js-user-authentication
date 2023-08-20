import mongoose from "mongoose";

/**
 * This file is used to define all the database schemas we need
 */

const UserSchema = new mongoose.Schema({
    username: String,
    hash: String,
    salt: String,
    admin: Boolean,
});

// Exports to we can use these in other files.
export const User = mongoose.model('User', UserSchema);
