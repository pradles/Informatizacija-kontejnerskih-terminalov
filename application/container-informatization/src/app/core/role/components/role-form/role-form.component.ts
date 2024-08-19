import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';

import { AuthService } from '../../../authentication/services/auth.service'; 
import { RoleServiceService } from '../../../../shared/services/api/role.service.service';
import { TerminalService } from '../../../../shared/services/api/terminal.service';
import { ValidatorsServiceService } from '../../../authentication/services/validators.service.service';
import { PageRoleComponent } from '../../pages/page-role/page-role.component';

@Component({
  selector: 'app-role-form',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, RouterModule ],
  templateUrl: './role-form.component.html',
  styleUrl: './role-form.component.css'
})
export class RoleFormComponent implements OnInit{
  fb = inject(FormBuilder);
  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);

  validatorService = inject(ValidatorsServiceService);
  authService = inject(AuthService);
  roleService = inject(RoleServiceService);
  pageRole = inject(PageRoleComponent);

  terminalService = inject(TerminalService);

  roleFormSubmitted: boolean = false;
  roleForm!: FormGroup;
  roleId: string | null = null;
  isEditMode: boolean = false;

  // for terminal dropdown menu
  terminalId: { label: string, value: string }[] = [];
  filteredTerminalId: { label: string, value: string }[] = [];
  terminalIdDropdown: boolean = false;

  // for terminal dropdown menu
  accessId: { label: string, value: number }[] = [
    {label: 'Admin', value: 2},
    {label: 'Moderator', value: 1},
    {label: 'User', value: 0}
  ];
  filteredAccessId: { label: string, value: number }[] = this.accessId;
  accessIdDropdown: boolean = false;

  ngOnInit(): void {
    this.roleForm = this.fb.group({
      role: ['', Validators.required],
      terminal: ['', Validators.required],
      access: ['', Validators.required],
    });

    this.activatedRoute.paramMap.subscribe(params => {
      this.roleId = params.get('roleId');
      if (this.roleId) {
        this.isEditMode = true;
        this.loadRoleData(this.roleId);
      }
      this.loadTerminalData();
    });
  }

  loadRoleData(id: string): void {
    this.roleService.getRoleById(id)
      .subscribe({
        next:(res)=>{
          console.log(res);
          this.roleForm.patchValue(res.data);
          this.roleForm.patchValue({terminal: res.data.terminals[0].name});
          this.roleForm.patchValue({access: this.accessId.find(item => item.value == res.data.access)?.label});
        },
        error:(err)=>{
          console.log(err);
        }
    });
  }

  loadTerminalData(): void {
    this.terminalService.getAllTerminals()
      .subscribe({
        next:(res)=>{
          console.log(res);
          res.data.forEach((terminal: any) => {
            this.terminalId.push({label: terminal.name, value: terminal._id})
          });
          this.filteredTerminalId = this.terminalId;
        },
        error:(err)=>{
          console.log(err);
        }
    });
  }

  onSubmit() {
    this.roleFormSubmitted = true;

    if (this.isEditMode) {
      if(this.roleForm.valid){
        let ownerObj = {
          role: this.roleForm.value.role,
          terminals: [this.terminalId.find(item => item.label == this.roleForm.value.terminal)?.value],
          access: this.accessId.find(item => item.label == this.roleForm.value.access)?.value
        };
        this.roleService.updateRole(ownerObj, this.roleId ? this.roleId:"")
        .subscribe({
          next:(res)=>{
            console.log(res);
          },
          error:(err)=>{
            console.log(err);
            this.pageRole.openErrorModal(err.error.message);
          }
        })
      } else {
        this.pageRole.openErrorModal("Form filled out incorrectly.");
      }
    } else {
      if(this.roleForm.valid){
          let ownerObj = {
            role: this.roleForm.value.role,
            terminals: [this.terminalId.find(item => item.label == this.roleForm.value.terminal)?.value],
            access: this.accessId.find(item => item.label == this.roleForm.value.access)?.value
          };
          this.roleService.addRole(ownerObj)
          .subscribe({
            next:(res)=>{
              console.log(res)
              this.roleForm.reset();
              this.roleFormSubmitted = false;
            },
            error:(err)=>{
              this.pageRole.openErrorModal(err.error.message);
              console.log(err);
            }
          });
      } else {
        this.pageRole.openErrorModal("Form filled out incorrectly.");
      }
    } 
  }
    
  

  delete() {

  }

  onSearchTerminal(): void {
    this.filteredTerminalId = this.terminalId.filter(item =>
      item.label.toString().includes(this.roleForm.value.terminal.toLowerCase())
    );
  }

  selectItemTerminal(item: { label: string, value: string }): void {
    // this.changeStorageData(item.value);
    this.roleForm.setValue({role: this.roleForm.value.role, terminal: item.label, access: this.roleForm.value.access})
    console.log(item);
  }

  onFocusDropdownTerminal(): void {
    this.terminalIdDropdown = true;
  }

  onBlurDropdownTerminal(): void {
    setTimeout(() => 
      {
        this.terminalIdDropdown = false;
      },
      120);
  }

  onSearchAccess(): void {
    this.filteredAccessId = this.accessId.filter(item =>
      item.label.toString().includes(this.roleForm.value.access.toLowerCase())
    );
  }

  selectItemAccess(item: { label: string, value: number }): void {
    // this.changeStorageData(item.value);
    this.roleForm.setValue({role: this.roleForm.value.role, terminal: this.roleForm.value.terminal, access: item.label})
    console.log(item);
  }

  onFocusDropdownAccess(): void {
    this.accessIdDropdown = true;
  }

  onBlurDropdownAccess(): void {
    setTimeout(() => 
      {
        this.accessIdDropdown = false;
      },
      120);
  }

}
