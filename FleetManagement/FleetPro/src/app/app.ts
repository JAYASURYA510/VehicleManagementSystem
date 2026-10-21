import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd, NavigationError, NavigationCancel } from '@angular/router';
import { Loading } from './components/loading/loading';
import { LoadingService } from './core/services/loading.service';
import { filter, take } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Loading],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private readonly loadingService = inject(LoadingService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    // Show spinner animation only on initial app load / page refresh
    this.loadingService.show();

    let isDismissed = false;
    const dismiss = () => {
      if (!isDismissed) {
        isDismissed = true;
        this.loadingService.hide(true);
      }
    };

    // Listen to initial route resolution
    const navSub = this.router.events
      .pipe(
        filter(
          (event) =>
            event instanceof NavigationEnd ||
            event instanceof NavigationError ||
            event instanceof NavigationCancel
        ),
        take(1)
      )
      .subscribe(() => {
        setTimeout(dismiss, 700);
      });

    // Safety fallback timeout to ensure spinner is dismissed
    setTimeout(() => {
      navSub.unsubscribe();
      dismiss();
    }, 1200);
  }
}
