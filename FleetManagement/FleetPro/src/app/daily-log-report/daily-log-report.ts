import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  inject,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';

import { ApiService } from '../core/services/api.service';
import { CommanService } from '../core/services/comman.service';
import { ImageStorageService, StoredImageRecord } from '../core/services/image-storage.service';
import { UserRole } from '../core/models';
import { DateTimePickerService } from '../core/services/datetime-picker.service';

export interface Vehicle {
  vehicleId: any;
  registrationNumber: string;
}

export interface ImageAttachment {
  id?: string;
  dailyTrackingId?: string | null;
  fileName: string;
  filePath: string;
  fileType: string;
  imageType: string;
  isDelete: boolean;
  createdAt: string;
  createdBy: number;
  updatedAt: string;
  updatedBy: number;
  tenantId: string;
}

export interface ImagePreviewItem {
  id: string;
  name: string;
  type: string;
  size: number;
  createdAt: string;
  file: File;
  previewUrl: string;
}

export type SectionKey = 'location' | 'diesel' | 'expenses' | 'additional' | 'images' | 'review';

export interface FormCategory {
  key: SectionKey;
  title: string;
  subTitle: string;
  emoji: string;
  matIcon: string;
  colorClass: string;
}

@Component({
  selector: 'app-form-log-report',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule
  ],
  templateUrl: './daily-log-report.html',
  styleUrl: './daily-log-report.css'
})
export class DailyLogReport implements OnInit, OnDestroy {

