import { useState } from 'react';

const CLOUDINARY_CLOUD_NAME = 'dyjgtjc4l';
const CLOUDINARY_UPLOAD_PRESET = 'studyportal_unsigned';

export const useCloudinaryUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File): Promise<string> => {
    setIsUploading(true);
    setProgress(0);
    setError(null);

    return new Promise((resolve, reject) => {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      
      // Phân loại: PDF, DOC, ZIP... sẽ là 'raw' - Hình ảnh sẽ là 'image'
      let resourceType = 'auto';
      if (['pdf', 'docx', 'doc', 'xls', 'xlsx', 'ppt', 'pptx', 'zip', 'rar', 'txt'].includes(ext)) {
        resourceType = 'raw';
      } else if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext)) {
        resourceType = 'image';
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      // TODO: Điều chỉnh folder đích trên Cloudinary nếu cần
      formData.append('folder', `cvision_ai_uploads`); 

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`);

      // Lắng nghe sự kiện để cập nhật thanh tiến trình (Progress Bar)
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          setProgress(pct);
        }
      };

      xhr.onload = () => {
        try {
          const data = JSON.parse(xhr.responseText);
          if (xhr.status === 200 && data.secure_url) {
            setProgress(100);
            resolve(data.secure_url);
          } else {
            const errMsg = data.error?.message || `Lỗi tải lên (${xhr.status})`;
            setError(errMsg);
            reject(new Error(errMsg));
          }
        } catch {
          setError('Phản hồi từ server không hợp lệ');
          reject(new Error('Phản hồi từ server không hợp lệ'));
        } finally {
          setIsUploading(false);
        }
      };

      xhr.onerror = () => {
        setError('Lỗi kết nối mạng');
        setIsUploading(false);
        reject(new Error('Lỗi kết nối mạng'));
      };

      xhr.send(formData);
    });
  };

  return { uploadFile, isUploading, progress, error };
};
