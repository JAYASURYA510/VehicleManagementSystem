import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR
} from '@angular/forms';
import {
  OwlDateTimeModule,
  OwlNativeDateTimeModule
} from '@danielmoncada/angular-datetime-picker';
import {
  DATETIME_PICKER_PROVIDERS,
  OwlPickerType
} from '../../core/services/datetime-picker.service';

@Component({
  selector: 'app-datetime-picker',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule
  ],
  providers: [
    ...DATETIME_PICKER_PROVIDERS,
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateTimePickerComponent),
      multi: true
    }
  ],
  templateUrl: './datetime-picker.html',
  styleUrl: './datetime-picker.css'
})
export class DateTimePickerComponent implements ControlValueAccessor {
  @Input() inputId = '';
  @Input() placeholder = 'Select date';
  @Input() pickerType: OwlPickerType = 'both';
  @Input() hour12Timer = true;
  @Input() firstDayOfWeek = 1;
  @Input() hideOtherMonths = true;

  value: Date | null = null;
  disabled = false;

  private onChange: (value: Date | null) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: Date | string | null): void {
    if (!value) {
      this.value = null;
      return;
    }
    this.value = value instanceof Date ? value : new Date(value);
  }

  registerOnChange(fn: (value: Date | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onValueChange(value: Date | null): void {
    this.value = value;
    this.onChange(value);
  }

  markTouched(): void {
    this.onTouched();
  }
}
