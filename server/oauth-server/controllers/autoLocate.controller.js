import Terminal from '../models/Terminal.js';
import { CreateSuccess } from '../utils/success.js';
import { CreateError } from '../utils/error.js';

export const autoLocate = async (req, res, next) => {
    try {
        const terminalId = req.body.terminalId;

        // Ensure the terminal exists
        const terminal = await Terminal.findById(terminalId).populate({
            path: 'array3D.occupation',
            model: 'Storage',
            populate: {
                path: 'containerId',
                populate: {
                    path: 'ownerId'
                }
            }
        });

        if (!terminal) {
            return next(CreateError(404, "Terminal not found"));
        }

        const bestLocation = findBestLocation(terminal.array3D, req.body.containers[0].size, req.body.containers[0].storageType, req.body.containers[0].owner, req.body.containers[0].dateScheduledForExport, req.body.containers[0].currentPosition);

        

        return next(CreateSuccess(200, "Successfully found position", {terminal: terminal, location: bestLocation} ));
    } catch (error) {
        console.error(error);
        return next(CreateError(500, "Error locating position."));
    }
};

function findBestLocation(storageData, size, accessibility, ownerId, dateScheduledForExport, currentPosition) {
    let bestLocation = null;
    let currentScore = null;
    for (let x = 0; x < storageData.length; x++) {
        for (let y = 0; y < storageData[x].length; y++) {
            for (let z = 0; z < storageData[x][y].length; z++) {
                const location = { x, y, z };
                const cell = storageData[x][y][z];

                // Check if the location is valid
                if (!checkLocation(storageData, location, size, accessibility, currentPosition)) {
                    continue;
                }

                // Check owner clustering
                const ownerClusterScore = calculateOwnerClusterScore(storageData, location, ownerId);
                
                // Check export date conflicts
                const exportDateScore = calculateExportDateScore(storageData, location, dateScheduledForExport);
                
                // Determine if this is a better location
                if (currentScore == null || currentScore < (ownerClusterScore + exportDateScore)) {
                    currentScore = ownerClusterScore + exportDateScore;
                    bestLocation = location;
                }
            }
        }
    }
    // console.log(bestLocation)
    return bestLocation;
}

function calculateOwnerClusterScore(storageData, location, owner) {
    const { x, y, z } = location;
    let score = 0;
    
    // Check surrounding cells for the same owner
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            for (let dz = -1; dz <= 1; dz++) {
                if (dx === 0 && dy === 0 && dz === 0) continue;

                const nx = x + dx;
                const ny = y + dy;
                const nz = z + dz;

                if (storageData[nx] && storageData[nx][ny] && storageData[nx][ny][nz]) {
                    const neighborCell = storageData[nx][ny][nz];
                    if (neighborCell.occupation && neighborCell.occupation?.containerId[0].ownerId[0].name == owner) {
                        score++;
                    }
                }
            }
        }
    }
    // if(score != 0)
    //     console.log("("+x+", "+y+", "+z+") : "+score)
    return score;
}

function calculateExportDateScore(storageData, location, dateScheduledForExport) {
    const { x, y, z } = location;
    let score = 0;

    // Check the export dates of the cells below the current cell
    for (let dz = 0; dz < z; dz++) {
        const cellBelow = storageData[x][y][dz];
        if (cellBelow && cellBelow.occupation && cellBelow.occupation.dateScheduledForExport) {
            const exportDateBelow = new Date(cellBelow.occupation.dateScheduledForExport);
            if (dateScheduledForExport && exportDateBelow < new Date(dateScheduledForExport)) {
                // console.log("("+x+", "+y+", "+z+") : true")
                score -= 10;
            }
        }
    }
    // console.log("("+x+", "+y+", "+z+") : false")
    return score;
}

function checkLocation(storageData, location, size, accessibility, currentLocation) {
    const { x, y, z } = location;
  
    // Ensure the target location exists
    if (!storageData[x] || !storageData[x][y] || !storageData[x][y][z]) {
      return false;
    }
    const targetCell = storageData[x][y][z];
  
    // Check if the target location is unoccupied and has the correct accessibility
    if (targetCell.occupation != null || targetCell.accessibility != accessibility) {
      return false;
    }

    // Check if the target location is on the ground level or if the location below is suitable
    if (z != 0 && (!storageData[x][y][z - 1] || storageData[x][y][z - 1].size < size)) {
      return false;
    }

    // Additional checks for 12m containers (size == 2)
    if (size == 2) {
      const nextCell = storageData[x][Number(y) + 1] && storageData[x][Number(y) + 1][z];

      if (!nextCell || nextCell.occupation != null || nextCell.accessibility != accessibility) {
        return false;
      }

      // Check if the target location is on the ground level or on the first space of another 12m container
      if (z != 0 && storageData[x][y][z-1].occupation != storageData[x][Number(y) + 1][z-1].occupation) {
        return false;
      }

    }

    // Check if we put it on top of itself
    if (currentLocation.x === location.x && currentLocation.y === location.y) {
        return false;
    }
  
    return true;
  }
  