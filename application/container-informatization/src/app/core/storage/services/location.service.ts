import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  checkLocation(storageData: any, currentLocation: any, location: any, size: number, accessibility: number) {
    // Ensure the target location exists and has the same accessibility
    if (storageData[location.x] && storageData[location.x][location.y] && storageData[location.x][location.y][location.z]) {
      console.log("exists")
      // Check if no other container is occuping space
      if (storageData[location.x][location.y][location.z].occupation == null){
        console.log("not occupied")
        // Check if the space accesibility is the same
        console.log(storageData[location.x][location.y][location.z].accessibility)
        console.log(accessibility)
        if (storageData[location.x][location.y][location.z].accessibility == accessibility) {
          console.log("accessibility is ok")
          // Check if the target location is on the ground level or if the location below is suitable -> same size
          console.log(location.z)
          if (location.z == 0 || (storageData[location.x][location.y][location.z - 1]?.size >= size ) ) {
            console.log("ground or size ok")
            // if its 12m the occupation cant have :2 at the end of the id
            if(size != 2 || storageData[location.x][location.y][location.z - 1].occupation?.slice(-2, -1) === ':'){
              console.log("12m ok")
              // Check if we put it on top of itself
              if(currentLocation.x != location.x || currentLocation.y != location.y){
                console.log("not on top")
                return true;
              }
            }
          }
        }
      }
    }

    return false;
}


}
