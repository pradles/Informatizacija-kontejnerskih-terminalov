import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TerminalArrayComponent } from './terminal-array.component';

describe('TerminalArrayComponent', () => {
  let component: TerminalArrayComponent;
  let fixture: ComponentFixture<TerminalArrayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TerminalArrayComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TerminalArrayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
