import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StorageThreeDComponent } from './storage-three-d.component';

describe('StorageThreeDComponent', () => {
  let component: StorageThreeDComponent;
  let fixture: ComponentFixture<StorageThreeDComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StorageThreeDComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StorageThreeDComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
