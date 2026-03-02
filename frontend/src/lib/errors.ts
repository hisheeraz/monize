import { AxiosError } from 'axios';
import toast from 'react-hot-toast';

/**
 * Shows an error toast unless the error is a 502 / network error (handled by BackendDownBanner).
 */
export function showErrorToast(error: unknown, fallback: string): void {
  if (error instanceof AxiosError && (error.response?.status === 502 || !error.response)) {
    return;
  }
  toast.error(getErrorMessage(error, fallback));
}

/**
 * Extracts a user-friendly error message from an error caught in a try/catch block.
 * Handles Axios errors (with server response messages) and generic Error objects.
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    return error.response?.data?.message || fallback;
  }
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as Record<string, unknown>).response === 'object'
  ) {
    const response = (error as { response: { data?: { message?: string } } }).response;
    return response?.data?.message || fallback;
  }
  if (error instanceof Error) {
    return error.message || fallback;
  }
  return fallback;
}
