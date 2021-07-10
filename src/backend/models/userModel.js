const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema({
    name : {
        type: String,
        required : [true, 'Every user must have a name.']
    },
    email: {
		type: String,
		unique: true,
		required: [true, 'Every user must have a email address']
	},
    password: {
		type: String,
		required: [true, 'Every user must have a password.']
	},
    phoneNumber: {
		type: Number,
		required: [true, 'Every user must have a phone number'],
		unique: true,
		validate: {
			validator: function(number){
				return `${number}`.length === 10;
			},
			message: err => `${err.value} is not a valid number`
		}
	},
    role: {
		type: String,
		enum: ['admin', 'user'],
		default: 'user'
	},
},{
	toJSON: { virtuals : true },
	toObject: { virtuals : true },
})

userSchema.pre('save', async function(next){
	const passwordValidator = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;
	if(this.isModified('password')){
		if(passwordValidator.test(this.password)) next();
		else {
			const err = new Error('Password must contain One Uppercase, One lowercase and One number character');
			next(err);
		}
	}
})
userSchema.pre('save', async function(next) {
	if(this.isModified('password')){
		this.password = await bcrypt.hash(this.password, 12);
		next();	
	}
});
userSchema.methods.comparePassword = async function(hashedPassword, enteredPassword) {
	return await bcrypt.compare(hashedPassword, enteredPassword);
}

const User = mongoose.model('User', userSchema);

module.exports = User;