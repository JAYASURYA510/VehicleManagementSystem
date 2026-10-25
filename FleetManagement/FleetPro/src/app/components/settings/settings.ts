
import {
  Component,
  OnDestroy,
  HostListener,
  inject,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { CommanService } from '../../core/services/comman.service';
import { DateTimePickerService } from '../../core/services/datetime-picker.service';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css'
})
export class SettingsComponent implements OnDestroy {
  private readonly apiService = inject(CommanService);
  private readonly alert = inject(ToastrService);
  private readonly cdr = inject(ChangeDetectorRef);
  protected readonly unsubscribe$ = new Subject<void>();
  private readonly dateTimePickerService = inject(DateTimePickerService);

  // Tenant and user retrieval matching daily-log-report pattern
  private tenantId = localStorage.getItem('fleetPro_TenantId');

  localStorageData = JSON.parse(
    localStorage.getItem('fleetpro_user') || '{}'
  );

  role = this.localStorageData?.role;
  userId = this.localStorageData?.userId ?? this.localStorageData?.id;

  // Base server URL for constructing saved image paths
  private readonly serverBaseUrl = environment.apiUrl.replace('/api', '');

  // File and preview states
  selectedFile: File | null = null;
  rawFile: File | null = null;
  previewUrl: string | null = null;
  rawPreviewUrl: string | null = null;
  private loadedImg: HTMLImageElement | null = null;

  // Tracks whether the current previewUrl is a server-saved image (not a local blob)
  savedImageUrl: string | null = null;

  saveButton : boolean = false;
  updateButton : boolean = false;

  // Modal and interaction states
  showAdjustModal = false;
  isDragOver = false;
  hasCustomAdjustment = false;
  isSaving = false;

  // Adjustment parameters (rounded square)
  readonly VIEWPORT_SIZE = 280;
  zoom = 1.0;
  minZoom = 0.5;
  maxZoom = 3.0;
  panX = 0;
  panY = 0;
  rotation = 0;
  flipH = false;
  flipV = false;

  // Base dimensions computed when image loads
  baseWidth = 280;
  baseHeight = 280;
  imageNaturalWidth = 0;
  imageNaturalHeight = 0;

  // Drag interaction state
  isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private initialPanX = 0;
  private initialPanY = 0;

  get zoomPercentage(): number {
    return Math.round(this.zoom * 100);
  }

  get adjusterImageTransform(): string {
    const scaleX = (this.flipH ? -1 : 1) * this.zoom;
    const scaleY = (this.flipV ? -1 : 1) * this.zoom;
    return `translate(${this.panX}px, ${this.panY}px) rotate(${this.rotation}deg) scale(${scaleX}, ${scaleY})`;
  }

