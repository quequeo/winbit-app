import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ensureFirebaseStorageUrl,
  isImageFile,
  isImageUrl,
  isPdfFile,
  isPdfUrl,
} from '../../../utils/attachmentUrl';

const openInNewTab = (url) => {
  if (!url) return;
  window.open(url, '_blank', 'noopener,noreferrer');
};

export const ReceiptAttachment = ({ file = null, url = null, onRemove = null }) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const objectUrl = useMemo(() => {
    if (!file) return null;
    if (!isImageFile(file) && !isPdfFile(file)) return null;
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  const remoteUrl = url ? ensureFirebaseStorageUrl(url) : null;
  const previewUrl =
    file && isImageFile(file) ? objectUrl : remoteUrl && isImageUrl(remoteUrl) ? remoteUrl : null;
  const isPdf = file ? isPdfFile(file) : isPdfUrl(remoteUrl);
  const isImage = Boolean(previewUrl);
  const openUrl = objectUrl || remoteUrl;

  if (!file && !url) return null;

  const label = file?.name ?? t('deposits.requestForm.attachment.previewTitle', 'Comprobante');

  return (
    <div className="mt-3 space-y-2 rounded-lg border border-[rgba(101,167,165,0.25)] bg-[rgba(20,20,20,0.45)] p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-text-primary">
            {t('deposits.requestForm.attachment.previewTitle', 'Vista previa del comprobante')}
          </p>
          <p className="mt-0.5 truncate text-xs text-text-muted">{label}</p>
        </div>
        {onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className="shrink-0 text-xs font-semibold text-error hover:underline"
          >
            {t('deposits.requestForm.attachment.remove', 'Quitar')}
          </button>
        ) : null}
      </div>

      {isImage && previewUrl ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="block w-full overflow-hidden rounded-lg border border-[rgba(255,255,255,0.08)] focus:outline-none focus:ring-2 focus:ring-primary/40"
          aria-expanded={expanded}
        >
          <img
            src={previewUrl}
            alt={t('deposits.requestForm.attachment.previewAlt', 'Vista previa del comprobante')}
            className={
              expanded
                ? 'max-h-[70vh] w-full object-contain bg-black/30'
                : 'max-h-48 w-full object-contain bg-black/20'
            }
          />
        </button>
      ) : isPdf ? (
        <div className="flex items-center gap-3 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(15,18,18,0.6)] px-3 py-4">
          <svg
            className="h-10 w-10 shrink-0 text-primary"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <p className="text-sm text-text-muted">
            {t('deposits.requestForm.attachment.pdfSelected', 'Archivo PDF seleccionado')}
          </p>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => openInNewTab(openUrl)}
          className="rounded-lg border border-[rgba(101,167,165,0.35)] px-3 py-1.5 text-xs font-semibold text-primary hover:bg-[rgba(101,167,165,0.12)]"
        >
          {t('deposits.requestForm.attachment.openFull', 'Ver en tamaño completo')}
        </button>
        {isImage && previewUrl ? (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="rounded-lg border border-[rgba(255,255,255,0.08)] px-3 py-1.5 text-xs font-semibold text-text-primary hover:bg-[rgba(101,167,165,0.08)]"
          >
            {expanded
              ? t('deposits.requestForm.attachment.collapse', 'Reducir')
              : t('deposits.requestForm.attachment.expand', 'Ampliar')}
          </button>
        ) : null}
      </div>
    </div>
  );
};
