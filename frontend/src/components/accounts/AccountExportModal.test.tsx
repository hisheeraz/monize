import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@/test/render';
import { AccountExportModal } from './AccountExportModal';
import { accountsApi } from '@/lib/accounts';
import { usePreferencesStore } from '@/store/preferencesStore';
import toast from 'react-hot-toast';

vi.mock('@/lib/accounts', () => ({
  accountsApi: {
    exportAccount: vi.fn(),
  },
}));

vi.mock('react-hot-toast');

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  accountId: 'account-1',
  accountName: 'Chequing',
};

describe('AccountExportModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usePreferencesStore.setState({
      preferences: {
        dateFormat: 'YYYY-MM-DD',
      } as any,
      isLoaded: true,
    });
  });

  it('renders modal when isOpen is true', () => {
    render(<AccountExportModal {...defaultProps} />);
    expect(screen.getByText('Export Chequing')).toBeInTheDocument();
    expect(screen.getByLabelText('Format')).toBeInTheDocument();
    expect(screen.getByLabelText('Date format')).toBeInTheDocument();
  });

  it('does not render content when isOpen is false', () => {
    render(<AccountExportModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Export Chequing')).not.toBeInTheDocument();
  });

  it('shows split option only when CSV format is selected', () => {
    render(<AccountExportModal {...defaultProps} />);

    // CSV is default, split option should be visible
    expect(screen.getByLabelText('Split transactions')).toBeInTheDocument();

    // Switch to QIF
    fireEvent.change(screen.getByLabelText('Format'), { target: { value: 'qif' } });
    expect(screen.queryByLabelText('Split transactions')).not.toBeInTheDocument();

    // Switch back to CSV
    fireEvent.change(screen.getByLabelText('Format'), { target: { value: 'csv' } });
    expect(screen.getByLabelText('Split transactions')).toBeInTheDocument();
  });

  it('shows custom format input only when Custom is selected', () => {
    render(<AccountExportModal {...defaultProps} />);

    expect(screen.queryByLabelText('Custom format')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Date format'), { target: { value: 'custom' } });
    expect(screen.getByLabelText('Custom format')).toBeInTheDocument();
    expect(screen.getByText(/Use Y for year/)).toBeInTheDocument();
  });

  it('defaults date format to user preference', () => {
    usePreferencesStore.setState({
      preferences: {
        dateFormat: 'DD/MM/YYYY',
      } as any,
      isLoaded: true,
    });

    render(<AccountExportModal {...defaultProps} />);
    const select = screen.getByLabelText('Date format') as HTMLSelectElement;
    expect(select.value).toBe('DD/MM/YYYY');
  });

  it('calls exportAccount with correct CSV params on export', async () => {
    vi.mocked(accountsApi.exportAccount).mockResolvedValue(undefined);

    render(<AccountExportModal {...defaultProps} />);

    await act(async () => {
      fireEvent.click(screen.getByText('Export'));
    });

    await waitFor(() => {
      expect(accountsApi.exportAccount).toHaveBeenCalledWith(
        'account-1',
        'csv',
        { expandSplits: true, dateFormat: 'YYYY-MM-DD' },
      );
    });
  });

  it('calls exportAccount with QIF format', async () => {
    vi.mocked(accountsApi.exportAccount).mockResolvedValue(undefined);

    render(<AccountExportModal {...defaultProps} />);

    fireEvent.change(screen.getByLabelText('Format'), { target: { value: 'qif' } });

    await act(async () => {
      fireEvent.click(screen.getByText('Export'));
    });

    await waitFor(() => {
      expect(accountsApi.exportAccount).toHaveBeenCalledWith(
        'account-1',
        'qif',
        { expandSplits: undefined, dateFormat: 'YYYY-MM-DD' },
      );
    });
  });

  it('calls exportAccount with collapsed splits when selected', async () => {
    vi.mocked(accountsApi.exportAccount).mockResolvedValue(undefined);

    render(<AccountExportModal {...defaultProps} />);

    fireEvent.change(screen.getByLabelText('Split transactions'), { target: { value: 'collapse' } });

    await act(async () => {
      fireEvent.click(screen.getByText('Export'));
    });

    await waitFor(() => {
      expect(accountsApi.exportAccount).toHaveBeenCalledWith(
        'account-1',
        'csv',
        { expandSplits: false, dateFormat: 'YYYY-MM-DD' },
      );
    });
  });

  it('shows error toast when custom format is empty', async () => {
    render(<AccountExportModal {...defaultProps} />);

    fireEvent.change(screen.getByLabelText('Date format'), { target: { value: 'custom' } });

    await act(async () => {
      fireEvent.click(screen.getByText('Export'));
    });

    expect(toast.error).toHaveBeenCalledWith('Please enter a custom date format');
    expect(accountsApi.exportAccount).not.toHaveBeenCalled();
  });

  it('uses custom format when provided', async () => {
    vi.mocked(accountsApi.exportAccount).mockResolvedValue(undefined);

    render(<AccountExportModal {...defaultProps} />);

    fireEvent.change(screen.getByLabelText('Date format'), { target: { value: 'custom' } });
    fireEvent.change(screen.getByLabelText('Custom format'), { target: { value: 'DD.MM.YYYY' } });

    await act(async () => {
      fireEvent.click(screen.getByText('Export'));
    });

    await waitFor(() => {
      expect(accountsApi.exportAccount).toHaveBeenCalledWith(
        'account-1',
        'csv',
        { expandSplits: true, dateFormat: 'DD.MM.YYYY' },
      );
    });
  });

  it('calls onClose after successful export', async () => {
    vi.mocked(accountsApi.exportAccount).mockResolvedValue(undefined);

    render(<AccountExportModal {...defaultProps} />);

    await act(async () => {
      fireEvent.click(screen.getByText('Export'));
    });

    await waitFor(() => {
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  it('shows error toast on export failure', async () => {
    vi.mocked(accountsApi.exportAccount).mockRejectedValue(new Error('Network error'));

    render(<AccountExportModal {...defaultProps} />);

    await act(async () => {
      fireEvent.click(screen.getByText('Export'));
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('shows success toast on successful export', async () => {
    vi.mocked(accountsApi.exportAccount).mockResolvedValue(undefined);

    render(<AccountExportModal {...defaultProps} />);

    await act(async () => {
      fireEvent.click(screen.getByText('Export'));
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Exported as CSV');
    });
  });
});
