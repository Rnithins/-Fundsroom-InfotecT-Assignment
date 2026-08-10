import React from 'react';
import { Modal } from './Modal';
import { AlertTriangle, Info } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'info' | 'warning';
  loading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning',
  loading = false,
}) => {
  const iconColor =
    type === 'danger'
      ? 'text-rose-600 bg-rose-100'
      : type === 'warning'
      ? 'text-amber-600 bg-amber-100'
      : 'text-sky-600 bg-sky-100';

  const confirmBtnClass =
    type === 'danger'
      ? 'bg-rose-600 hover:bg-rose-700 text-white'
      : type === 'warning'
      ? 'bg-amber-600 hover:bg-amber-700 text-white'
      : 'bg-sky-600 hover:bg-sky-700 text-white';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="md">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-full shrink-0 ${iconColor}`}>
          {type === 'info' ? <Info className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
        </div>
        <div className="flex-1">
          <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          {cancelText}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors shadow-xs disabled:opacity-50 inline-flex items-center gap-2 ${confirmBtnClass}`}
        >
          {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
          {confirmText}
        </button>
      </div>
    </Modal>
  );
};
