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