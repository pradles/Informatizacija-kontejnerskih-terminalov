import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageRoleComponent } from './page-role.component';

describe('PageRoleComponent', () => {
  let component: PageRoleComponent;
  let fixture: ComponentFixture<PageRoleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageRoleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PageRoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
