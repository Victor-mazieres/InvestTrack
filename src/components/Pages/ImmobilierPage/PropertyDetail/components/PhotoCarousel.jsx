// src/components/PhotoCarousel.jsx
import React, { useRef, useState, useEffect, useCallback, useLayoutEffect } from 'react'
import Slider from 'react-slick'
import { Plus, X } from 'lucide-react'
import PropTypes from 'prop-types'
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"

export default function PhotoCarousel({ photos, onAdd, onDelete, maxPhotos = 6, maxFileSize = 5 * 1024 * 1024 }) {
  const sliderRef     = useRef(null)
  const inputRef      = useRef(null)
  const prevCountRef  = useRef(photos.length)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState(null)

  // Quand la longueur de photos change, on navigue automatiquement
  useLayoutEffect(() => {
    const prev = prevCountRef.current
    const curr = photos.length
    if (curr > prev) {
      // ajout → aller à la dernière
      sliderRef.current?.slickGoTo(curr - 1)
    } else if (curr < prev) {
      // suppression → rester sur la slide la plus proche
      const idx = Math.min(currentSlide, curr - 1, Math.max(0, curr - 1))
      sliderRef.current?.slickGoTo(Math.max(0, idx))
    }
    prevCountRef.current = curr
  }, [photos.length, currentSlide])

  const settings = {
    dots: true,
    arrows: false,
    infinite: photos.length + (photos.length < maxPhotos ? 1 : 0) > 1,
    centerMode: true,
    centerPadding: '20px',
    slidesToShow: 1,
    slidesToScroll: 1,
    afterChange: setCurrentSlide,
  }

  const validateFiles = files => {
    const valid = []
    for (let file of files) {
      if (!file.type.startsWith('image/')) {
        setError(`Le fichier ${file.name} n'est pas une image.`)
      } else if (file.size > maxFileSize) {
        setError(`Le fichier ${file.name} dépasse ${maxFileSize/1024/1024} Mo.`)
      } else {
        valid.push(file)
      }
      if (valid.length >= maxPhotos - photos.length) break
    }
    return valid
  }

  const handleFileChange = useCallback(async e => {
    setError(null)
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    const toUpload = validateFiles(files)
    if (!toUpload.length) {
      e.target.value = null
      return
    }

    setLoading(true)
    try {
      // onAdd peut accepter un array ou un fichier à la fois
      for (let file of toUpload) {
        await onAdd(file)
      }
    } catch (err) {
      console.error(err)
      setError("Une erreur est survenue lors de l'upload.")
    } finally {
      setLoading(false)
      e.target.value = null
    }
  }, [maxFileSize, maxPhotos, photos.length, onAdd])

  const handleDelete = useCallback(async id => {
    setError(null)
    setLoading(true)
    try {
      await onDelete(id)
    } catch (err) {
      console.error(err)
      setError("Impossible de supprimer cette photo.")
    } finally {
      setLoading(false)
    }
  }, [onDelete])

  const canAdd = photos.length < maxPhotos

  return (
    <div className="mb-6 relative">
      {error && (
        <div className="absolute top-0 left-0 right-0 bg-red-100 text-red-800 p-2 text-center rounded">
          {error}
        </div>
      )}

      <Slider {...settings} ref={sliderRef}>
        {photos.map(photo => (
          <div key={photo.id} className="relative px-2">
            <img
              src={photo.url}
              alt=""
              className="w-full h-64 object-cover rounded-lg"
              onLoad={e => URL.revokeObjectURL(e.target.src)} // sécurité
            />
            <button
              onClick={() => handleDelete(photo.id)}
              disabled={loading}
              className="absolute top-2 right-2 bg-black bg-opacity-50 p-1 rounded-full text-white hover:bg-red-600 transition disabled:opacity-50"
            >
              <X size={16} />
            </button>
          </div>
        ))}

        {canAdd && (
          <div key="add-slide" className="flex items-center justify-center px-2">
            <div
              onClick={() => inputRef.current.click()}
              className={`w-full h-48 flex items-center justify-center border-2 border-dashed rounded-lg cursor-pointer transition 
                ${loading ? 'opacity-50 cursor-not-allowed' : 'border-gray-600 hover:border-greenLight'}`}
            >
              {loading
                ? <span>Chargement…</span>
                : <Plus className="w-12 h-12 text-gray-500 hover:text-greenLight transition" />
              }
            </div>
          </div>
        )}
      </Slider>

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
  )
}

PhotoCarousel.propTypes = {
  photos:    PropTypes.arrayOf(PropTypes.shape({
               id:   PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
               url:  PropTypes.string.isRequired
             })).isRequired,
  onAdd:     PropTypes.func.isRequired,
  onDelete:  PropTypes.func.isRequired,
  maxPhotos: PropTypes.number,
  maxFileSize: PropTypes.number,
}
