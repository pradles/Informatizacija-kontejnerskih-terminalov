import Role from '../models/Role.js';
import Terminal from '../models/Terminal.js';
import { CreateError } from '../utils/error.js';
import { CreateSuccess } from '../utils/success.js';


export const createRole = async (req, res, next) => {
    try {
        if (!req.body.role || req.body.role === '') {
            return next(CreateError(400, "Role name is required."));
        }

        let terminals;
        if (req.body.access === 2) { // Check if access is admin
            terminals = await Terminal.find(); // Set all terminals
        } else {
            const terminalIds = req.body.terminals || []; // Array of terminal IDs from req.body
            if (terminalIds.length === 0) {
                return next(CreateError(400, "At least one terminal is required."));
            }
            terminals = await Terminal.find({ _id: { $in: terminalIds } }); // Find terminals based on IDs
        }

        const newRole = new Role({
            role: req.body.role,
            terminals: terminals.map(terminal => terminal._id), // Assuming terminals field in Role model is an array of terminal IDs
            access: req.body.access
        });

        await newRole.save();
        return next(CreateSuccess(200, "Role created."));
    } catch (error) {
        console.error("Error creating role:", error);
        return next(CreateError(500, "Error creating role."));
    }
};

export const updateRole = async (req, res, next) => {
    try {
        const newData = await Role.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );

        if (newData) {
            return next(CreateSuccess(200, "Role updated."));
        } else {
            return next(CreateError(404, "Role not found."));
        }
    } catch (error) {
        return next(CreateError(500, "Error updating role."));
    }
};

export const getAllRoles = async (req, res, next)=>{
    try {
        const roles = await Role.find({});
        return next(CreateSuccess(200, "Returned roles.", roles));
    } catch (error) {
        return next(CreateError(500, "Error getting all roles."));
    }
}

export const deleteRole = async (req, res, next)=>{
    try {
        const roleId = req.params.id;
        const role = await Role.findById({_id: roleId});
        if(role){
            await Role.findByIdAndDelete(roleId);
            return next(CreateSuccess(200, "Role deleted."));
        } else {
            return next(CreateError(404, "Role not found."));
        }
    } catch (error) {
        return next(CreateError(500, "Error deleting role."));
    }
}