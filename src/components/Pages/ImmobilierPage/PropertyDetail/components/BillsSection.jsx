// src/components/BillsSection.jsx
import React, { useReducer, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Loader } from './Loader';
import { formatAmount, formatDate } from '../utils/format';
import { Plus, Trash2, Eye, X, Download, Minus, ZoomIn } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const initialForm = { title: '', amount: '', file: null };
function formReducer(state, action) {
  switch (action.type) {
    case 'FIELD': return { ...state, [action.field]: action.value };
    case 'RESET': return initialForm;
    default:      return state;
  }
}

/** Zoom & Pan container with:
 * - pinch (2 fingers)
 * - wheel zoom
 * - double click/tap toggle
 * - drag when zoomed
 */
function ZoomPan({
  children,
  className = '',
  min = 1,
  max = 4,
  doubleClickStep = 2,
}) {
  const wrapperRef = useRef(null);
  const contentRef = useRef(null);

  const [scale, setScale] = React.useState(1);
  const [tx, setTx] = React.useState(0);
  const [ty, setTy] = React.useState(0);

  // pointers tracking for pinch
  const pointers = useRef(new Map());
  const startDist = useRef(null);
  const startMid = useRef({ x: 0, y: 0 });
  const startTxTy = useRef({ tx: 0, ty: 0 });
  const lastTapTime = useRef(0);

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  const applyTransformStyle = () => {
    if (contentRef.current) {
      contentRef.current.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
    }
  };

  useEffect(applyTransformStyle, [scale, tx, ty]);

  const getRelativePoint = (clientX, clientY) => {
    const rect = wrapperRef.current.getBoundingClientRect();
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const distance = (p1, p2) =>
    Math.hypot(p2.x - p1.x, p2.y - p1.y);

  const midpoint = (p1, p2) => ({
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  });

  const onPointerDown = (e) => {
    if (!wrapperRef.current) return;
    wrapperRef.current.setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 2) {
      // start pinch
      const [a, b] = Array.from(pointers.current.values());
      startDist.current = distance(a, b);
      startMid.current = midpoint(a, b);
      startTxTy.current = { tx, ty };
    }
  };

  const onPointerMove = (e) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 2) {
      // pinch zoom
      const [a, b] = Array.from(pointers.current.values());
      const dist = distance(a, b);
      const mid = midpoint(a, b);

      const rectPt = getRelativePoint(startMid.current.x, startMid.current.y);
      const factor = dist / (startDist.current || dist);
      let newScale = clamp(scale * factor, min, max);

      // Adjust translate so that the zoom center remains on the same point
      const k = newScale / scale;
      const dx = (mid.x - startMid.current.x);
      const dy = (mid.y - startMid.current.y);

      setScale((prev) => {
        // recalc with prev in case of batching
        const next = clamp(prev * factor, min, max);
        return next;
      });

      setTx(startTxTy.current.tx + (rectPt.x - tx) * (k - 1) + dx);
      setTy(startTxTy.current.ty + (rectPt.y - ty) * (k - 1) + dy);

      // reset baseline for smooth continuous pinch
      startDist.current = dist;
      startMid.current = mid;
      startTxTy.current = { tx, ty };
    } else if (pointers.current.size === 1 && scale > 1) {
      // drag/pan with single pointer
      const cur = pointers.current.get(e.pointerId);
      const { x, y } = cur;
      const { x: rx, y: ry } = getRelativePoint(x, y);
      // use movementX/Y for smoother pan
      setTx((prev) => prev + (e.movementX ?? 0));
      setTy((prev) => prev + (e.movementY ?? 0));
    }
  };

  const onPointerUp = (e) => {
    wrapperRef.current?.releasePointerCapture?.(e.pointerId);
    pointers.current.delete(e.pointerId);
    startDist.current = null;
  };

  const onWheel = (e) => {
    e.preventDefault();
    const delta = -e.deltaY; // up to zoom in
    const step = delta > 0 ? 1.1 : 0.9;
    const rect = wrapperRef.current.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    const newScale = clamp(scale * step, min, max);
    const k = newScale / scale;

    setTx((prev) => (cx - (cx - prev) * k));
    setTy((prev) => (cy - (cy - prev) * k));
    setScale(newScale);
  };

  const onDoubleClick = (e) => {
    e.preventDefault();
    const now = Date.now();
    const rect = wrapperRef.current.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    // toggle between 1 and step (e.g., 2) or back
    const targetScale = scale === 1 ? clamp(doubleClickStep, min, max) : 1;
    const k = targetScale / scale;

    setTx((prev) => (cx - (cx - prev) * k));
    setTy((prev) => (cy - (cy - prev) * k));
    setScale(targetScale);

    lastTapTime.current = now;
  };

  // Controls (+/-) for non-touch PDF comfort
  const zoomBy = (factor) => {
    const rect = wrapperRef.current.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const newScale = clamp(scale * factor, min, max);
    const k = newScale / scale;
    setTx((prev) => (cx - (cx - prev) * k));
    setTy((prev) => (cy - (cy - prev) * k));
    setScale(newScale);
  };

  const reset = () => {
    setScale(1);
    setTx(0);
    setTy(0);
  };

  return (
    <div className="relative w-full h-full">
      {/* Optional inline controls (visible si zoom ≠ 1) */}
      <div className="absolute top-2 right-2 z-10 flex gap-2">
        <button
          className="p-2 rounded bg-gray-800/80 hover:bg-gray-700 text-white"
          onClick={() => zoomBy(1 / 1.2)}
          title="Zoom -"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          className="p-2 rounded bg-gray-800/80 hover:bg-gray-700 text-white"
          onClick={() => zoomBy(1.2)}
          title="Zoom +"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
      </div>

      <div
        ref={wrapperRef}
        className={`w-full h-full overflow-hidden touch-none ${className}`}
        style={{
          // indispensable pour pointer/multi-touch
          touchAction: 'none',
          cursor: scale > 1 ? 'grab' : 'auto',
          backgroundColor: 'black',
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
        onDoubleClick={onDoubleClick}
      >
        <div
          ref={contentRef}
          className="w-full h-full will-change-transform"
          style={{ transformOrigin: '0 0' }}
        >
          {children}
        </div>
      </div>

      {/* Reset button visible si zoomé */}
      {scale !== 1 && (
        <button
          className="absolute bottom-2 right-2 z-10 px-3 py-1.5 rounded bg-gray-800/80 hover:bg-gray-700 text-white text-sm"
          onClick={reset}
        >
          Réinitialiser
        </button>
      )}
    </div>
  );
}

ZoomPan.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  min: PropTypes.number,
  max: PropTypes.number,
  doubleClickStep: PropTypes.number,
};

