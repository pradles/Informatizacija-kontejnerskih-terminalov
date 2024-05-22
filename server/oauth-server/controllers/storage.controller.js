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

        await storage.save();

        return next(CreateSuccess(200, "Container added to terminal storage successfully."))
    } catch (error) {
        return next(CreateError(500, "Error adding container to terminal storage."))
    }
}

export const getAllStorageRecords = async (req, res, next)=>{
    try {
        const storageRecords = await Storage.find().populate('containerId').populate('terminalId');
        return next(CreateSuccess(200, "Returned all storage records", storageRecords));
    } catch (error) {
        return next(CreateError(500, "Error fetching storage records."));
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
      const storageRecords = await Storage.find({ terminalId }).populate('containerId').populate('terminalId');
      return next(CreateSuccess(200, "Returned terminal storage records", storageRecords));
    } catch (error) {
      return next(CreateError(500, "Error fetching terminal storage records."));
    }
  };
