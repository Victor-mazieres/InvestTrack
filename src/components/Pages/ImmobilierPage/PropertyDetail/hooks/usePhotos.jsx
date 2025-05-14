import { useState, useEffect } from 'react';
import api from '../../../../../api/index';

export function usePhotos(propertyId) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    api.get(`/properties/${propertyId}/photos`)
      .then(res => {
        setPhotos(res.data);
      })
      .catch(err => {
        console.error('Error fetching photos:', err);
        if (err.response?.status === 403) {
          setError("Accès refusé : vous n'avez pas les droits pour voir ces photos.");
        } else {
          setError("Erreur lors du chargement des photos.");
        }
      })
      .finally(() => setLoading(false));
  }, [propertyId]);

  const addPhoto = (file, caption) => {
    const form = new FormData();
    form.append('photo', file);
    form.append('caption', caption);
    return api
      .post(`/properties/${propertyId}/photos`, form)
      .then(res => setPhotos(ps => [...ps, res.data]))
      .catch(err => {
        console.error('Error adding photo:', err);
        throw err;
      });
  };

  const deletePhoto = id => {
    return api
      .delete(`/properties/${propertyId}/photos/${id}`)
      .then(() => setPhotos(ps => ps.filter(p => p.id !== id)))
      .catch(err => {
        console.error('Error deleting photo:', err);
        throw err;
      });
  };

  return { photos, loading, error, addPhoto, deletePhoto };
}
