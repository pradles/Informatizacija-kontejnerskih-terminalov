import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageStorageComponent } from './page-storage.component';

describe('PageStorageComponent', () => {
  let component: PageStorageComponent;
  let fixture: ComponentFixture<PageStorageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageStorageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PageStorageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
