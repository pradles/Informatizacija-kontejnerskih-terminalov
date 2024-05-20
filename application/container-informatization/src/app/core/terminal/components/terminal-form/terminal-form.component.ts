import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';

import { TerminalService } from '../../../../shared/services/api/terminal.service';
import { PageTerminalComponent } from '../../pages/page-terminal/page-terminal.component';
import { TerminalArrayComponent } from '../terminal-array/terminal-array.component';

@Component({
  selector: 'app-terminal-form',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, RouterModule, TerminalArrayComponent ],
  templateUrl: './terminal-form.component.html',
  styleUrl: './terminal-form.component.css'
})
export class TerminalFormComponent implements OnInit{
  fb = inject(FormBuilder);
  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);

  terminalService = inject(TerminalService);
  pageTerminal = inject(PageTerminalComponent);
  @ViewChild(TerminalArrayComponent) terminalArray!: TerminalArrayComponent;

  terminalFormSubmitted: boolean = false;
  terminalForm!: FormGroup;
  terminalId: string | null = null;
  isEditMode: boolean = false;



  ngOnInit(): void {
    this.terminalForm = this.fb.group({
      name: ['', Validators.required],
      location: ['', Validators.required],
    })

    this.activatedRoute.paramMap.subscribe(params => {
      this.terminalId = params.get('terminalId');
      if (this.terminalId) {
        this.isEditMode = true;
        this.loadTerminalData(this.terminalId);
      }
    });
  }

  loadTerminalData(id: string): void {
    this.terminalService.getTerminalById(id)
      .subscribe({
        next:(res)=>{
          console.log(res);
          this.terminalForm.patchValue(res.data);
          this.terminalArray.setArray(res.data.array3D);
        },
        error:(err)=>{
          console.log(err);
        }
      });
  }

  onSubmit(): void {
    this.terminalFormSubmitted = true;
    let terminalObj = {
      name: this.terminalForm.value.name,
      location: this.terminalForm.value.location,
      _id: this.terminalId,
      array3D: this.terminalArray.getArray()
    }

    if (this.terminalForm.valid) {
      if (this.isEditMode) {
        this.terminalService.updateTerminal(terminalObj).subscribe({
          next:(res)=>{
            console.log(res)
            // this.router.navigate(['/terminals']); // Redirect after update
          },
          error:(err)=>{
            console.log(err)
            this.pageTerminal.openErrorModal(err.error.message);
          }
        });
      } else {
        this.terminalService.createTerminal(terminalObj).subscribe({
          next:(res)=>{
            console.log(res)
            // this.router.navigate(['/terminals']); // Redirect after update
          },
          error:(err)=>{
            console.log(err)
            this.pageTerminal.openErrorModal(err.error.message);
          }
        });
      }
    } else {
      this.pageTerminal.openErrorModal("Form filled out incorrectly.");
    }
  }


}
