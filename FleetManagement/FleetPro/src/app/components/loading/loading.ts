
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LottieComponent } from 'ngx-lottie';
import { AnimationOptions } from 'ngx-lottie';
import { LoadingService } from '../../core/services/loading.service';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [ CommonModule,LottieComponent],
  templateUrl: './loading.html',
  styleUrl: './loading.css',
})
export class Loading {
  constructor(public loadingService: LoadingService) {}
   options: AnimationOptions = {
    path: 'animations/Car-loading.json',
  };
}
