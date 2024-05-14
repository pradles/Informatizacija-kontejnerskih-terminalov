import { Component, OnChanges, SimpleChanges, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { timer } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-error-modal',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './error-modal.component.html',
  styleUrl: './error-modal.component.css'
})
export class ErrorModalComponent implements OnChanges{
    isOpen = input<boolean>();
    title = input<string>();
    text = input<string>();
    closeModalEvent = output();

    ngOnChanges(changes: SimpleChanges) {
      if(changes["isOpen"].currentValue == true)
        this.setAutoClose();
    }

    closeModal() {
      this.closeModalEvent.emit();
    }
  
    private setAutoClose() {
      timer(5000).pipe(take(1)).subscribe(() => {
        this.closeModal();
      });
    }
}


