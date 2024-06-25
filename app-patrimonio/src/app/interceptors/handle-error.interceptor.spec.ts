import { TestBed } from '@angular/core/testing';

import { HandleErrorInterceptor } from './handle-error.interceptor';
import { ToastrModule } from 'ngx-toastr';

describe('HandleErrorInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      ToastrModule.forRoot({})
    ],
    providers: [
      HandleErrorInterceptor
    ]
  }));

  it('should be created', () => {
    const interceptor: HandleErrorInterceptor = TestBed.inject(HandleErrorInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
