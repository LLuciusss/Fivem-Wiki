'use client';
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function FileUpload({ onUploadComplete, label = "Dosya Yükle" }: { onUploadComplete: (url: string) => void, label?: string }) {
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setSuccess(false);

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage.from('images').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('images').getPublicUrl(filePath);
      onUploadComplete(data.publicUrl);
      setSuccess(true);
    } catch (error) {
      console.error('Yükleme hatası:', error);
      alert('Dosya yüklenirken bir hata oluştu.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-white">{label}</label>
      <div className="flex items-center gap-4">
        <input 
          type="file" 
          onChange={handleFileChange} 
          disabled={uploading}
          className="w-full bg-black/50 border border-blue-900 rounded-lg p-3 text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
        />
      </div>
      <div className="text-xs text-gray-400">
        {uploading ? (
          <span>Yükleniyor...</span>
        ) : success ? (
          <span className="text-green-400">Yükleme başarılı!</span>
        ) : (
          <span>Dosya seçin</span>
        )}
      </div>
    </div>
  );
}