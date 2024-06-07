import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';

import { StorageService } from '../../../../shared/services/api/storage.service';
import { ContainerService } from '../../../../shared/services/api/container.service';
import { TerminalService } from '../../../../shared/services/api/terminal.service';
import { DashboardService } from '../../../dashboard/services/dashboard.service';
import { ValidatorsServiceService } from '../../../authentication/services/validators.service.service';
import { StorageFormService } from '../../services/storage-form.service';

import { PageStorageComponent } from '../../pages/page-storage/page-storage.component';
import { StorageThreeDComponent } from '../storage-three-d/storage-three-d.component';

@Component({
  selector: 'app-storage-form',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, RouterModule, StorageThreeDComponent ],
  templateUrl: './storage-form.component.html',
  styleUrl: './storage-form.component.css'
})
export class StorageFormComponent implements OnInit {
  fb = inject(FormBuilder);
  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);

  @ViewChild(StorageThreeDComponent) storageThreeD!: StorageThreeDComponent;
  validatorService = inject(ValidatorsServiceService);
  containerService = inject(ContainerService);
  terminalService = inject(TerminalService);
  storageService = inject(StorageService);
  dashboardService = inject(DashboardService);
  pageStorage = inject(PageStorageComponent);
  storageFormService = inject(StorageFormService);

  storageData: any;
  singleStorageData: any;

  storageDataToUpdate: { container: any, containerId: string, storage: any, storageId: string }[] = [];

  formSubmitted: boolean = false;
  storageForm!: FormGroup;
  containerForm!: FormGroup;
  storageId: string | null = null;
  isEditMode: boolean = false;
  toggleInput: boolean = false;

  currentPosition!: { x: number | null, y: number | null, z: number | null };

  ngOnInit(): void {
    console.log("Initializing StorageFormComponent");

    // Initialize the storage form with default values and validators
    this.storageForm = this.fb.group({
      dateImported: [new Date().toISOString().slice(0, 16), Validators.required],
      dateExported: [''],
      currentlyStoredAtX: [''],
      currentlyStoredAtY: [''],
      currentlyStoredAtZ: [''],
      dateScheduledForExport: [''],
    });

    // Initialize the container form with default values and validators
    this.containerForm = this.fb.group({
      containerNumber: ['', Validators.required],
      size: [null, [Validators.required, this.validatorService.allowedSizesValidator([0, 1, 2])]],
      contents: ['', Validators.required],
      storageType: [null, [Validators.required, this.validatorService.allowedStorageTypesValidator([1, 2])]],
      weight: ['', Validators.required],
    });

    // Subscribe to position updates from the storage form service
    this.storageFormService.position$.subscribe(val => this.currentPosition = val);

    // Subscribe to route parameter changes to detect if we are in edit mode
    this.activatedRoute.paramMap.subscribe(params => {
      this.storageId = params.get('storageId');
      if (this.storageId) {
        this.isEditMode = true;
        this.loadEditModeData();
      } else {
        // Reset the current position if not in edit mode
        this.storageFormService.setPosition({ x: null, y: null, z: null });
      }
    });
  }

  // Load data when in edit mode
  loadEditModeData(): void {
    this.dashboardService.getSelectedTerminal().subscribe({
      next: (selectedTerminal) => {
        if (selectedTerminal && selectedTerminal.id) {
          this.storageService.getTerminalStorageRecords(selectedTerminal.id).subscribe({
            next: (res) => {
              console.log(res);
              this.storageData = res.data;
              if (this.storageId) {
                this.loadStorageData(this.storageId);
              }
            },
            error: (err) => {
              console.log(err);
              this.pageStorage.openErrorModal(err.error.message);
            }
          });
        }
      },
      error: (err) => {
        console.log(err);
        this.pageStorage.openErrorModal(err.error.message);
      }
    });
  }

  // Load storage data by ID
  loadStorageData(id: string): void {
    this.storageForm.reset();
    this.containerForm.reset();
    this.storageData.forEach((storage: any) => {
      if (storage._id == id) {
        const formattedData = {
          ...storage,
          currentlyStoredAtX: storage.currentlyStoredAt?.x,
          currentlyStoredAtY: storage.currentlyStoredAt?.y,
          currentlyStoredAtZ: storage.currentlyStoredAt?.z,
          dateImported: this.formatDate(storage.dateImported),
          dateExported: this.formatDate(storage.dateExported),
          dateScheduledForExport: this.formatDate(storage.dateScheduledForExport)
        }
        this.storageForm.patchValue(formattedData);
        this.containerForm.patchValue(storage.containerId[0]);
        this.singleStorageData = storage;
        this.updatePosition(storage.currentlyStoredAt ? storage.currentlyStoredAt : { x: null, y: null, z: null });
      }
    });
  }

  // Format date to ISO string format
  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2); // Adding leading zero
    const day = ('0' + date.getDate()).slice(-2); // Adding leading zero
    const hours = ('0' + date.getHours()).slice(-2); // Adding leading zero
    const minutes = ('0' + date.getMinutes()).slice(-2); // Adding leading zero

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  // Toggle the input form
  toggleInputForm() {
    this.toggleInput = !this.toggleInput
  }

  // Handle form submission
  onSubmit(): void {
    this.formSubmitted = true;

    if (this.containerForm.valid && this.storageForm.valid) {
      if (this.isEditMode) {
        // Process all updates in edit mode
        this.saveStorageData();
        this.updateMode();
      } else {
        // Create new records in create mode
        this.createMode();
      }
    }
  }

  // Update all data in edit mode
  updateMode() {
    this.storageDataToUpdate.forEach(data => {
      this.containerService.updateContainer(data.container, data.containerId).subscribe({
        next: (res) => {
          console.log(res);
          this.storageService.updateStorageRecord(data.storage, data.storageId).subscribe({
            next: (res) => {
              console.log(res);
              const terminalObj = {
                _id: this.dashboardService.getSelectedTerminalMenu().id,
                array3D: this.storageThreeD.getTerminal3dArrayData()
              };
              this.terminalService.updateTerminal(terminalObj).subscribe({
                next: (res) => {
                  console.log(res);
                },
                error: (err) => {
                  console.log(err);
                }
              });
            },
            error: (err) => {
              console.log(err);
              this.pageStorage.openErrorModal(err.error.message);
            }
          });
        },
        error: (err) => {
          console.log(err);
          this.pageStorage.openErrorModal(err.error.message);
        }
      });
    });
  }

  // Create new records in create mode
  createMode() {
    const containerObj = {
      containerNumber: this.containerForm.value.containerNumber,
      size: this.containerForm.value.size,
      contents: this.containerForm.value.contents,
      storageType: this.containerForm.value.storageType,
      weight: this.containerForm.value.weight
    };

    this.containerService.addContainer(containerObj).subscribe({
      next: (res) => {
        console.log(res);
        const match = res.message.match(/ID:([a-zA-Z0-9]+)/);
        if (match) {
          const storageObj = {
            containerId: match[1],
            terminalId: this.dashboardService.getSelectedTerminalMenu().id,
            dateImported: this.storageForm.value.dateImported,
            currentlyStoredAt: { x: this.storageForm.value.currentlyStoredAtX, y: this.storageForm.value.currentlyStoredAtY, z: this.storageForm.value.currentlyStoredAtZ },
            dateScheduledForExport: this.storageForm.value.dateScheduledForExport
          };
          this.storageService.createStorageRecord(storageObj).subscribe({
            next: (res) => {
              console.log(res);
              const match = res.message.match(/ID:([a-zA-Z0-9]+)/);
              this.storageThreeD.setOccupation({ x: this.storageForm.value.currentlyStoredAtX, y: this.storageForm.value.currentlyStoredAtY, z: this.storageForm.value.currentlyStoredAtZ }, match[1]);
              const terminalObj = {
                _id: this.dashboardService.getSelectedTerminalMenu().id,
                array3D: this.storageThreeD.getTerminal3dArrayData()
              };
              this.terminalService.updateTerminal(terminalObj).subscribe({
                next: (res) => {
                  console.log(res);
                },
                error: (err) => {
                  console.log(err);
                }
              });
            },
            error: (err) => {
              console.log(err);
              this.pageStorage.openErrorModal(err.error.message);
            }
          });
        }
      },
      error: (err) => {
        console.log(err);
        this.pageStorage.openErrorModal(err.error.message);
      }
    });
  }

  // Placeholder function for delete operation
  delete() {
    // Implement delete functionality if needed
  }

  // Handle changing storage data
  changeStorageData(id: string): void {
    console.log(id)
    if (this.containerForm.valid && this.storageForm.valid) {
      this.saveStorageData();
      this.loadStorageData(id);
      // this.changeUrlId(id);
    } else {
      this.pageStorage.openErrorModal("Fill in the form correctly.");
    }
  }

  // Save current storage data to the update queue
  saveStorageData() {
    const containerObj = {
      containerNumber: this.containerForm.value.containerNumber,
      size: this.containerForm.value.size,
      contents: this.containerForm.value.contents,
      storageType: this.containerForm.value.storageType,
      weight: this.containerForm.value.weight
    };
    const storageObj = {
      containerId: this.singleStorageData.containerId[0]._id,
      terminalId: this.singleStorageData.terminalId[0]._id,
      dateImported: this.storageForm.value.dateImported,
      currentlyStoredAt: { x: this.storageForm.value.currentlyStoredAtX, y: this.storageForm.value.currentlyStoredAtY, z: this.storageForm.value.currentlyStoredAtZ },
      dateScheduledForExport: this.storageForm.value.dateScheduledForExport
    };

    this.storageDataToUpdate.push({
      container: containerObj,
      containerId: this.singleStorageData.containerId[0]._id,
      storage: storageObj,
      storageId: this.singleStorageData._id
    });
  }

  // Change the URL to reflect the new storage ID without triggering a reload
  changeUrlId(newId: string) {
    this.router.navigate(['../', newId], {
      relativeTo: this.activatedRoute,
      replaceUrl: true, // This prevents adding a new entry to the history
      skipLocationChange: true // This prevents triggering ngOnInit
    });
  }

  // Update the current position and check the validity of the position
  updatePosition(newValue: { x: number, y: number, z: number }) {
    this.storageFormService.setPosition(newValue);
    this.checkPosition();
  }

  // Check if the current position is valid and update the 3D storage view accordingly
  checkPosition() {
    if (this.storageForm.value.currentlyStoredAtX != null && this.storageForm.value.currentlyStoredAtY != null && this.storageForm.value.currentlyStoredAtZ != null) {
      if (this.currentPosition.x == null || this.currentPosition.y == null || this.currentPosition.z == null) {
        this.storageThreeD.addContainer({ x: this.storageForm.value.currentlyStoredAtX, y: this.storageForm.value.currentlyStoredAtY, z: this.storageForm.value.currentlyStoredAtZ }, this.containerForm.value.size, this.containerForm.value.storageType); // Check if it's possible to place if it is set it there update currentPosition
      } else {
        this.storageThreeD.moveContainer({ x: this.storageForm.value.currentlyStoredAtX, y: this.storageForm.value.currentlyStoredAtY, z: this.storageForm.value.currentlyStoredAtZ });
      }
    }
  }
}
