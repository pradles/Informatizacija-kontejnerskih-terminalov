import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Role from '../models/Role.js';
import { CreateSuccess } from '../utils/success.js';
import { CreateError } from '../utils/error.js';
import nodemailer from 'nodemailer';
import UserToken from '../models/UserToken.js';



export const register = async (req, res, next)=>{
    try {
        const roles = await Role.find({ _id: { $in: req.body.roles } });
        const salt = await bcrypt.genSalt(10);
        console.log(req.body)
        const hashPassword = await bcrypt.hash(req.body.password, salt);
        const newUser = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            username: req.body.username,
            email: req.body.email,
            password: hashPassword,
            roles: roles
        });
        await newUser.save();
        return next(CreateSuccess(200, "User registered successfully."))
    } catch (error) {
        return next(CreateError(500, "Error registering user."))
    }
}

export const login = async (req, res, next)=>{
    try {
        const user = await User.findOne({email: req.body.email}).populate("roles", "role");
        if(!user) {
            return next(CreateError(400, "User not found."));
        }
        const { roles } = user;
        const isPasswordCorrect = await bcrypt.compare(req.body.password, user.password);
        if(!isPasswordCorrect) {
            return next(CreateError(400, "Password is incorect."));
        }
        const token = jwt.sign(
            {id: user._id, isAdmin: user.isAdmin, roles: roles},
            process.env.JWT_SECRET
        )
        res.cookie("access_token", token, {httpOnly: true, secure: true, sameSite: 'Strict'})
        .status(200)
        .json({
            status: 200,
            message: "Login successful",
            data: user,
        })
        // return next(CreateError(200, "Login successful."));

    } catch (error) {
        return next(CreateError(500, "Error logging in."))
    }
}

export const registerAdmin = async (req, res, next)=>{
    try {
        const role = await Role.find({ });
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(req.body.password, salt);
        const newUser = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            username: req.body.username,
            email: req.body.email,
            password: hashPassword,
            isAdmin: true,
            roles: role
        });
        await newUser.save();
        return next(CreateSuccess(200, "Admin user registered successfully."))
    } catch (error) {
        return next(CreateError(500, "Error registering admin user."))
    }
}

export const sendEmail = async (req, res, next)=>{
    try {
        const email = req.body.email;
        const user = await User.findOne({email: {$regex: '^'+email+'$', $options: 'i'}});
        if(!user) {
            return next(CreateError(404, "User email not found."))
        }
        const payload = {
            email: user.email
        }
        const expiryTime = 300;
        const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: expiryTime});

        const newToken = new UserToken({
            userId: user._id,
            token: token
        });

        const mailTransporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "domace.borovnicke@gmail.com",
                pass: "wrti cgeg yjoa gaea"
            }
        });
        let mailDetails = {
            from: "domace.borovnicke@gmail.com",
            to: email,
            subject: "Reset password",
            html: 
            `
            <html>
            <head>
                <title>Password Reset Request</title>
            </head>
            <body>
                <h1>Password Reset Request</h1>
                <p>Dear ${user.username}</p>
                <p>We have received a request to reset your password. To complete the password reset please click on the button below.</p>
                <a href=${process.env.LIVE_URL}/reset-password/${token}><button style="background-color: #4CAF50; color: white; padding: 14px 20px; border: none; cursor: pointer">Reset Password</button></a>
                <p>Please note that this link is only valid for 5 minutes. If you did not request a password reset, please disregard this message</p>
                <p>Thank you,</p>
                <p>IKT Team!</p>
            </body>
            </html>
            `
        };
        mailTransporter.sendMail(mailDetails, async(err, data)=>{
            if(err){
                console.log(err);
                return next(CreateError(500, "Something went wrong creating the reset password email"));
            }else {
                await newToken.save();
                return next(CreateSuccess(200, "Email sent Successfully."))
            }
        })
    } catch (error) {
        return next(CreateError(500, "Error sending reset email."))
    }
}


export const resetPassword = async (req, res, next)=>{
    try {
        const token = req.body.token;
        const newPassword = req.body.password;

        jwt.verify(token, process.env.JWT_SECRET, async(err, data)=>{
            if(err) {
                return next(CreateError(500, "Reset link is Expired"));
            }else {
                const response = data;
                const user = await User.findOne({email: {$regex: '^'+response.email+'$', $options: 'i'}});
                const salt = await bcrypt.genSalt(10);
                const encryptedPassword = await bcrypt.hash(newPassword, salt);
                user.password = encryptedPassword;
                try {
                    const updateUser = await User.findOneAndUpdate(
                        {_id: user.id },
                        {$set: user},
                        {new: true}
                    );
                    return next(CreateSuccess(200, "Password reset successful."));
                } catch (error) {
                    return next(CreateError(500, "Error while trying to reset password."));
                }
            }
        })
    } catch (error) {
        return next(CreateError(500, "Error reseting password."))
    }
}

