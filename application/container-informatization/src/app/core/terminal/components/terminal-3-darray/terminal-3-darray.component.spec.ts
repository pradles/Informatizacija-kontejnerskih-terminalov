import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Terminal3DarrayComponent } from './terminal-3-darray.component';

describe('Terminal3DarrayComponent', () => {
  let component: Terminal3DarrayComponent;
  let fixture: ComponentFixture<Terminal3DarrayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Terminal3DarrayComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Terminal3DarrayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
