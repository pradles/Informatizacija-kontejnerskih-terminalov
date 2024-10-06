import { inject, Injectable } from "@angular/core";
import { ContainerService } from "../../services/api/container.service";
import { OwnerService } from "../../services/api/owner.service";
import { RoleServiceService } from "../../services/api/role.service.service";
import { StorageService } from "../../services/api/storage.service";
import { TerminalService } from "../../services/api/terminal.service";
import { UserService } from "../../services/api/user.service";
import { DashboardService } from "../../../core/dashboard/services/dashboard.service";

@Injectable({
  providedIn: 'root',
})
export class TableService {
  // Inject services
  dashboradService = inject(DashboardService);
  containerService = inject(ContainerService);
  ownerService = inject(OwnerService);
  roleService = inject(RoleServiceService);
  storageService = inject(StorageService);
  terminalService = inject(TerminalService);
  userService = inject(UserService);

  // Map of services based on dataType
  private serviceMap: { [key: string]: any } = {
    container: this.containerService,
    owner: this.ownerService,
    role: this.roleService,
    storage: this.storageService,
    terminal: this.terminalService,
    user: this.userService,
  };

  // Handle data operation based on dataType
  handleDataOperation(dataType: string, data: any) {
    for (const element of data) {
        if (element.dateExported) {
            console.log("Stopping execution due to dateExported present:", element);
            return; // Stop the function if the condition is true
        }
    }
    
    if (dataType === 'storage') {
        this.export(data);
    } else {
        this.delete(dataType, data);
    }
  }

  // Export function specific to storage
  export(data: any) {
    this.storageService.exportStorage(data, this.dashboradService.getSelectedTerminalMenu().id).subscribe(
      (response) => {
        console.log("Export successful", response);
      },
      (error) => {
        console.error("Export failed", error);
      }
    );
  }

  // Delete function for other dataTypes
  delete(dataType: string, data: any) {
    const service = this.serviceMap[dataType]; // Dynamically get the correct service
    if (service && service[`delete${this.capitalizeFirstLetter(dataType)}`]) {
      service[`delete${this.capitalizeFirstLetter(dataType)}`](data[0]._id).subscribe(
        (response: any) => {
          console.log(`Deleted ${dataType} successfully`, response);
        },
        (error: any) => {
          console.error(`Failed to delete ${dataType}`, error);
        }
      );
    } else {
      console.error(`Service or delete method for ${dataType} not found.`);
    }
  }

  // Helper function to capitalize the first letter of the dataType
  capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
