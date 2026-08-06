import { HttpInterceptorFn } from '@angular/common/http';
import { LoadingService } from '../services/loading.service';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';

export const iLoadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loading = inject(LoadingService);
 
  loading.show();
  return next(req).pipe(

    finalize(() => {

      loading.hide();

    })

  );
};