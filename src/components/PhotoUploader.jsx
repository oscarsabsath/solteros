import { useRef } from 'react';

export default function PhotoUploader({ photos = [], onPhotosChange, maxPhotos = 6 }) {
  const fileInputRef = useRef(null);
  const activeSlotIndex = useRef(null);

  const handleSlotClick = (index) => {
    activeSlotIndex.current = index;
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen (JPG, PNG o WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target.result;
      const targetIndex = activeSlotIndex.current;
      const newPhotos = [...photos];

      if (targetIndex !== null && targetIndex < newPhotos.length) {
        newPhotos[targetIndex] = base64Url;
      } else {
        newPhotos.push(base64Url);
      }

      onPhotosChange(newPhotos.slice(0, maxPhotos));
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = (index, e) => {
    e.stopPropagation();
    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);
  };

  // 6 slots estilo Badoo (Slot 0 es el principal)
  const slots = Array.from({ length: maxPhotos }, (_, index) => {
    const photoUrl = photos[index] || null;
    return { index, photoUrl };
  });

  return (
    <div className="badoo-uploader-container">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
      />

      <div className="badoo-grid-header">
        <h4>Tus Fotos</h4>
        <span className="badoo-photos-count">
          {photos.length} de {maxPhotos} añadidas
        </span>
      </div>

      <p className="badoo-hint">
        ⭐ La primera foto será tu foto principal visible en la comunidad.
      </p>

      <div className="badoo-photo-grid">
        {slots.map(({ index, photoUrl }) => {
          const isMain = index === 0;
          return (
            <div
              key={index}
              className={`badoo-photo-slot ${isMain ? 'slot-main' : ''} ${photoUrl ? 'has-photo' : 'is-empty'}`}
              onClick={() => handleSlotClick(index)}
            >
              {photoUrl ? (
                <>
                  <img src={photoUrl} alt={`Foto ${index + 1}`} className="slot-img" />
                  {isMain && <span className="slot-badge-main">★ Principal</span>}
                  <button
                    type="button"
                    className="slot-remove-btn"
                    onClick={(e) => handleRemovePhoto(index, e)}
                    title="Eliminar foto"
                  >
                    ✕
                  </button>
                </>
              ) : (
                <div className="slot-placeholder">
                  <div className="slot-add-icon">+</div>
                  <span className="slot-add-text">
                    {isMain ? 'Foto Principal' : 'Añadir foto'}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="badoo-tip-box">
        💡 <strong>Consejo:</strong> En una comunidad con propósito, las fotos nítidas con sonrisa natural y donde se te vea bien generan 3 veces más confianza.
      </div>
    </div>
  );
}
