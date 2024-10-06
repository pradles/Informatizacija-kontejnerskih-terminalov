import Owner from '../models/Owners.js';
import { CreateSuccess } from '../utils/success.js';
import { CreateError } from '../utils/error.js';

export const addOwner = async (req, res, next)=>{
    try {
        const newOwner = new Owner({
            name: req.body.name,
        });
        const savedOwner = await newOwner.save();
        return next(CreateSuccess(200, `Owner added successfully. Owner ID:${savedOwner._id}`));
    } catch (error) {
        return next(CreateError(500, "Error adding owner."))
    }
}

export const updateOwner = async (req, res, next) => {
    try {
        const updatedOwner = await Owner.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        if (updatedOwner) {
            return next(CreateSuccess(200, "Owner updated successfully."));
        } else {
            return next(CreateError(404, "Owner not found."));
        }
    } catch (error) {
        return next(CreateError(500, "Error updating Owner."));
    }
};

export const getAllOwners = async (req, res, next)=>{
    try {
        const owners = await Owner.find();
        return next(CreateSuccess(200, "Returned owners", owners))
    } catch (error) {
        return next(CreateError(500, "Error getting owners."));
    }
}

export const getOwnerById = async (req, res, next)=>{
    try {
        const owner = await Owner.findById({_id: req.params.id});
        if(owner) 
            return next(CreateSuccess(200, "Returned owner by id", owner));
        return next(CreateError(404, "Owner not found."));
    } catch (error) {
        return next(CreateError(500, "Error getting owner by id."));
    }
}

export const deleteOwner = async (req, res, next) => {
    try {
        const deletedOwner = await Owner.findByIdAndDelete(req.params.id);
        if (deletedOwner) {
            return next(CreateSuccess(200, "Owner deleted successfully."));
        } else {
            return next(CreateError(404, "Owner not found."));
        }
    } catch (error) {
        return next(CreateError(500, "Error deleting owner."));
    }
};


