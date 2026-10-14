// ==================== CLOUDINARY CONFIGURATION ====================
// Configuración para subir imágenes a Cloudinary
// Ya configurado en tu proyecto FenixLab

export const CLOUDINARY_CONFIG = {
  // Configuración de Cloudinary (mismo que Archive of Creations)
  cloudName: 'dkci24erg',
  uploadPreset: 'fenixlab_guestbook', // Preset específico para guestbook
  
  // Endpoint de la API
  apiUrl: 'https://api.cloudinary.com/v1_1/dkci24erg/image/upload',
  
  // Límites de Cloudinary (plan gratuito)
  limits: {
    maxImageSize: 10 * 1024 * 1024, // 10MB
    monthlyCredits: 25, // 25GB bandwidth + storage
    transformations: 25000 // 25k transformaciones/mes
  }
};

// Función helper para subir imagen a Cloudinary
export async function uploadToCloudinary(imageFile) {
  const formData = new FormData();
  formData.append('file', imageFile);
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
  formData.append('folder', 'guestbook/comments'); // Organizar en carpetas
  
  try {
    const response = await fetch(CLOUDINARY_CONFIG.apiUrl, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Cloudinary API error: ${error.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    return {
      success: true,
      url: data.secure_url, // URL HTTPS
      publicId: data.public_id, // Para borrar la imagen si es necesario
      format: data.format,
      width: data.width,
      height: data.height,
      bytes: data.bytes
    };
  } catch (error) {
    console.error('[Cloudinary] Error subiendo imagen:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
