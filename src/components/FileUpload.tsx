'use client';
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Upload, Loader2, CheckCircle } from 'lucide-react';

interface FileUploadProps {
  bucket?: string;
  accept?: string;
  onUploadSuccess: (url: string) => void;
  label: string;
}

export default function FileUpload({
  bucket = 'wiki-media',
  accept = 'image/*',
  onUploadSuccess,
  label
}: FileUploadProps) {
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
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      onUploadSuccess(data.publicUrl);
      setSuccess(true);
    } catch (error: any) {
      alert('Yükleme hatası: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    
      {label}
      
        {uploading ? (
          
        ) : success ? (
          
        ) : (
          
        )}
        
          {uploading ? 'Yükleniyor...' : success ? 'Yüklendi!' : 'Dosya Seç veya Sürükle'}
        
        
      
    
  );
}