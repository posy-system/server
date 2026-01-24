const mongoose = require('mongoose');
const {hashPassword} = require('../helpers/auth');
const userSchema = new mongoose.Schema({

    username:{
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    }

}, { timestamps: true });

userSchema.pre('save', async function() {
    if (this.isModified('password')) {
        this.password = await hashPassword(this.password);
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;