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

import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';

import { ApiService } from '../core/services/api.service';
import { CommanService } from '../core/services/comman.service';
import { ImageStorageService, StoredImageRecord } from '../core/services/image-storage.service';
import { UserRole } from '../core/models';

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

@Component({
  selector: 'app-form-log-report',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
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
  // FORM
  // =====================================================

  form = this.fb.group({

    vehicleId: [
      null as any,
      Validators.required
    ],

    date: [
      new Date().toISOString().substring(0, 10),
      Validators.required
    ],

    fuelStation: [''],

    dieselLitres: [0],

    dieselCost: [0],

    fromKm: [
      0,
      Validators.required
    ],

    toKm: [
      0,
      Validators.required
    ],

    kmBeforeFueling: [0],

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
  // RESET FORM
  // =====================================================

  async onReset(): Promise<void> {

    this.form.reset({

      date:
        new Date()
          .toISOString()
          .substring(0, 10),

      vehicleId: null,

      dieselLitres: 0,

      dieselCost: 0,

      fromKm: 0,

      toKm: 0,

      kmBeforeFueling: 0,

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

    this.cdr.detectChanges();
  }

  // =====================================================
  // SAVE / SUBMIT
  // =====================================================

  async save(): Promise<void> {

    // Validate form
    if (this.form.invalid) {

      this.form.markAllAsTouched();

      this.alert.warning(
        'Please fill in all required fields properly.'
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
    formData.append(
      'VehicleId',
      value.vehicleId?.toString() ?? ''
    );

    formData.append(
      'TripDate',
      value.date ?? ''
    );

    formData.append(
      'FuelStation',
      value.fuelStation ?? ''
    );

    formData.append(
      'DieselLitres',
      value.dieselLitres?.toString() ?? '0'
    );

    formData.append(
      'DieselCost',
      value.dieselCost?.toString() ?? '0'
    );

    formData.append(
      'FromKm',
      value.fromKm?.toString() ?? '0'
    );

    formData.append(
      'ToKm',
      value.toKm?.toString() ?? '0'
    );

    formData.append(
      'KmBeforeFueling',
      value.kmBeforeFueling?.toString() ?? '0'
    );

    formData.append(
      'TollCharges',
      value.tollCharges?.toString() ?? '0'
    );

    formData.append(
      'WorkshopExpenses',
      value.workshopExpenses?.toString() ?? '0'
    );

    formData.append(
      'TyreMaintenance',
      value.tyreMaintenance?.toString() ?? '0'
    );

    formData.append(
      'DriverSalary',
      value.driverSalary?.toString() ?? '0'
    );

    formData.append(
      'RtoCharges',
      value.rtoCharges?.toString() ?? '0'
    );

    formData.append(
      'TripRevenue',
      value.tripRevenue?.toString() ?? '0'
    );

    formData.append(
      'Notes',
      value.notes ?? ''
    );

    formData.append(
      'TenantId',
      currentTenantId
    );

    formData.append(
      'CreatedBy',
      currentUserId.toString()
    );

    formData.append(
      'UpdatedBy',
      currentUserId.toString()
    );

    // ===================================================
    // IMAGE ATTACHMENTS
    // ===================================================

    const imageAttachments:
      ImageAttachment[] =
      actualFiles.map(
        (image) => {

          const extension =
            image.name.includes('.')
              ? image.name.substring(
                  image.name.lastIndexOf('.')
                )
              : '';

          return {

            dailyTrackingId: null,

            fileName:
              image.name,

            filePath:
              '',

            fileType:
              image.type ||
              extension ||
              'image/jpeg',

            imageType:
              'DailyLog',

            isDelete:
              false,

            createdAt:
              nowIso,

            createdBy:
              currentUserId,

            updatedAt:
              nowIso,

            updatedBy:
              currentUserId,

            tenantId:
              currentTenantId
          };
        }
      );

    // ===================================================
    // APPEND IMAGE FILES
    // ===================================================

    actualFiles.forEach(
      (image) => {

        formData.append(
          'Images',
          image,
          image.name
        );

        formData.append(
          'files',
          image,
          image.name
        );
      }
    );

    // ===================================================
    // JSON IMAGE ATTACHMENTS
    // ===================================================

    formData.append(
      'ImageAttachmentsJson',
      JSON.stringify(
        imageAttachments
      )
    );

    formData.append(
      'imageAttachments',
      JSON.stringify(
        imageAttachments
      )
    );

    // ===================================================
    // INDEXED MODEL BINDER PROPERTIES
    // ===================================================

    imageAttachments.forEach(
      (att, i) => {

        // PascalCase
        formData.append(
          `ImageAttachments[${i}].FileName`,
          att.fileName
        );

        formData.append(
          `ImageAttachments[${i}].FilePath`,
          att.filePath
        );

        formData.append(
          `ImageAttachments[${i}].FileType`,
          att.fileType
        );

        formData.append(
          `ImageAttachments[${i}].ImageType`,
          att.imageType
        );

        formData.append(
          `ImageAttachments[${i}].IsDelete`,
          att.isDelete.toString()
        );

        formData.append(
          `ImageAttachments[${i}].CreatedAt`,
          att.createdAt
        );

        formData.append(
          `ImageAttachments[${i}].CreatedBy`,
          att.createdBy.toString()
        );

        formData.append(
          `ImageAttachments[${i}].UpdatedAt`,
          att.updatedAt
        );

        formData.append(
          `ImageAttachments[${i}].UpdatedBy`,
          att.updatedBy.toString()
        );

        formData.append(
          `ImageAttachments[${i}].TenantId`,
          att.tenantId
        );

        // camelCase
        formData.append(
          `imageAttachments[${i}].fileName`,
          att.fileName
        );

        formData.append(
          `imageAttachments[${i}].filePath`,
          att.filePath
        );

        formData.append(
          `imageAttachments[${i}].fileType`,
          att.fileType
        );

        formData.append(
          `imageAttachments[${i}].imageType`,
          att.imageType
        );

        formData.append(
          `imageAttachments[${i}].isDelete`,
          att.isDelete.toString()
        );

        formData.append(
          `imageAttachments[${i}].createdAt`,
          att.createdAt
        );

        formData.append(
          `imageAttachments[${i}].createdBy`,
          att.createdBy.toString()
        );

        formData.append(
          `imageAttachments[${i}].updatedAt`,
          att.updatedAt
        );

        formData.append(
          `imageAttachments[${i}].updatedBy`,
          att.updatedBy.toString()
        );

        formData.append(
          `imageAttachments[${i}].tenantId`,
          att.tenantId
        );
      }
    );

    // ===================================================
    // DEBUG
    // ===================================================

    console.log(
      'FormData payload:'
    );

    formData.forEach(
      (val, key) => {
        console.log(
          key,
          val
        );
      }
    );

    // ===================================================
    // API CALL
    // ===================================================

    this.api
      .post(
        'dailyRecords',
        formData
      )
      .subscribe({

        next: async (response) => {

          console.log(
            'Save response:',
            response
          );

          this.alert.success(
            'Record Saved Successfully'
          );

          await this.onReset();
        },

        error: (error) => {

          console.error(
            'Save error:',
            error
          );

          this.alert.error(
            'Failed to save record.'
          );
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