  private readonly api = inject(ApiService);
  private readonly apiService = inject(CommanService);
  private readonly imageStorageService = inject(ImageStorageService);
  private readonly alert = inject(ToastrService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly dateTimePickerService = inject(DateTimePickerService);

  @ViewChild('imageInput')
  imageInput!: ElementRef<HTMLInputElement>;

  protected readonly unsubscribe$ = new Subject<void>();

  private tenandId = localStorage.getItem('fleetPro_TenantId');

  localStorageData = JSON.parse(
    localStorage.getItem('fleetpro_user') || '{}'
  );

  role = this.localStorageData.role;
  userId = this.localStorageData.userId;
  asignRole: any;

  // =====================================================
  // VEHICLES
  // =====================================================

  vehicleList: Vehicle[] = [];

  // =====================================================
  // IMAGES & PREVIEW STATE (IndexedDB backed)
  // =====================================================

  selectedImagePreviews: ImagePreviewItem[] = [];
  previewModalImage: ImagePreviewItem | null = null;

  // =====================================================
  // UI SECTIONS & NAVIGATION (Rectangle Cards)
  // =====================================================

  activeSection: SectionKey = 'location';
  viewMode: 'single' | 'all' = 'single';

  categories: FormCategory[] = [
    {
      key: 'location',
      title: 'Location Route',
      subTitle: 'From & To Route',
      emoji: '📍',
      matIcon: 'near_me',
      colorClass: 'cat-location'
    },
    {
      key: 'diesel',
      title: 'Diesel & Mileage',
      subTitle: 'Fuel, KM & Mileage',
      emoji: '⛽',
      matIcon: 'local_gas_station',
      colorClass: 'cat-diesel'
    },
    {
      key: 'expenses',
      title: 'Other Expenses',
      subTitle: 'Toll, Workshop, Tyre (₹)',
      emoji: '🛠️',
      matIcon: 'build_circle',
      colorClass: 'cat-expenses'
    },
    {
      key: 'additional',
      title: 'Additional Details',
      subTitle: 'Salary, Challan & Notes',
      emoji: '📋',
      matIcon: 'receipt_long',
      colorClass: 'cat-additional'
    },
    {
      key: 'images',
      title: 'Trip Images',
      subTitle: 'Upload Bills & Receipts',
      emoji: '📷',
      matIcon: 'photo_camera',
      colorClass: 'cat-images'
    },
    {
      key: 'review',
      title: 'Review & Submit',
      subTitle: 'Verify Details Before Submit',
      emoji: '📝',
      matIcon: 'fact_check',
      colorClass: 'cat-review'
    }
  ];

  // =====================================================
  // FORM
  // =====================================================

  form = this.fb.group({
    vehicleId: [null as any, Validators.required],
    date: [new Date().toISOString().substring(0, 10), Validators.required],
    fromLocation: [null, Validators.required],
    toLocation: [null, Validators.required],
    fuelStation: [''],
    dieselLitres: [0],
    dieselCost: [0],
    fromKm: [0, Validators.required],
    toKm: [0, Validators.required],
    kmBeforeFueling: [0],
    openingDieselLevel: [0],
    closingDieselLevel: [0],
    tollCharges: [0],
    workshopExpenses: [0],
    tyreMaintenance: [0],
    driverSalary: [0],
    rtoCharges: [0],
    tripRevenue: [0],
    notes: ['']
  });

  // =====================================================
  // LIFECYCLE
  // =====================================================

  async ngOnInit(): Promise<void> {
    this.loadVehicles();
    await this.loadPendingImagesFromStorage();
  }

  ngOnDestroy(): void {
    this.revokeAllPreviewUrls();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  // =====================================================
  // LOAD VEHICLES
  // =====================================================

  loadVehicles(): void {

    this.asignRole =
      UserRole[this.role as keyof typeof UserRole];

    this.apiService
      .list(
        `VehicleAssignment/${this.tenandId}/getUserBasedVehicleDropDown/${this.asignRole}/${this.userId}`
      )
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe({

        next: (response: any) => {

          if (response?.data?.length > 0) {
            this.vehicleList = response.data;
          } else {
            this.vehicleList = [];
          }

          this.cdr.detectChanges();
        },

        error: (error: any) => {

          console.error(
            'Failed to load active vehicles:',
            error
          );

          this.alert.error(
            'Failed to load active vehicles list'
          );

          this.vehicleList = [];
        }
      });
  }

  // =====================================================
  // RESTORE PENDING IMAGES FROM INDEXEDDB (On Reload)
  // =====================================================

  async loadPendingImagesFromStorage(): Promise<void> {
    try {
      const storedImages = await this.imageStorageService.getAllImages();

      this.revokeAllPreviewUrls();

      this.selectedImagePreviews = storedImages.map((record) => {
        const fileObj = record.file instanceof File
          ? record.file
          : new File([record.file], record.name, {
              type: record.type || 'image/jpeg',
              lastModified: record.createdAt ? new Date(record.createdAt).getTime() : Date.now()
            });

        return {
          id: record.id,
          name: record.name,
          type: record.type,
          size: record.size,
          createdAt: record.createdAt,
          file: fileObj,
          previewUrl: URL.createObjectURL(record.file)
        };
      });

      this.cdr.detectChanges();
    } catch (err) {
      console.error('Failed to load pending images from IndexedDB:', err);
    }
  }

  // =====================================================
  // VALIDATION
  // =====================================================

  isInvalid(controlName: string): boolean {

    const control =
      this.form.get(controlName);

    return !!(
      control &&
      control.invalid &&
      (control.touched || control.dirty)
    );
  }

  // =====================================================
  // IMAGE SELECTION & INDEXEDDB STORAGE
  // =====================================================

  async onImagesSelected(event: Event): Promise<void> {

    const input =
      event.target as HTMLInputElement;

    if (
      !input.files ||
      input.files.length === 0
    ) {
      return;
    }

    const files =
      Array.from(input.files);

    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp'
    ];

    const allowedExtensions = [
      '.jpg',
      '.jpeg',
      '.png',
      '.webp'
    ];

    const isValidFile = (file: File): boolean => {
      const extension = file.name.includes('.')
        ? file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
        : '';
      return allowedMimeTypes.includes(file.type.toLowerCase()) || allowedExtensions.includes(extension);
    };

    const invalidFiles = files.filter(file => !isValidFile(file));

    // Invalid file type alert
    if (invalidFiles.length > 0) {
      this.alert.error(
        'Only JPG, JPEG, PNG and WEBP images are allowed.'
      );
      input.value = '';
      return;
    }

    // Duplicate detection against currently selected/stored images
    const newRecordsToStore: StoredImageRecord[] = [];
    const newPreviewItems: ImagePreviewItem[] = [];
    let duplicateCount = 0;

    for (const file of files) {
      const isDuplicate = this.selectedImagePreviews.some(
        (existing) => existing.name === file.name && existing.size === file.size
      );

      if (isDuplicate) {
        duplicateCount++;
        continue;
      }

      const id = this.generateUniqueId();
      const createdAt = new Date().toISOString();

      const record: StoredImageRecord = {
        id,
        name: file.name,
        type: file.type || 'image/jpeg',
        size: file.size,
        createdAt,
        file
      };

      const previewItem: ImagePreviewItem = {
        id,
        name: file.name,
        type: file.type || 'image/jpeg',
        size: file.size,
        createdAt,
        file,
        previewUrl: URL.createObjectURL(file)
      };

      newRecordsToStore.push(record);
      newPreviewItems.push(previewItem);
    }

    if (duplicateCount > 0) {
      this.alert.warning(`${duplicateCount} duplicate image(s) skipped.`);
    }

    if (newRecordsToStore.length > 0) {
      try {
        await this.imageStorageService.saveImages(newRecordsToStore);
        this.selectedImagePreviews = [
          ...this.selectedImagePreviews,
          ...newPreviewItems
        ];
      } catch (err) {
        console.error('Failed to store images in IndexedDB:', err);
        this.alert.error('Failed to save selected images to local storage.');
      }
    }

    /*
     * Clear the actual input so the user can
     * re-select files even after removing them.
     */
    input.value = '';
    this.cdr.detectChanges();
  }

  // =====================================================
  // REMOVE IMAGE
  // =====================================================

  async removeImage(id: string): Promise<void> {

    const index = this.selectedImagePreviews.findIndex(
      (item) => item.id === id
    );

    if (index === -1) {
      return;
    }

    const itemToRemove = this.selectedImagePreviews[index];

    // Revoke preview object URL
    if (itemToRemove.previewUrl) {
      URL.revokeObjectURL(itemToRemove.previewUrl);
    }

    // Close preview modal if the active previewed image is removed
    if (this.previewModalImage?.id === id) {
      this.closePreviewModal();
    }

    // Remove from UI list
    this.selectedImagePreviews.splice(index, 1);
    this.selectedImagePreviews = [
      ...this.selectedImagePreviews
    ];

    // Remove from IndexedDB
    try {
      await this.imageStorageService.deleteImage(id);
    } catch (err) {
      console.error('Failed to delete image from IndexedDB:', err);
    }

    /*
     * Clear the actual file input when
     * there are no selected images.
     */
    if (
      this.selectedImagePreviews.length === 0 &&
      this.imageInput
    ) {
      this.imageInput.nativeElement.value = '';
    }

    this.cdr.detectChanges();
  }

  // =====================================================
  // IMAGE PREVIEW MODAL
  // =====================================================

  openPreviewModal(image: ImagePreviewItem): void {
    this.previewModalImage = image;
  }

  closePreviewModal(): void {
    this.previewModalImage = null;
  }

  // =====================================================
  // FORMAT FILE SIZE
  // =====================================================

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    if (!bytes) return '';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const size = parseFloat((bytes / Math.pow(k, i)).toFixed(i === 0 ? 0 : 1));
    return `${size} ${sizes[i]}`;
  }

