import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PyasConnectComponent } from './pyas-connect.component';

describe('PyasConnectComponent', () => {
  let component: PyasConnectComponent;
  let fixture: ComponentFixture<PyasConnectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PyasConnectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PyasConnectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
