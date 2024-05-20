import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageTerminalComponent } from './page-terminal.component';

describe('PageTerminalComponent', () => {
  let component: PageTerminalComponent;
  let fixture: ComponentFixture<PageTerminalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageTerminalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PageTerminalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