  // =====================================================
  // NAVIGATION & VIEW MODE
  // =====================================================

  setActiveSection(key: SectionKey): void {
    this.activeSection = key;
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'single' ? 'all' : 'single';
  }

  goToNextSection(): void {
    const list: SectionKey[] = ['location', 'diesel', 'expenses', 'additional', 'images', 'review'];
    const idx = list.indexOf(this.activeSection);
    if (idx < list.length - 1) {
      this.activeSection = list[idx + 1];
    }
  }

  goToPreviousSection(): void {
    const list: SectionKey[] = ['location', 'diesel', 'expenses', 'additional', 'images', 'review'];
    const idx = list.indexOf(this.activeSection);
    if (idx > 0) {
      this.activeSection = list[idx - 1];
    }
  }

  // =====================================================
  // AUTOMATIC CALCULATIONS & METRICS
  // =====================================================

  // Total Distance Travelled = Closing KM − Starting KM
  get totalDistanceTravelled(): number {
    const from = Number(this.form.get('fromKm')?.value) || 0;
    const to = Number(this.form.get('toKm')?.value) || 0;
    return to > from ? to - from : 0;
  }

  // Total Diesel Consumed = Opening Diesel Level + Total Diesel Filled − Closing Diesel Level
  get totalDieselConsumed(): number {
    const filled = Number(this.form.get('dieselLitres')?.value) || 0;
    const opening = Number(this.form.get('openingDieselLevel')?.value) || 0;
    const closing = Number(this.form.get('closingDieselLevel')?.value) || 0;

    if (opening > 0 || closing > 0) {
      const consumed = opening + filled - closing;
      return consumed > 0 ? consumed : 0;
    }
    return filled > 0 ? filled : 0;
  }

