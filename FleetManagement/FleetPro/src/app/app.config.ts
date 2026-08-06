import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { iLoadingInterceptor } from './core/interceptors/iloading-interceptor';
import { provideLottieOptions } from 'ngx-lottie';
import player from 'lottie-web';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideAnimations(),
     provideToastr({
      timeOut: 3000,
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
      progressBar: true,
      closeButton: true
    }),
    provideHttpClient(withInterceptors([authInterceptor],)),
    provideHttpClient(withInterceptors([iLoadingInterceptor])),
    provideLottieOptions({

      player: () => player

    })
  ]
};
