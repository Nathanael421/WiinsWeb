import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedPublicationModalComponent } from './shared-publication-modal.component';

describe('SharedPublicationModalComponent', () => {
  let component: SharedPublicationModalComponent;
  let fixture: ComponentFixture<SharedPublicationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SharedPublicationModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SharedPublicationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