  // Mileage (KM/Litre) = Total Distance Travelled ÷ Total Diesel Consumed
  get calculatedMileage(): number {
    const distance = this.totalDistanceTravelled;
    const consumed = this.totalDieselConsumed;
    if (distance > 0 && consumed > 0) {
      return Number((distance / consumed).toFixed(2));
    }
    return 0;
  }

  // Operational Expenses = Toll + Workshop + Tyre
  get totalOtherExpenses(): number {
    const toll = Number(this.form.get('tollCharges')?.value) || 0;
    const workshop = Number(this.form.get('workshopExpenses')?.value) || 0;
    const tyre = Number(this.form.get('tyreMaintenance')?.value) || 0;
    return toll + workshop + tyre;
  }

  // Additional Expenses = Driver Salary + RTO Charges
  get totalAdditionalExpenses(): number {
    const salary = Number(this.form.get('driverSalary')?.value) || 0;
    const rto = Number(this.form.get('rtoCharges')?.value) || 0;
    return salary + rto;
  }

  // Fuel Cost
  get totalFuelCost(): number {
    return Number(this.form.get('dieselCost')?.value) || 0;
  }

  // Total Trip Cost / Spend
  get totalTripCost(): number {
    return this.totalFuelCost + this.totalOtherExpenses + this.totalAdditionalExpenses;
  }

  // Total Trip Revenue (Returns)
  get totalTripRevenue(): number {
    return Number(this.form.get('tripRevenue')?.value) || 0;
  }

  // Net Profit / Loss = Trip Revenue − Total Trip Cost
  get netProfit(): number {
    return this.totalTripRevenue - this.totalTripCost;
  }

  // Check if all primary required information is filled
  get isAllRequiredFilled(): boolean {
    const v = this.form.getRawValue();
    return !!(
      v.vehicleId &&
      v.date &&
      v.fromLocation &&
      v.toLocation &&
      Number(v.fromKm) > 0 &&
      Number(v.toKm) > 0
    );
  }

  // =====================================================
  // DYNAMIC CARD STATUS & LABELS
  // =====================================================

  getSelectedVehicleReg(): string {
    const id = this.form.get('vehicleId')?.value;
    const found = this.vehicleList.find(v => v.vehicleId === id);
    return found ? found.registrationNumber : 'Select Vehicle';
  }

  getLocationSummary(): string {
    const from = this.form.get('fromLocation')?.value;
    const to = this.form.get('toLocation')?.value;
    if (from && to) return `${from} → ${to}`;
    if (from) return `From: ${from}`;
    if (to) return `To: ${to}`;
    return 'From & To Route';
  }

