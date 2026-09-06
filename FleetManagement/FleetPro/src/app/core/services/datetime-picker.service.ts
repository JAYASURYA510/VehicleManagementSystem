import { Inject, Injectable } from '@angular/core';
import { Platform } from '@angular/cdk/platform';
import {
  DateTimeAdapter,
  NativeDateTimeAdapter,
  OWL_DATE_TIME_FORMATS,
  OWL_DATE_TIME_LOCALE
} from '@danielmoncada/angular-datetime-picker';

export type OwlPickerType = 'both' | 'calendar' | 'timer';

export const OWL_DATETIME_FORMATS = {
  parseInput: {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  },
  fullPickerInput: {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  },
  datePickerInput: {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  },
  timePickerInput: {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  },
  monthYearLabel: { year: 'numeric', month: 'long' },
  dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
  monthYearA11yLabel: { year: 'numeric', month: 'long' }
};

@Injectable()
export class HyphenDateTimeAdapter extends NativeDateTimeAdapter {
  constructor(
    @Inject(OWL_DATE_TIME_LOCALE) locale: string,
    platform: Platform
  ) {
    super(locale, platform);
  }

  override format(date: Date, displayFormat: any): string {
    if (
      displayFormat?.year === 'numeric' &&
      displayFormat?.month === 'long' &&
      !displayFormat?.day &&
      !displayFormat?.hour &&
      !displayFormat?.minute
    ) {
      return super.format(date, displayFormat);
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    if (displayFormat?.hour || displayFormat?.minute) {
      let hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const strHours = String(hours).padStart(2, '0');
      return `${day}/${month}/${year} ${strHours}:${minutes} ${ampm}`;
    }

    return `${day}/${month}/${year}`;
  }

  override parse(value: any, parseFormat: any): Date | null {
    if (typeof value === 'string' && value.trim()) {
      const trimmed = value.trim();
      const parsedDate = new Date(trimmed);
      if (!Number.isNaN(parsedDate.getTime())) {
        return parsedDate;
      }

      const dParts = trimmed.match(
        /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})(?:[,\s]+(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s*(AM|PM))?)?/i
      );
      if (dParts) {
        const day = Number(dParts[1]);
        const month = Number(dParts[2]);
        const year = Number(dParts[3]);
        let hours = dParts[4] ? Number(dParts[4]) : 0;
        const minutes = dParts[5] ? Number(dParts[5]) : 0;
        const seconds = dParts[6] ? Number(dParts[6]) : 0;
        const ampm = dParts[7]?.toUpperCase();
        if (ampm === 'PM' && hours < 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;
        return new Date(year, month - 1, day, hours, minutes, seconds);
      }
    }

    return super.parse(value, parseFormat);
  }
}

export const DATETIME_PICKER_PROVIDERS = [
  { provide: OWL_DATE_TIME_LOCALE, useValue: 'en-GB' },
  { provide: OWL_DATE_TIME_FORMATS, useValue: OWL_DATETIME_FORMATS },
  HyphenDateTimeAdapter,
  { provide: DateTimeAdapter, useExisting: HyphenDateTimeAdapter }
];

@Injectable({
  providedIn: 'root'
})
export class DateTimePickerService {
  toDate(value: Date | string | null | undefined): Date | null {
    if (!value) {
      return null;
    }

    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  toApiDate(value: Date | string | null | undefined): string | null {
    const date = this.toDate(value);
    if (!date) {
      return null;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  toApiDateTime(value: Date | string | null | undefined): string | null {
    const date = this.toDate(value);
    if (!date) {
      return null;
    }

    const pad = (num: number) => num.toString().padStart(2, '0');
    return (
      `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T` +
      `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}Z`
    );
  }
}
