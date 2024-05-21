import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Role from '../models/Role.js';
import { CreateSuccess } from '../utils/success.js';
import { CreateError } from '../utils/error.js';
import Terminal from '../models/Terminal.js';

export const createTerminal = async (req, res, next)=>{
    try {
        const newTerminal = new Terminal({
            name: req.body.name,
            location: req.body.location,
            array3D: req.body.array3D
        });
        await newTerminal.save();
        return next(CreateSuccess(200, "Terminal created successfully."))
    } catch (error) {
        return next(CreateError(500, "Error creating terminal."))
    }
}

export const updateTerminal = async (req, res, next) => {
    try {
        const updatedTerminal = await Terminal.findByIdAndUpdate(
            req.body._id,
            { $set: req.body },
            { new: true }
        );
        if (updatedTerminal) {
            return next(CreateSuccess(200, "Terminal updated successfully."));
        } else {
            return next(CreateError(404, "Terminal not found."));
        }
    } catch (error) {
        return next(CreateError(500, "Error updating terminal."));
    }
};

export const getAllTerminals = async (req, res, next) => {
    try {
        const terminals = await Terminal.find();
        return next(CreateSuccess(200, "Terminals retrieved successfully.", terminals));
    } catch (error) {
        return next(CreateError(500, "Error retrieving terminals."));
    }
};

export const getTerminalById = async (req, res, next) => {
    try {
        const terminal = await Terminal.findById(req.params.id);
        if (terminal) {
            return next(CreateSuccess(200, "Terminal retrieved successfully.", terminal));
        } else {
            return next(CreateError(404, "Terminal not found."));
        }
    } catch (error) {
        return next(CreateError(500, "Error retrieving terminal."));
    }
};

export const deleteTerminal = async (req, res, next) => {
    try {
        const deletedTerminal = await Terminal.findByIdAndDelete(req.params.id);
        if (deletedTerminal) {
            return next(CreateSuccess(200, "Terminal deleted successfully."));
        } else {
            return next(CreateError(404, "Terminal not found."));
        }
    } catch (error) {
        return next(CreateError(500, "Error deleting terminal."));
    }
};

export const updateStorage = async (req, res, next)=>{

}