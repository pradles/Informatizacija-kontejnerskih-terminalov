import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  checkLocation(storageData: any, currentLocation: any, location: any, size: number, accessibility: number): boolean {
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
      const nextY = Number(y) + 1;
      const nextCell = storageData[x][nextY] && storageData[x][nextY][z];
  
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
  

  checkCreateLocation(storageData: any, location: any, size: number, accessibility: number): boolean {
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
  
    console.log("Location is suitable");
    return true;
  }
  

}
