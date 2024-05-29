import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';

import { StorageService } from '../../../../shared/services/api/storage.service';
import { ContainerService } from '../../../../shared/services/api/container.service';
import { DashboardService } from '../../../dashboard/services/dashboard.service';
import { PageStorageComponent } from '../../pages/page-storage/page-storage.component';
import { StorageThreeDComponent } from '../storage-three-d/storage-three-d.component';

@Component({
  selector: 'app-storage-form',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, RouterModule, StorageThreeDComponent ],
  templateUrl: './storage-form.component.html',
  styleUrl: './storage-form.component.css'
})
export class StorageFormComponent implements OnInit{
  fb = inject(FormBuilder);
  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);

  containerService = inject(ContainerService);
  storageService = inject(StorageService);
  dashboardService = inject(DashboardService);
  pageStorage = inject(PageStorageComponent);

  storageData: any;

  formSubmitted: boolean = false;
  storageForm!: FormGroup;
  containerForm!: FormGroup;
  storageId: string | null = null;
  isEditMode: boolean = false;

  toggleInput: boolean = false;

  ngOnInit(): void {
    this.storageForm = this.fb.group({
      dateImported: [new Date().toISOString().slice(0,16), Validators.required],
      dateExported: [''],
      currentlyStoredAt: [''],
      dateScheduledForExport: [''],
    });

    this.containerForm = this.fb.group({
      containerNumber: ['', Validators.required],
      size: ['', Validators.required],
      contents: ['', Validators.required],
      storageType: ['', Validators.required],
      weight: ['', Validators.required],
    });
    

    this.activatedRoute.paramMap.subscribe(params => {
      this.storageId = params.get('storageId');
      if (this.storageId) {
        this.isEditMode = true;
        this.loadStorageData(this.storageId);
      }
    });
  }

  loadStorageData(id: string): void {
    this.storageService.getStorageRecordById(id)
      .subscribe({
        next:(res)=>{
          console.log(res);
          this.storageData = res.data;
          // Format the dates properly
          const formattedData = {
            ...res.data,
            dateImported: this.formatDate(res.data.dateImported),
            dateExported: this.formatDate(res.data.dateExported),
            dateScheduledForExport: this.formatDate(res.data.dateScheduledForExport)
          };

          this.storageForm.patchValue(formattedData);

          this.containerForm.patchValue(res.data.containerId[0]);
        },
        error:(err)=>{
          console.log(err);
        }
      });
  }

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

  toggleInputForm() {
    this.toggleInput = !this.toggleInput
  }

  onSubmit(): void {
    const containerObj = {
      containerNumber: this.containerForm.value.containerNumber,
      size: this.containerForm.value.size,
      contents: this.containerForm.value.contents,
      storageType: this.containerForm.value.storageType,
      weight: this.containerForm.value.weight
    }
    if(this.containerForm.valid && this.storageForm.valid) {
      if(this.isEditMode){
        this.containerService.updateContainer(containerObj,this.storageData.containerId[0]._id).subscribe({
          next:(res)=>{
            console.log(res);
            const storageObj = {
              containerId: this.storageData.containerId[0]._id,
              terminalId: this.storageData.terminalId[0]._id,
              dateImported: this.storageForm.value.dateImported,
              currentlyStoredAt: this.storageForm.value.currentlyStoredAt,
              dateScheduledForExport: this.storageForm.value.dateScheduledForExport
            }
            this.storageService.updateStorageRecord(storageObj, this.storageData._id).subscribe({
              next:(res)=>{
                console.log(res);
              },
              error:(err)=>{
                console.log(err);
              }
            })
          }, 
          error:(err)=>{
            console.log(err);
          }
        })

      } else {
        this.containerService.addContainer(containerObj).subscribe({
          next:(res)=>{
            console.log(res)
            const match = res.message.match(/ID:([a-zA-Z0-9]+)/);

            if (match) {
              const storageObj = {
                containerId: match[1],
                terminalId: this.dashboardService.getSelectedTerminalMenu().id,
                dateImported: this.storageForm.value.dateImported,
                currentlyStoredAt: this.storageForm.value.currentlyStoredAt,
                dateScheduledForExport: this.storageForm.value.dateScheduledForExport
              }
              this.storageService.createStorageRecord(storageObj).subscribe({
                next:(res)=>{
                  console.log(res)
                },
                error:(err)=>{
                  console.log(err)
                  // this.pageTerminal.openErrorModal(err.error.message);
                }
              });
            }

          },
          error:(err)=>{
            console.log(err);
          }
        });
      }
    }
  }

  delete() {
    
  }

}
