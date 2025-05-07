// src/hooks/usePhotos.js
import { useState, useEffect } from 'react';
import axios from 'axios';

export function usePhotos(propertyId) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/api/properties/${propertyId}/photos`)
      .then(res => setPhotos(res.data))
      .finally(() => setLoading(false));
  }, [propertyId]);

  const addPhoto = (file, caption) => {
    const form = new FormData();
    form.append('photo', file);
    form.append('caption', caption);
    // Ne pas préciser manuellement Content-Type, Axios s’en charge
    return axios
      .post(`/api/properties/${propertyId}/photos`, form)
      .then(res => setPhotos(ps => [...ps, res.data]));
  };

  const deletePhoto = id => {
    return axios
      .delete(`/api/properties/photos/${id}`)
      .then(() => setPhotos(ps => ps.filter(p => p.id !== id)));
  };

  return { photos, loading, addPhoto, deletePhoto };
}
