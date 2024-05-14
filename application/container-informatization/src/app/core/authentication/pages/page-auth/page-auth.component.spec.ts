import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageAuthComponent } from './page-auth.component';

describe('PageAuthComponent', () => {
  let component: PageAuthComponent;
  let fixture: ComponentFixture<PageAuthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageAuthComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PageAuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
