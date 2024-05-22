import Container from '../models/Container.js';
import { CreateSuccess } from '../utils/success.js';
import { CreateError } from '../utils/error.js';

export const addContainer = async (req, res, next)=>{
    try {
        const newContainer = new Container({
            containerNumber: req.body.containerNumber,
            size: req.body.size,
            contents: req.body.contents,
            storageType: req.body.storageType,
            weight: req.body.weight
        });
        await newContainer.save();
        return next(CreateSuccess(200, "Container added successfully."))
    } catch (error) {
        return next(CreateError(500, "Error adding container."))
    }
}

export const updateContainer = async (req, res, next) => {
    try {
        const updatedContainer = await Container.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        if (updatedContainer) {
            return next(CreateSuccess(200, "Container updated successfully."));
        } else {
            return next(CreateError(404, "Container not found."));
        }
    } catch (error) {
        return next(CreateError(500, "Error updating container."));
    }
};

export const getAllContainers = async (req, res, next)=>{
    try {
        const users = await Container.find();
        return next(CreateSuccess(200, "Returned containers", users))
    } catch (error) {
        return next(CreateError(500, "Error getting containers."));
    }
}

export const getContainerById = async (req, res, next)=>{
    try {
        const user = await Container.findById({_id: req.params.id});
        if(user) 
            return next(CreateSuccess(200, "Returned container by id", user));
        return next(CreateError(404, "Container not found."));
    } catch (error) {
        return next(CreateError(500, "Error getting container by id."));
    }
}



