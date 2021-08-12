import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToBecomeWiinserProComponent } from './to-become-wiinser-pro.component';

describe('ToBecomeWiinserProComponent', () => {
  let component: ToBecomeWiinserProComponent;
  let fixture: ComponentFixture<ToBecomeWiinserProComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ToBecomeWiinserProComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ToBecomeWiinserProComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
