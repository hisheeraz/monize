export const PAGE_SIZE = 50;

export const DATE_FORMAT_OPTIONS = [
  { value: 'browser', label: 'Use browser locale (auto-detect)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2024-12-31)' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (12/31/2024)' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (31/12/2024)' },
  { value: 'DD-MMM-YYYY', label: 'DD-MMM-YYYY (31-Dec-2024)' },
];

export const EXPORT_DATE_FORMAT_OPTIONS = [
  ...DATE_FORMAT_OPTIONS,
  { value: 'custom', label: 'Custom...' },
];
