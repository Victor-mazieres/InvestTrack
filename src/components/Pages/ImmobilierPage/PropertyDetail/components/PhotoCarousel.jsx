import React, { useRef, useState, useLayoutEffect, useCallback } from 'react';
import Slider from 'react-slick';
import {
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ImagePlus,
  AlertCircle
} from 'lucide-react';
import PropTypes from 'prop-types';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function ArrowBtn({ onClick, dir = 'left' }) {
  const Icon = dir === 'left' ? ChevronLeft : ChevronRight;
  return (
    <button
      aria-label={dir === 'left' ? 'Précédent' : 'Suivant'}
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      className={`absolute top-1/2 -translate-y-1/2 z-20 hidden group-hover:flex items-center justify-center
        ${dir === 'left' ? 'left-2' : 'right-2'}
        h-10 w-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm border border-white/10
        transition focus:outline-none`}
    >
      <Icon className="w-6 h-6 text-white" />
    </button>
  );
}

export default function PhotoCarousel({
  photos,
  onAdd,
  onDelete,
  maxPhotos = 6,
  maxFileSize = 5 * 1024 * 1024
}) {
  const sliderRef     = useRef(null);
  const inputRef      = useRef(null);
  const prevCountRef  = useRef(photos.length);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);
  const [isDragOver, setIsDragOver]     = useState(false);

  // Navigue intelligemment si la longueur change
  useLayoutEffect(() => {
    const prev = prevCountRef.current;
    const curr = photos.length;
    if (curr > prev) {
      sliderRef.current?.slickGoTo(curr - 1);
    } else if (curr < prev) {
      const idx = Math.min(currentSlide, curr - 1);
      sliderRef.current?.slickGoTo(Math.max(0, idx));
    }
    prevCountRef.current = curr;
  }, [photos.length, currentSlide]);

  const canAdd = photos.length < maxPhotos;

  const settings = {
    dots: true,
    arrows: photos.length > 0,
    infinite: photos.length + (canAdd ? 1 : 0) > 1,
    centerMode: true,
    centerPadding: '24px',
    slidesToShow: 1,
    slidesToScroll: 1,
    afterChange: setCurrentSlide,
    prevArrow: <ArrowBtn dir="left" />,
    nextArrow: <ArrowBtn dir="right" />,
    appendDots: dots => (
      <div className="absolute bottom-3 left-0 right-0">
        <ul className="flex justify-center items-center gap-1.5">{dots}</ul>
      </div>
    ),
    customPaging: () => (
      <div className="h-1.5 w-6 rounded-full bg-white/30 group-[.slick-active]:bg-white/80 transition" />
    )
  };

  const validateFiles = (files) => {
    const valid = [];
    for (let file of files) {
      if (!file.type.startsWith('image/')) {
        setError(`« ${file.name} » n'est pas une image.`);
      } else if (file.size > maxFileSize) {
        setError(`« ${file.name} » dépasse ${Math.round(maxFileSize/1024/1024)} Mo.`);
      } else {
        valid.push(file);
      }
      if (valid.length >= maxPhotos - photos.length) break;
    }
    return valid;
  };

  const doUpload = async (files) => {
    const toUpload = validateFiles(files);
    if (!toUpload.length) return;

    setLoading(true);
    try {
      for (let file of toUpload) {
        // onAdd peut retourner la photo créée; on ne l’utilise pas ici, c’est ton store qui mettra à jour `photos`
        await onAdd(file);
      }
    } catch (err) {
      console.error(err);
      setError("Une erreur est survenue lors de l'upload.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = useCallback(async (e) => {
    setError(null);
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    await doUpload(files);
    e.target.value = null;
  }, [maxFileSize, maxPhotos, photos.length, onAdd]);

  const handleDelete = useCallback(async (id) => {
    setError(null);
    setLoading(true);
    try {
      await onDelete(id);
    } catch (err) {
      console.error(err);
      setError("Impossible de supprimer cette photo.");
    } finally {
      setLoading(false);
    }
  }, [onDelete]);

  // Drag & drop
  const onDragOver = (e) => {
    if (!canAdd) return;
    e.preventDefault();
    setIsDragOver(true);
  };
  const onDragLeave = () => setIsDragOver(false);
  const onDrop = async (e) => {
    if (!canAdd) return;
    e.preventDefault();
    setIsDragOver(false);
    setError(null);
    const files = Array.from(e.dataTransfer.files || []);
    await doUpload(files);
  };

  return (
    <div
      className="group relative mb-6 rounded-2xl border border-gray-800 bg-gray-900/60 shadow-xl overflow-hidden"
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* Header compact */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800">
        <div className="text-sm text-gray-300">
          Photos <span className="text-gray-500">({photos.length}/{maxPhotos})</span>
        </div>
        {canAdd && (
          <button
            onClick={() => inputRef.current?.click()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm
                       bg-gray-800 hover:bg-gray-700 text-gray-100 border border-gray-700
                       transition disabled:opacity-50"
          >
            <ImagePlus className="w-4 h-4" />
            Ajouter
          </button>
        )}
      </div>

      {/* Zone de glisser-déposer (overlay) */}
      {isDragOver && canAdd && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="rounded-2xl border-2 border-dashed border-white/60 px-6 py-5 text-center">
            <p className="text-white font-medium">Dépose tes images ici</p>
            <p className="text-white/80 text-xs mt-1">PNG, JPG • Max {Math.round(maxFileSize/1024/1024)} Mo</p>
          </div>
        </div>
      )}

      {/* Alerte d’erreur */}
      {error && (
        <div className="absolute top-2 left-2 right-2 z-30">
          <div className="flex items-center gap-2 rounded-xl bg-red-500/15 border border-red-500/30 px-3 py-2 text-red-200">
            <AlertCircle className="w-4 h-4" />
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Slider */}
      <div className="relative">
        {/* Dégradés latéraux pour lisibilité des flèches */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-12 bg-gradient-to-r from-gray-900/80 to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-gray-900/80 to-transparent" />

        <Slider {...settings} ref={sliderRef}>
          {photos.map((photo, idx) => (
            <div key={photo.id} className="relative px-3">
              <div className="relative overflow-hidden rounded-xl border border-gray-800">
                <img
                  src={photo.url}
                  alt={photo.caption || `Photo ${idx + 1}`}
                  className="w-full aspect-[4/3] object-cover"
                  loading="lazy"
                  width={1200}
                  height={900}
                />

                {/* Overlay: index + légende */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-white/15 text-white">
                      {idx + 1} / {photos.length}
                    </span>
                    {photo.caption && (
                      <span className="truncate text-xs text-white/90 max-w-[70%]">
                        {photo.caption}
                      </span>
                    )}
                  </div>
                </div>

                {/* Supprimer */}
                <button
                  onClick={() => handleDelete(photo.id)}
                  disabled={loading}
                  className="absolute top-2 right-2 inline-flex items-center justify-center h-9 w-9 rounded-full
                             bg-black/45 hover:bg-red-600 text-white border border-white/10 transition
                             disabled:opacity-50 z-10"
                  aria-label="Supprimer la photo"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-5 h-5" />}
                </button>
              </div>
            </div>
          ))}

          {canAdd && (
            <div key="add-slide" className="px-3">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={loading}
                className={`w-full aspect-[4/3] rounded-xl border-2 border-dashed
                            ${loading ? 'opacity-60 cursor-not-allowed' : 'hover:border-greenLight/70'}
                            border-gray-700 bg-gray-800/60 flex items-center justify-center transition`}
              >
                <div className="flex flex-col items-center text-center">
                  {loading ? (
                    <Loader2 className="w-10 h-10 animate-spin text-gray-300" />
                  ) : (
                    <Plus className="w-10 h-10 text-gray-400 group-hover:text-greenLight transition" />
                  )}
                  <span className="mt-2 text-gray-200 text-sm font-medium">
                    Ajouter des photos
                  </span>
                  <span className="text-gray-400 text-xs">
                    PNG, JPG • Max {Math.round(maxFileSize/1024/1024)} Mo
                  </span>
                  <span className="text-gray-500 text-[11px] mt-2">
                    Cliquer ou glisser-déposer
                  </span>
                </div>
              </button>
            </div>
          )}
        </Slider>
      </div>

      {canAdd && (
        <input
          type="file"
          accept="image/*"
          multiple
          ref={inputRef}
          className="hidden"
          onChange={handleFileChange}
        />
      )}
    </div>
  );
}

PhotoCarousel.propTypes = {
  photos: PropTypes.arrayOf(PropTypes.shape({
    id:  PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    url: PropTypes.string.isRequired,
    caption: PropTypes.string
  })).isRequired,
  onAdd:      PropTypes.func.isRequired,
  onDelete:   PropTypes.func.isRequired,
  maxPhotos:  PropTypes.number,
  maxFileSize:PropTypes.number,
};