  ngOnInit(): void {
    this.getSavedData();
  }
  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.processFile(file);
    input.value = '';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDropFile(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.processFile(file);
    }
  }

  processFile(file: File): void {
    if (!file.type.startsWith('image/')) {
      this.alert.error('Please select a valid image file (PNG, JPG, WebP, SVG).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.alert.error('Image size must be less than 5 MB.');
      return;
    }

    this.rawFile = file;

    if (this.rawPreviewUrl) {
      URL.revokeObjectURL(this.rawPreviewUrl);
    }
    this.rawPreviewUrl = URL.createObjectURL(file);

    const img = new Image();
    img.onload = () => {
      this.loadedImg = img;
      this.imageNaturalWidth = img.naturalWidth || this.VIEWPORT_SIZE;
      this.imageNaturalHeight = img.naturalHeight || this.VIEWPORT_SIZE;

      // Fit or cover viewport
      const scale = Math.max(
        this.VIEWPORT_SIZE / this.imageNaturalWidth,
        this.VIEWPORT_SIZE / this.imageNaturalHeight
      );
      this.baseWidth = Math.round(this.imageNaturalWidth * scale);
      this.baseHeight = Math.round(this.imageNaturalHeight * scale);

      this.resetAdjustments();
      this.openAdjustModal();
      this.cdr.detectChanges();
    };
    img.src = this.rawPreviewUrl;
  }

  openAdjustModal(): void {
    // Case 1: a newly selected local file is already loaded
    if (this.rawPreviewUrl) {
      this.showAdjustModal = true;
      this.cdr.detectChanges();
      return;
    }

    // Case 2: only a server-saved image is present — load it into the adjuster
    if (this.savedImageUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        this.loadedImg = img;
        this.imageNaturalWidth = img.naturalWidth || this.VIEWPORT_SIZE;
        this.imageNaturalHeight = img.naturalHeight || this.VIEWPORT_SIZE;
        const scale = Math.max(
          this.VIEWPORT_SIZE / this.imageNaturalWidth,
          this.VIEWPORT_SIZE / this.imageNaturalHeight
        );
        this.baseWidth = Math.round(this.imageNaturalWidth * scale);
        this.baseHeight = Math.round(this.imageNaturalHeight * scale);
        // Borrow savedImageUrl as rawPreviewUrl so the canvas can render it
        this.rawPreviewUrl = this.savedImageUrl;
        this.resetAdjustments();
        this.showAdjustModal = true;
        this.cdr.detectChanges();
      };
      img.onerror = () => {
        this.alert.error('Could not load the saved logo for adjustment.');
      };
      img.src = this.savedImageUrl;
    }
  }

  closeAdjustModal(): void {
    this.showAdjustModal = false;
    // If closed without applying and no current preview exists, use raw as default
    if (!this.previewUrl && this.rawPreviewUrl && this.rawFile) {
      this.previewUrl = this.rawPreviewUrl;
      this.selectedFile = this.rawFile;
    }
    // If rawPreviewUrl was borrowed from savedImageUrl, release it
    if (this.rawPreviewUrl === this.savedImageUrl) {
      this.rawPreviewUrl = null;
    }
    this.cdr.detectChanges();
  }

  startDrag(event: MouseEvent | TouchEvent): void {
    event.preventDefault();
    this.isDragging = true;
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    this.dragStartX = clientX;
    this.dragStartY = clientY;
    this.initialPanX = this.panX;
    this.initialPanY = this.panY;
  }

  @HostListener('window:mousemove', ['$event'])
  @HostListener('window:touchmove', ['$event'])
  onDrag(event: MouseEvent | TouchEvent): void {
    if (!this.isDragging) return;
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    const dx = clientX - this.dragStartX;
    const dy = clientY - this.dragStartY;
    this.panX = Math.round(this.initialPanX + dx);
    this.panY = Math.round(this.initialPanY + dy);
  }

  @HostListener('window:mouseup')
  @HostListener('window:touchend')
  stopDrag(): void {
    this.isDragging = false;
  }

  onWheel(event: WheelEvent): void {
    event.preventDefault();
    const delta = event.deltaY < 0 ? 0.08 : -0.08;
    this.setZoom(this.zoom + delta);
  }

  setZoom(value: number): void {
    const clamped = Math.min(this.maxZoom, Math.max(this.minZoom, value));
    this.zoom = parseFloat(clamped.toFixed(2));
  }

  zoomIn(): void {
    this.setZoom(this.zoom + 0.1);
  }

  zoomOut(): void {
    this.setZoom(this.zoom - 0.1);
  }

  rotateBy(degrees: number): void {
    let newRot = (this.rotation + degrees) % 360;
    if (newRot > 180) newRot -= 360;
    if (newRot < -180) newRot += 360;
    this.rotation = newRot;
  }

  setRotation(value: number): void {
    this.rotation = value;
  }

  toggleFlipH(): void {
    this.flipH = !this.flipH;
  }

  toggleFlipV(): void {
    this.flipV = !this.flipV;
  }

  centerImage(): void {
    this.panX = 0;
    this.panY = 0;
  }

  resetAdjustments(): void {
    this.zoom = 1.0;
    this.panX = 0;
    this.panY = 0;
    this.rotation = 0;
    this.flipH = false;
    this.flipV = false;
  }

  applyAdjustments(event?: Event): void {
    if (event) {
      
      event.preventDefault();
      event.stopPropagation();

    }

    if (!this.rawPreviewUrl || !this.loadedImg) {
      this.closeAdjustModal();
      return;
    }

    const canvas = document.createElement('canvas');
    const EXPORT_SIZE = 512;
    canvas.width = EXPORT_SIZE;
    canvas.height = EXPORT_SIZE;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      this.closeAdjustModal();
      return;
    }

    ctx.clearRect(0, 0, EXPORT_SIZE, EXPORT_SIZE);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.save();
    ctx.translate(EXPORT_SIZE / 2, EXPORT_SIZE / 2);

    const scaleFactor = EXPORT_SIZE / this.VIEWPORT_SIZE;
    ctx.translate(this.panX * scaleFactor, this.panY * scaleFactor);
    ctx.rotate((this.rotation * Math.PI) / 180);

    const scaleX = (this.flipH ? -1 : 1) * this.zoom;
    const scaleY = (this.flipV ? -1 : 1) * this.zoom;
    ctx.scale(scaleX, scaleY);

    const drawW = this.baseWidth * scaleFactor;
    const drawH = this.baseHeight * scaleFactor;
    ctx.drawImage(this.loadedImg, -drawW / 2, -drawH / 2, drawW, drawH);

    ctx.restore();

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const fileName = this.rawFile?.name || 'company-logo.png';
          this.selectedFile = new File([blob], fileName, {
            type: 'image/png',
            lastModified: Date.now()
          });

          if (this.previewUrl && this.previewUrl !== this.rawPreviewUrl && this.previewUrl !== this.savedImageUrl) {
            URL.revokeObjectURL(this.previewUrl);
          }
          this.previewUrl = URL.createObjectURL(blob);
          this.hasCustomAdjustment = true;
        }

        // Single click immediate modal close and change detection update
        this.showAdjustModal = false;
        this.cdr.detectChanges();
        this.alert.success('Logo adjusted successfully!');
      },
      'image/png',
      0.95
    );
  }

  removeLogo(): void {
    this.clearPreviews();
    this.selectedFile = null;
    this.rawFile = null;
    this.loadedImg = null;
    this.hasCustomAdjustment = false;
    this.savedImageUrl = null;
    this.alert.info('Logo removed.');
    this.cdr.detectChanges();
  }

  private clearPreviews(): void {
    // Only revoke blob URLs — server image URLs must not be revoked
    if (this.previewUrl && this.previewUrl !== this.savedImageUrl) {
      URL.revokeObjectURL(this.previewUrl);
    }
    this.previewUrl = null;
    if (this.rawPreviewUrl) {
      URL.revokeObjectURL(this.rawPreviewUrl);
      this.rawPreviewUrl = null;
    }
  }

  settingsList : any;
  getSavedData(){
    this.apiService.list(`Settings/${this.tenantId}/getSettings`).pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: (response: any) => {
        if(response.data){
          this.updateButton = true;
          this.saveButton = false;
          this.settingsList = response.data;
          console.log('Settings GET Response:', response);

          // Patch the saved logo into the preview
          if (response.data?.filePath) {
            const imageUrl = `${this.serverBaseUrl}/${response.data.filePath}`;
            this.savedImageUrl = imageUrl;
            this.previewUrl = imageUrl;
            this.cdr.detectChanges();
          }
        } else {
          // No saved settings — show Save button
          this.saveButton = true;
          this.updateButton = false;
        }
      }
    });
  }

  updateSettings(): void {
    if (!this.selectedFile) {
      this.alert.warning('Please select a new logo image to update.');
      return;
    }
     const formData = new FormData();
     formData.append('Id', this.settingsList?.id ?? this.settingsList?.Id ?? '');
     formData.append('File', this.selectedFile, this.selectedFile.name);
     formData.append('UpdatedBy', this.localStorageData?.userId);
     formData.append('UpdatedAt', this.dateTimePickerService.toApiDateTime(new Date().toISOString()) ?? '');
     this.isSaving = true;
     this.apiService.create(`Settings/${this.tenantId}/updateSettings`, formData).pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: (response: any) => {
        this.isSaving = false;
        console.log('Update Settings Response:', response);
        if (response?.success === false) {
          this.alert.error(response?.message || 'Failed to update company logo.');
        } else {
          this.alert.success(response?.message || 'Company logo updated successfully!');
          // Refresh saved data to sync preview with server state
          this.getSavedData();
        }
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        this.isSaving = false;
        console.error('Update Settings Error:', error);
        this.alert.error(error.error?.message || 'Failed to update company logo. Please try again.');
        this.cdr.detectChanges();
      }
     });
  }

  saveSettings(): void {
    if (!this.selectedFile) {
      this.alert.warning('Please select a company logo file before saving.');
      return;
    }

    const activeTenantId = this.tenantId || this.localStorageData?.tenantId;
    if (!activeTenantId) {
      this.alert.error('Tenant ID is missing. Please log in again.');
      return;
    }

    this.isSaving = true;

    // Create multipart/form-data
    const formData = new FormData();

    // Required key: File
    formData.append('File', this.selectedFile, this.selectedFile.name);

    // Optional key: CreatedBy (append only if available)
 
      formData.append('CreatedBy', this.localStorageData?.userId);
    formData.append('CreatedAt',this.dateTimePickerService.toApiDateTime(new Date().toISOString()) ?? '');
    
    console.log('FormData contents:', formData);



    this.apiService.create(`Settings/${activeTenantId}/saveSettings`, formData)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (response: any) => {
          this.isSaving = false;
          console.log('Save Settings POST Response:', response);

          if (response?.success === false) {
            this.alert.error(response?.message || 'Failed to upload company logo.');
            this.cdr.detectChanges();
            return;
          }

          this.alert.success(response?.message || 'Company logo uploaded successfully!');
          this.cdr.detectChanges();
        },
        error: (error: any) => {
          this.isSaving = false;
          console.error('Save Settings POST Error:', error);

          if (error.status === 400) {
            const validationMsg =
              error.error?.message ||
              error.error?.title ||
              (typeof error.error === 'string' ? error.error : 'Validation failed. Please verify the selected file.');
            this.alert.error(validationMsg);
          } else if (error.status === 401) {
            this.alert.error('Session expired or unauthorized. Please log in again.');
          } else if (error.status === 403) {
            this.alert.error('Access denied. You do not have permission to update settings.');
          } else {
            const msg = error.error?.message || 'Failed to upload company logo. Please try again.';
            this.alert.error(msg);
          }
          this.cdr.detectChanges();
        }
      });
  }

  resetSettings(): void {
    this.removeLogo();
    this.alert.info('Logo cleared.');
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.clearPreviews();
  }
}

export { SettingsComponent as Settings };