function BillsSection({
  bills,
  loading,
  addBill,
  deleteBill,
  travauxEstimes,
  totalBills,
  budgetRestant,
}) {
  const [form, dispatch] = useReducer(formReducer, initialForm);
  const [showForm, setShowForm] = React.useState(false);

  // --- Prévisualisation (modale) par Blob (fiable PDF/image)
  const [blobUrl, setBlobUrl] = React.useState(null);
  const [downloadUrl, setDownloadUrl] = React.useState(null);
  const [mimeType, setMimeType] = React.useState(null);
  const [loadingPreview, setLoadingPreview] = React.useState(false);
  const [previewError, setPreviewError] = React.useState(null);

  const buildAbsoluteUrl = (bill) =>
    bill.fileUrlAbsolute || `${API_BASE}${bill.fileUrl}`;

  const openPreview = async (bill) => {
    const absolute = buildAbsoluteUrl(bill);
    if (!absolute) return;

    if (blobUrl) URL.revokeObjectURL(blobUrl);
    setBlobUrl(null);
    setDownloadUrl(absolute);
    setMimeType(null);
    setPreviewError(null);
    setLoadingPreview(true);

    try {
      const res = await fetch(absolute /* , { credentials: 'include' } */);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const ct = res.headers.get('content-type') || '';
      setMimeType(ct);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setBlobUrl(url);
    } catch (e) {
      console.error(e);
      setPreviewError("Impossible d'afficher la facture. Vous pouvez la télécharger.");
    } finally {
      setLoadingPreview(false);
    }
  };

  const closePreview = () => {
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    setBlobUrl(null);
    setDownloadUrl(null);
    setMimeType(null);
    setPreviewError(null);
  };

  // ESC pour fermer
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && closePreview();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', form.title);
    data.append('amount', form.amount);
    data.append('file', form.file);
    addBill(data);
    dispatch({ type: 'RESET' });
    setShowForm(false);
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-4">
      {/* Résumé financier */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-gray-300">
        <div className="bg-gray-700 rounded p-3">
          <p className="text-xs">Travaux estimés</p>
          <p className="text-lg font-bold">{formatAmount(travauxEstimes)}</p>
        </div>
        <div className="bg-gray-700 rounded p-3">
          <p className="text-xs">Total factures</p>
          <p className="text-lg font-bold">{formatAmount(totalBills)}</p>
        </div>
        <div className="bg-gray-700 rounded p-3">
          <p className="text-xs">Budget restant</p>
          <p className="text-lg font-bold">{formatAmount(budgetRestant)}</p>
        </div>
      </div>

      {/* Liste des factures */}
      {bills.length > 0 ? bills.map((b) => (
        <div key={b.id} className="flex justify-between items-center bg-gray-700 p-2 rounded">
          <div>
            <div className="font-semibold text-white">{b.title}</div>
            <div className="text-gray-300 text-sm">
              {formatDate(b.date)} — {formatAmount(b.amount)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => openPreview(b)}
              className="p-1 hover:bg-gray-600 rounded"
              title="Voir la facture"
              aria-label="Voir la facture"
              disabled={!b.fileUrl && !b.fileUrlAbsolute}
            >
              <Eye className="w-5 h-5 text-blue-400" />
            </button>
            <button
              onClick={() => deleteBill(b.id)}
              className="p-1 hover:bg-gray-600 rounded"
              title="Supprimer"
              aria-label="Supprimer la facture"
            >
              <Trash2 className="w-5 h-5 text-red-500" />
            </button>
          </div>
        </div>
      )) : (
        <p className="text-gray-400">Aucune facture pour le moment.</p>
      )}

      {/* Formulaire / bouton d’ajout */}
      {showForm ? (
        <form onSubmit={onSubmit} className="bg-gray-700 p-4 rounded-2xl space-y-2">
          <div>
            <label className="block text-gray-400">Titre</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => dispatch({ type: 'FIELD', field: 'title', value: e.target.value })}
              className="w-full bg-gray-600 p-2 rounded-2xl text-white"
              required
            />
          </div>
          <div>
            <label className="block text-gray-400">Montant (€)</label>
            <input
              type="number"
              step=".01"
              value={form.amount}
              onChange={(e) => dispatch({ type: 'FIELD', field: 'amount', value: e.target.value })}
              className="w-full bg-gray-600 p-2 rounded-2xl text-white"
              required
            />
          </div>
          <div>
            <label className="block text-gray-400">Document</label>
            <input
              type="file"
              accept="application/pdf,image/*"
              onChange={(e) => dispatch({ type: 'FIELD', field: 'file', value: e.target.files?.[0] || null })}
              className="w-full bg-gray-600 p-2 rounded-2xl text-white"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => { setShowForm(false); dispatch({ type: 'RESET' }); }}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-2xl"
            >
              Annuler
            </button>
            <button type="submit" className="px-4 py-2 bg-greenLight text-white hover:bg-green-500 rounded-2xl">
              Envoyer
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-greenLight rounded-2xl hover:bg-green-500 transition"
        >
          <Plus className="w-5 h-5" />
          <span>Ajouter</span>
        </button>
      )}

      {/* --------- MODALE DE PRÉVISUALISATION --------- */}
      {(blobUrl || loadingPreview || previewError) && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={closePreview}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative bg-gray-900 rounded-2xl shadow-xl w-full max-w-5xl h-[80vh] border border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header modale */}
            <div className="flex items-center justify-between p-3 border-b border-gray-700">
              <div className="text-white font-semibold truncate">Prévisualisation de la facture</div>
              <div className="flex items-center gap-2">
                <a
                  href={downloadUrl || '#'}
                  download
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
                    downloadUrl ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-800 opacity-60 cursor-not-allowed'
                  }`}
                  onClick={(e) => { if (!downloadUrl) e.preventDefault(); }}
                  title="Télécharger"
                >
                  <Download className="w-4 h-4" />
                  Télécharger
                </a>
                <button
                  onClick={closePreview}
                  className="p-2 rounded hover:bg-gray-700"
                  aria-label="Fermer"
                  title="Fermer"
                >
                  <X className="w-5 h-5 text-gray-300" />
                </button>
              </div>
            </div>

            {/* Contenu avec ZoomPan */}
            <div className="w-full h-[calc(80vh-56px)] bg-black">
              {loadingPreview && (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  Chargement…
                </div>
              )}

              {!loadingPreview && previewError && (
                <div className="w-full h-full flex flex-col items-center justify-center text-red-300 p-4 text-center">
                  {previewError}
                  {downloadUrl && (
                    <a href={downloadUrl} download className="underline text-blue-300 mt-2">
                      Télécharger le fichier
                    </a>
                  )}
                </div>
              )}

              {!loadingPreview && !previewError && blobUrl && (
                <ZoomPan className="w-full h-full">
                  {mimeType?.startsWith('image/')
                    ? (
                      <img
                        src={blobUrl}
                        alt="Facture"
                        className="w-full h-full object-contain select-none"
                        draggable={false}
                      />
                    )
                    : (
                      // PDF / autres: zoom sur conteneur, viewer passif
                      <div className="w-full h-full">
                        <object
                          data={blobUrl}
                          type={mimeType || 'application/pdf'}
                          className="w-full h-full bg-white pointer-events-none"
                        >
                          <iframe src={blobUrl} title="Facture" className="w-full h-full bg-white pointer-events-none" />
                        </object>
                      </div>
                    )
                  }
                </ZoomPan>
              )}
            </div>
          </div>
        </div>
      )}
      {/* --------- /MODALE --------- */}
    </div>
  );
}

BillsSection.propTypes = {
  bills:          PropTypes.array.isRequired,
  loading:        PropTypes.bool.isRequired,
  addBill:        PropTypes.func.isRequired,
  deleteBill:     PropTypes.func.isRequired,
  travauxEstimes: PropTypes.number.isRequired,
  totalBills:     PropTypes.number.isRequired,
  budgetRestant:  PropTypes.number.isRequired,
};

export default React.memo(BillsSection);