  getDieselSummary(): string {
    if (this.calculatedMileage > 0) {
      return `${this.calculatedMileage} KM/L (${this.totalDistanceTravelled} KM)`;
    }
    const litres = Number(this.form.get('dieselLitres')?.value) || 0;
    if (litres > 0) return `${litres} L Filled`;
    return 'Fuel, KM & Mileage';
  }

  getExpensesSummary(): string {
    if (this.totalOtherExpenses > 0) {
      return `₹ ${this.totalOtherExpenses.toLocaleString('en-IN')}`;
    }
    return 'Toll, Workshop, Tyre';
  }

  getAdditionalSummary(): string {
    if (this.totalTripRevenue > 0) {
      return `Rev: ₹ ${this.totalTripRevenue.toLocaleString('en-IN')}`;
    }
    if (this.totalAdditionalExpenses > 0) {
      return `Spend: ₹ ${this.totalAdditionalExpenses.toLocaleString('en-IN')}`;
    }
    return 'Salary, Challan & Notes';
  }

  getImagesSummary(): string {
    const count = this.selectedImagePreviews.length;
    return count > 0 ? `${count} File${count > 1 ? 's' : ''} Attached` : 'Upload Bills & Receipts';
  }

  getCategoryStatusText(key: SectionKey): string {
    switch (key) {
      case 'location': return this.getLocationSummary();
      case 'diesel': return this.getDieselSummary();
      case 'expenses': return this.getExpensesSummary();
      case 'additional': return this.getAdditionalSummary();
      case 'images': return this.getImagesSummary();
      case 'review': return this.isAllRequiredFilled ? 'Ready to Submit' : 'Fill Required Details';
      default: return '';
    }
  }

  isSectionComplete(key: SectionKey): boolean {
    switch (key) {
      case 'location':
        return !!this.form.get('fromLocation')?.value && !!this.form.get('toLocation')?.value;
      case 'diesel':
        return (Number(this.form.get('fromKm')?.value) > 0 && Number(this.form.get('toKm')?.value) > 0) ||
               Number(this.form.get('dieselLitres')?.value) > 0;
      case 'expenses':
        return this.totalOtherExpenses > 0;
      case 'additional':
        return this.totalAdditionalExpenses > 0 || this.totalTripRevenue > 0 || !!this.form.get('notes')?.value;
      case 'images':
        return this.selectedImagePreviews.length > 0;
      case 'review':
        return this.isAllRequiredFilled;
      default:
        return false;
    }
  }

  // =====================================================
  // RESET FORM
  // =====================================================

  async onReset(): Promise<void> {
    this.form.reset({
      date:
        new Date()
          .toISOString()
          .substring(0, 10),
      vehicleId: null,
      fromLocation: null,
      toLocation: null,
      dieselLitres: 0,
      dieselCost: 0,
      fromKm: 0,
      toKm: 0,
      kmBeforeFueling: 0,
      openingDieselLevel: 0,
      closingDieselLevel: 0,
      tollCharges: 0,
      workshopExpenses: 0,
      tyreMaintenance: 0,
      driverSalary: 0,
      rtoCharges: 0,
      tripRevenue: 0,
      fuelStation: '',
      notes: ''
    });

    // Close preview modal if open
    this.closePreviewModal();

    // Revoke object URLs to prevent memory leaks
    this.revokeAllPreviewUrls();

    // Clear UI preview list
    this.selectedImagePreviews = [];

    // Clear all images from IndexedDB
    try {
      await this.imageStorageService.clearAllImages();
    } catch (err) {
      console.error('Failed to clear images from IndexedDB on reset:', err);
    }

    // Clear actual file input
    if (this.imageInput) {
      this.imageInput.nativeElement.value = '';
    }

    this.activeSection = 'location';
    this.cdr.detectChanges();
  }

  // =====================================================
  // SAVE / SUBMIT
  // =====================================================

