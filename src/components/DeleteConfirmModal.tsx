import { useTranslation } from 'react-i18next'
import { Button } from './ui/button'

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  bookTitle: string
  loading: boolean
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  bookTitle,
  loading,
}: DeleteConfirmModalProps) {
  const { t } = useTranslation()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" data-testid="delete-confirm-modal">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{t('deleteBook.title')}</h3>
        <p className="text-gray-600 mb-6">
          {t('deleteBook.confirmation', { title: bookTitle })}
        </p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={loading}
            data-testid="cancel-delete-button"
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 bg-red-600 hover:bg-red-700"
            disabled={loading}
            data-testid="confirm-delete-button"
          >
            {loading ? t('deleteBook.confirming') : t('deleteBook.confirm')}
          </Button>
        </div>
      </div>
    </div>
  )
}
