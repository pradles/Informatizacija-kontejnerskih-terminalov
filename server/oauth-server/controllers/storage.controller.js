import Container from '../models/Container.js';
import Terminal from '../models/Terminal.js';
import Storage from '../models/Storage.js';
import { CreateSuccess } from '../utils/success.js';
import { CreateError } from '../utils/error.js';


export const createStorageRecord = async (req, res, next)=>{
    try {
        const { containerId, terminalId, dateImported, dateExported, currentlyStoredAt, dateScheduledForExport } = req.body;
        console.log(containerId,
            terminalId,
            dateImported,
            dateExported, // This is optional
            currentlyStoredAt, // This is optional
            dateScheduledForExport)
        // Ensure the container and terminal exist
        const container = await Container.findById(containerId);
        const terminal = await Terminal.findById(terminalId);
        
        if (!container || !terminal) {
            return next(CreateError(404, "Container or Terminal not found"));
        }

        const storage = new Storage({
            containerId,
            terminalId,
            dateImported,
            dateExported, // This is optional
            currentlyStoredAt, // This is optional
            dateScheduledForExport, // This is optional
          });

        const savedStorage = await storage.save();

        return next(CreateSuccess(200, `Container added to terminal storage successfully. Storage ID:${savedStorage._id}`))
    } catch (error) {
        return next(CreateError(500, "Error adding container to terminal storage."))
    }
}

export const getAllStorageRecords = async (req, res, next) => {
    try {
        const storageRecords = await Storage.find()
            .populate({
                path: 'containerId',
                populate: {
                    path: 'ownerId'
                }
            })
            .populate('terminalId');

        return next(CreateSuccess(200, "Returned all storage records", storageRecords));
    } catch (error) {
        return next(CreateError(500, "Error fetching storage records."));
    }
};

export const getStorageRecordsById = async (req, res, next)=>{
    try {
        const storageRecord = await Storage.findById(req.params.id)
            .populate({
                path: 'containerId',
                populate: {
                    path: 'ownerId'
                }
            })
            .populate('terminalId');
        return next(CreateSuccess(200, "Returned storage record by id", storageRecord));
    } catch (error) {
        return next(CreateError(500, "Error fetching storage record by id."));
    }
}



export const getTerminalStorageRecords = async (req, res, next) => {
    try {
      const terminalId = req.params.id;
  
      // Ensure the terminal exists
      const terminal = await Terminal.findById(terminalId);

      if (!terminal) {
        return next(CreateError(404, "Terminal not found"));
      }
  
      // Fetch storage records for the specific terminal
      const storageRecords = await Storage.find({ terminalId })
        .populate({
            path: 'containerId',
            populate: {
                path: 'ownerId'
            }
            })
        .populate('terminalId');
      return next(CreateSuccess(200, "Returned terminal storage records", storageRecords));
    } catch (error) {
      return next(CreateError(500, "Error fetching terminal storage records."));
    }
};

export const updateStorageRecord = async (req, res, next) => {
    try {
        const { id } = req.params;
        const {
            containerId,
            terminalId,
            dateImported,
            dateExported,
            currentlyStoredAt,
            dateScheduledForExport
        } = req.body;

        // Ensure the container and terminal exist
        if (containerId) {
            const container = await Container.findById(containerId);
            if (!container) {
                return next(CreateError(404, "Container not found"));
            }
        }

        if (terminalId) {
            const terminal = await Terminal.findById(terminalId);
            if (!terminal) {
                return next(CreateError(404, "Terminal not found"));
            }
        }

        // Find the storage record by ID and update it
        const updatedStorage = await Storage.findByIdAndUpdate(
            id,
            {
                containerId,
                terminalId,
                dateImported,
                dateExported,
                currentlyStoredAt,
                dateScheduledForExport
            },
            { new: true, runValidators: true }
        ).populate('containerId').populate('terminalId');

        if (!updatedStorage) {
            return next(CreateError(404, "Storage record not found"));
        }

        return next(CreateSuccess(200, "Storage record updated successfully", updatedStorage));
    } catch (error) {
        return next(CreateError(500, "Error updating storage record"));
    }
};

