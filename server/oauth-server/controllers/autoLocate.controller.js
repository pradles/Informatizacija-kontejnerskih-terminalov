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

function findBestLocation(storageData, size, accessibility, ownerId, dateScheduledForExport, currentPosition, fillRate) {
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

                // Calculate scores for each factor
                const ownerClusterScore = calculateOwnerClusterScore(storageData, location, ownerId);
                const exportDateScore = calculateExportDateScore(storageData, location, dateScheduledForExport);
                const reshufflingPenalty = calculateReshufflingPenalty(storageData, location, size);
                const energyEfficiencyScore = calculateEnergyEfficiencyScore(storageData, location, fillRate);
                const accessibilityScore = calculateAccessibilityClusteringScore(storageData, location, accessibility);

                // Calculate the overall score with weights for each factor
                const totalScore = (ownerClusterScore * 0.3) + (exportDateScore * 0.3) + (energyEfficiencyScore * 0.2) - (reshufflingPenalty * 0.2) + (accessibilityScore * 0.2);

                // Check if this is the best location so far
                if (currentScore == null || currentScore < totalScore) {
                    currentScore = totalScore;
                    bestLocation = location;
                }
            }
        }
    }

    return bestLocation;
}

function calculateReshufflingPenalty(storageData, location, size) {
    const { x, y, z } = location;
    let penalty = 0;

    // Penalize if there are containers stacked above the current location (reshuffling needed)
    for (let dz = z + 1; dz < storageData[x][y].length; dz++) {
        if (storageData[x][y][dz].occupation) {
            penalty += 5; // Add reshuffling penalty for each container above
        }
    }

    return penalty;
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

    // Give higher score if nearby containers have similar export dates
    for (let dz = 0; dz <= z; dz++) {
        const cellBelow = storageData[x][y][dz];
        if (cellBelow && cellBelow.occupation && cellBelow.occupation.dateScheduledForExport) {
            const exportDateBelow = new Date(cellBelow.occupation.dateScheduledForExport);
            if (dateScheduledForExport && Math.abs(exportDateBelow - new Date(dateScheduledForExport)) < 7 * 24 * 60 * 60 * 1000) {
                // Boost score if export date is within 7 days
                score += 10;
            }
        }
    }

    return score;
}

function calculateEnergyEfficiencyScore(storageData, location, fillRate) {
    const { x, y, z } = location;
    let score = 0;

    // Energy efficiency improves if the container is closer to the top and easy to access
    score += (storageData[x][y].length - z); // Higher score for containers closer to the top

    // If the yard fill rate is high, prefer locations that require fewer moves
    if (fillRate > 0.75) {
        score += 5; // Boost score in highly filled yard
    }

    return score;
}

function calculateAccessibilityClusteringScore(storageData, location, accessibility) {
    const { x, y, z } = location;
    let score = 0;

    // Check surrounding cells for similar accessibility
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            const nx = x + dx;
            const ny = y + dy;
            if (storageData[nx] && storageData[nx][ny] && storageData[nx][ny][z] && storageData[nx][ny][z].accessibility == accessibility) {
                score += 1; // Boost score for nearby containers with similar accessibility
            }
        }
    }

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
  