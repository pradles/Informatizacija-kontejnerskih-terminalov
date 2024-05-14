import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';



@Component({
  selector: 'app-test',
  standalone: true,
  imports: [ FormsModule, CommonModule ],
  templateUrl: './test.component.html',
  styleUrl: './test.component.css'
})
export class TestComponent {

  formData = {
    xAxis: '',
    yAxis: '',
    zAxis: ''
  };

  rows: number[] = [];
  cols: number[] = [];

  // Define a 3D array to hold the data
  array3D!: any[][][];

  onSubmit(form: any): void {
    console.log('Form submitted:', this.formData);

    // Parse xAxis, yAxis, and zAxis to integers
    const xAxis = parseInt(this.formData.xAxis);
    const yAxis = parseInt(this.formData.yAxis);
    const zAxis = parseInt(this.formData.zAxis);

    // Create the 3D array
    this.array3D = Array.from({ length: xAxis }, () =>
      Array.from({ length: yAxis }, () =>
        Array.from({ length: zAxis }, () => [0, 2, 0])
      )
    );

    console.log('Generated 3D array:', this.array3D);
  }

  changeColor(x: number, y: number, z: number){
    this.array3D[x][y][z][2] += 1;
  }

  clickStart: boolean = false;

  clickStarted() {
    this.clickStart = true;
  }
  clickEnded() {
    this.clickStart = false;
  }

  changeColorWithCheck(x: number, y: number, z: number){
    if(this.clickStart)
      this.changeColor(x,y,z)
  }
  

}