export const updateStorageRecords = async (req, res, next) => {
    try {
        const storageData  = req.body; // Expecting an array of storage data

        if (!Array.isArray(storageData)) {
            return next(CreateError(400, "Invalid data format. Expecting an array of storage records."));
        }

        // const updatedRecords = [];

        for (const storage of storageData) {
            const {
                _id,
                containerId,
                terminalId,
                dateImported,
                dateExported,
                currentlyStoredAt,
                dateScheduledForExport,
            } = storage;

            console.log(containerId[0]._id)

            // Ensure the container and terminal exist
            if (containerId && containerId[0]?._id) {
                const container = await Container.findById(containerId[0]._id);
                if (!container) {
                    return next(CreateError(404, `Container not found for ID: ${containerId[0]._id}`));
                }
            }

            if (terminalId && terminalId[0]?._id) {
                const terminal = await Terminal.findById(terminalId[0]._id);
                if (!terminal) {
                    return next(CreateError(404, `Terminal not found for ID: ${terminalId[0]._id}`));
                }
            }

            // Find the storage record by ID and update it
            const updatedStorage = await Storage.findByIdAndUpdate(
                _id,
                {
                    containerId,
                    terminalId,
                    dateImported,
                    dateExported,
                    currentlyStoredAt,
                    dateScheduledForExport
                },
                { new: true, runValidators: true }
            ).populate('containerId').populate('terminalId');

            if (!updatedStorage) {
                return next(CreateError(404, `Storage record not found for ID: ${_id}`));
            }

            // Update the container record as well
            if (containerId && containerId[0]?._id) {
                await Container.findByIdAndUpdate(containerId[0]._id, containerId[0], { new: true, runValidators: true });
            }
            
            // updatedRecords.push(updatedStorage);
        }

        return next(CreateSuccess(200, "Storage records updated successfully"/*, updatedRecords*/));
    } catch (error) {
        return next(CreateError(500, "Error updating storage records"));
    }
};


export const exportStorageRecords = async (req, res, next) => {
    try {
        const { storageIds, terminalId } = req.body; // Extract storageIds from the request body
  
        // Loop through each storageId and update the storage records
        for (const storage of storageIds) {  // Use a regular for-loop instead of Promise.all
            const storageRecord = await Storage.findById(storage._id);

            if (!storageRecord) {
                throw new Error(`Storage record with ID ${storage._id} not found`);
            }

            // Extract container location from storage
            const containerLocation = storage.containerLocation.split('\n').map(x => x.trim());
            const [x, y, z] = containerLocation.map(Number); // Extract coordinates from container location
            console.log(x, y, z);

            // Wait for the container to be removed before proceeding
            await removeContainerFrom3d({ x, y, z }, terminalId);
            
            // Update the storage record in the database
            await Storage.findByIdAndUpdate(
                storage._id, // Find the storage by its _id
                {
                    dateExported: new Date(), // Set the current time as dateExported
                    currentlyStoredAt: { x: null, y: null, z: null },  // Set containerLocation to null
                },
                { new: true } // Optionally return the updated document
            );
        }
  
        // If everything goes well, send a success response
        return next(CreateSuccess(200, "Storage records updated successfully."));
    } catch (error) {
        // Handle errors and send error response
        console.error('Error exporting storage records:', error);
        return next(CreateError(500, "Error exporting storage records."));
    }
};


const removeContainerFrom3d = async (position, terminalId) => {
    const { x, y, z } = position;

    // Find the terminal by its ID
    const terminal = await Terminal.findById(terminalId);
  
    if (!terminal) {
        throw new Error(`Terminal with ID ${terminalId} not found`);
    }

    // Remove the container
    terminal.array3D[x][y][z] = { occupation: null, size: null, mesh: undefined, accessibility: terminal.array3D[x][y][z].accessibility };
    if (terminal.array3D[x][y][z].size === 2)
        terminal.array3D[x][y+1][z] = { occupation: null, size: null, mesh: undefined, accessibility: terminal.array3D[x][y+1][z].accessibility };
    console.log(terminal.array3D[x][y][z], "the postition:", x, y, z)

    // Move containers above the current one down by one
    for (let i = z + 1; i < terminal.array3D[x][y].length; i++) {
        if (terminal.array3D[x][y][i].occupation != null) {
            // Move the container down
            terminal.array3D[x][y][i - 1] = terminal.array3D[x][y][i];
            console.log("Moved container down to ", x, y, i - 1);
            
            // Check for size and move if necessary
            if (terminal.array3D[x][y][i].size === 2) {
                terminal.array3D[x][y + 1][i - 1] = terminal.array3D[x][y + 1][i];
                console.log("Moved container2 down to ", x, y + 1, i - 1);
                terminal.array3D[x][y + 1][i] = { occupation: null, size: null, mesh: undefined, accessibility: terminal.array3D[x][y + 1][i - 1].accessibility };
            }
            terminal.array3D[x][y][i] = { occupation: null, size: null, mesh: undefined, accessibility: terminal.array3D[x][y][i - 1].accessibility };
            
            // Update the corresponding storage record
            const storageId = terminal.array3D[x][y][i - 1].occupation; // Get the occupation id from the moved container
            await Storage.findByIdAndUpdate(storageId, { currentlyStoredAt: { x, y, z: i - 1 } });
            console.log(`Updated storage record with ID ${storageId} to new position: { x: ${x}, y: ${y}, z: ${i - 1} }`);
        }
    }

    // After moving the containers, save the updated array3D back to the terminal
    await Terminal.findByIdAndUpdate(terminalId, { array3D: terminal.array3D }, { new: true });
    console.log(`Updated array3D for terminal ID ${terminalId}`);
    return;
};