  async save(forceSubmit: boolean = false): Promise<void> {

    // Validate form
    if (this.form.invalid) {

      this.form.markAllAsTouched();

      // Automatically switch to first invalid section if in single view mode
      if (this.viewMode === 'single') {
        if (this.form.get('fromLocation')?.invalid || this.form.get('toLocation')?.invalid) {
          this.activeSection = 'location';
        } else if (this.form.get('fromKm')?.invalid || this.form.get('toKm')?.invalid) {
          this.activeSection = 'diesel';
        }
      }

      this.alert.warning(
        'Please fill in all required fields properly.'
      );

      return;
    }

    // If all information is filled and user is not yet reviewing it, show the review summary first
    if (!forceSubmit && this.activeSection !== 'review' && this.viewMode === 'single') {
      this.activeSection = 'review';
      this.alert.info(
        'All information ready. Please review the details below before submitting.'
      );
      return;
    }

    const value =
      this.form.getRawValue();

    const currentUserId =
      Number(
        this.localStorageData.userId
      ) || 0;

    const currentTenantId =
      this.tenandId || '';

    const nowIso =
      new Date().toISOString();

    // ===================================================
    // RETRIEVE REAL FILES FROM INDEXEDDB / IN-MEMORY LIST
    // ===================================================

    let storedRecords: StoredImageRecord[] = [];
    try {
      storedRecords = await this.imageStorageService.getAllImages();
    } catch (err) {
      console.error('Error fetching stored images from IndexedDB before submit:', err);
    }

    // Convert Blobs/Files back into File objects if needed
    const actualFiles: File[] = storedRecords.length > 0
      ? storedRecords.map((record) => {
          if (record.file instanceof File) {
            return record.file;
          }
          return new File([record.file], record.name, {
            type: record.type || 'image/jpeg',
            lastModified: record.createdAt ? new Date(record.createdAt).getTime() : Date.now()
          });
        })
      : this.selectedImagePreviews.map((preview) => preview.file);

    // ===================================================
    // FORMDATA
    // ===================================================

    const formData =
      new FormData();

    // ===================================================
    // DAILY TRACKING DATA
    // ===================================================

    // Only ONE vehicle ID is submitted
    formData.append('VehicleId',value.vehicleId?.toString() ?? '');
    formData.append('TripDate',this.dateTimePickerService.toApiDateTime(value.date ?? '') ?? '');
    formData.append('FromLocation',(value.fromLocation ?? '').toUpperCase());
    formData.append('ToLocation',(value.toLocation ?? '').toUpperCase());
    formData.append('FuelStation',(value.fuelStation ?? '').toUpperCase());
    formData.append('DieselLitres',value.dieselLitres?.toString() ?? '0');
    formData.append('DieselCost',value.dieselCost?.toString() ?? '0');
    formData.append('FromKm',value.fromKm?.toString() ?? '0');
    formData.append('ToKm',value.toKm?.toString() ?? '0');
    formData.append('KmBeforeFueling',value.kmBeforeFueling?.toString() ?? '0');
    formData.append('OpeningDieselLevel',value.openingDieselLevel?.toString() ?? '0');
    formData.append('ClosingDieselLevel',value.closingDieselLevel?.toString() ?? '0');
    formData.append('TotalDistanceTravelled',this.totalDistanceTravelled.toString());
    formData.append('TotalDieselConsumed',this.totalDieselConsumed.toString());
    formData.append('Mileage',this.calculatedMileage.toString());
    formData.append('TollCharges',value.tollCharges?.toString() ?? '0');
    formData.append('WorkshopExpenses',value.workshopExpenses?.toString() ?? '0');
    formData.append('TyreMaintenance',value.tyreMaintenance?.toString() ?? '0');
    formData.append('DriverSalary',value.driverSalary?.toString() ?? '0');
    formData.append('RtoCharges',value.rtoCharges?.toString() ?? '0');
    formData.append('TripRevenue',value.tripRevenue?.toString() ?? '0');
    formData.append('Notes',value.notes ?? '');
    formData.append('TenantId',currentTenantId);
    formData.append('StatusType', '1');
    formData.append('CreatedBy',currentUserId.toString());
    formData.append('CreatedDate',this.dateTimePickerService.toApiDateTime(new Date().toISOString()) ?? '');
    formData.append('UpdatedBy',currentUserId.toString());

    // ===================================================
    // IMAGE ATTACHMENTS
    // ===================================================

    const imageAttachments:
      ImageAttachment[] = actualFiles.map((image) => {
          const extension = image.name.includes('.') ? image.name.substring(image.name.lastIndexOf('.')) : '';
          return {
            dailyTrackingId: null,
            fileName: image.name,
            filePath: '',
            fileType: image.type || extension ||'image/jpeg',
            imageType:'DailyLog',
            isDelete: false,
            createdAt: nowIso,
            createdBy: currentUserId,
            updatedAt: nowIso,
            updatedBy: currentUserId,
            tenantId: currentTenantId
          };
        }
      );

    // ===================================================
    // APPEND IMAGE FILES
    // ===================================================

    actualFiles.forEach((image) => {
      formData.append('Images',image,image.name);
      formData.append('files',image,image.name);
      }
    );

    // ===================================================
    // JSON IMAGE ATTACHMENTS
    // ===================================================

    formData.append('ImageAttachmentsJson',JSON.stringify(imageAttachments));
    formData.append('imageAttachments',JSON.stringify(imageAttachments));

    // ===================================================
    // INDEXED MODEL BINDER PROPERTIES
    // ===================================================

    imageAttachments.forEach((att, i) => {
        // PascalCase
        formData.append(`ImageAttachments[${i}].FileName`,att.fileName);
        formData.append(`ImageAttachments[${i}].FilePath`,att.filePath);
        formData.append(`ImageAttachments[${i}].FileType`,att.fileType);
        formData.append(`ImageAttachments[${i}].ImageType`,att.imageType);
        formData.append(`ImageAttachments[${i}].IsDelete`,att.isDelete.toString());
        formData.append(`ImageAttachments[${i}].CreatedAt`,att.createdAt);
        formData.append(`ImageAttachments[${i}].CreatedBy`,att.createdBy.toString());
        formData.append(`ImageAttachments[${i}].UpdatedAt`,att.updatedAt);
        formData.append(`ImageAttachments[${i}].UpdatedBy`,att.updatedBy.toString());
        formData.append(`ImageAttachments[${i}].TenantId`,att.tenantId);
        // camelCase
        formData.append(`imageAttachments[${i}].fileName`,att.fileName);
        formData.append(`imageAttachments[${i}].filePath`,att.filePath);
        formData.append(`imageAttachments[${i}].fileType`,att.fileType);
        formData.append(`imageAttachments[${i}].imageType`,att.imageType);
        formData.append(`imageAttachments[${i}].isDelete`,att.isDelete.toString());
        formData.append(`imageAttachments[${i}].createdAt`,att.createdAt);
        formData.append(`imageAttachments[${i}].createdBy`,att.createdBy.toString());
        formData.append(`imageAttachments[${i}].updatedAt`,att.updatedAt);
        formData.append(`imageAttachments[${i}].updatedBy`,att.updatedBy.toString());
        formData.append(`imageAttachments[${i}].tenantId`,att.tenantId);
      }
    );

    this.apiService.create(`DailyTracking/${this.tenandId}/SaveDailyTracking`, formData).pipe(takeUntil(this.unsubscribe$)).subscribe({
       next: (response: any) => {
        if(response.success == true){
          this.alert.success('Daily tracking saved successfully.');
          this.onReset();
        }
        else{
            this.alert.error('Failed to Save Daily tracking. Please try again.');
        }
       },
        error: (error: any) => {
          this.alert.error('Failed to Save Daily tracking. Please try again.');
          this.onReset();
        }
    });
  }

  // =====================================================
  // HELPER METHODS
  // =====================================================

  private revokeAllPreviewUrls(): void {
    this.selectedImagePreviews.forEach((item) => {
      if (item.previewUrl) {
        URL.revokeObjectURL(item.previewUrl);
      }
    });
  }

  private generateUniqueId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return 'img_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
  }
}