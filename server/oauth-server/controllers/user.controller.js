import User from '../models/User.js';
import Role from '../models/Role.js';
import Terminal from '../models/Terminal.js';
import { CreateSuccess } from '../utils/success.js';
import { CreateError } from '../utils/error.js';

export const getAllUsers = async (req, res, next)=>{
    try {
        const users = await User.find();
        return next(CreateSuccess(200, "Returned users", users))
    } catch (error) {
        return next(CreateError(500, "Error getting users."));
    }
}

export const getUserById = async (req, res, next)=>{
    try {
        const user = await User.findById({_id: req.params.id});
        if(user) 
            return next(CreateSuccess(200, "Returned user by id", user));
        return next(CreateError(404, "User not found."));
    } catch (error) {
        return next(CreateError(500, "Error getting user by id."));
    }
}

export const getUserTerminals = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('roles');
        if (!user) {
            return next(CreateError(404, "User not found."));
        }

        let allTerminals = [];

        for (const roleId of user.roles) {
            const role = await Role.findById(roleId).select('terminals');
            if (!role) {
                continue;
            }

            for (const terminalId of role.terminals) {
                const terminal = await Terminal.findById(terminalId).select('name');
                if (terminal) {
                    allTerminals.push({ id: terminalId, name: terminal.name });
                }
            }
        }

        if (allTerminals.length !== 0) {
            return next(CreateSuccess(200, "Returned user terminals by id", removeDuplicatesById(allTerminals)));
        } else {
            return next(CreateError(404, "User terminals with roles not found."));
        }
    } catch (error) {
        return next(CreateError(500, "Error getting user terminals by id."));
    }
};

function removeDuplicatesById(arr) {
    // Temporary object to store unique ids
    const uniqueIds = {};
  
    // Filter out duplicates
    const result = arr.filter(obj => {
      if (!uniqueIds[obj.id]) {
        // If id is not encountered before, mark it as encountered
        uniqueIds[obj.id] = true;
        return true; // Include the object in result
      }
      return false; // Exclude the object from result
    });
  
    return result;
  }

export const updateUser = async (req, res, next) => {
    try {
        const userId = req.body._id;
        const updateData = req.body;
        const user = await User.findById(userId);
        if (!user) {
            return next(CreateError(404, "User not found."));
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true }
        );

        return next(CreateSuccess(200, "User updated successfully", updatedUser));
    } catch (error) {
        return next(CreateError(500, "Error updating user."));
    }
}

export const getUsersByTerminalId = async (req, res, next) => {
    try {
        const terminalId = req.params.terminalId; // Extract terminal ID from request params

        // Find all roles that include the specified terminal ID
        const roles = await Role.find({ terminals: terminalId }).select('_id');
        if (roles.length === 0) {
            return next(CreateError(404, "No roles found for this terminal."));
        }

        const roleIds = roles.map(role => role._id); // Extract role IDs from the roles

        // Find all users who have any of the found roles
        const users = await User.find({ roles: { $in: roleIds } });

        if (users.length > 0) {
            return next(CreateSuccess(200, `Users found for terminal ${terminalId}`, users));
        } else {
            return next(CreateError(404, "No users found with roles for this terminal."));
        }
    } catch (error) {
        console.error("Error fetching users for terminal:", error);
        return next(CreateError(500, "Error fetching users for terminal."));
    }
};