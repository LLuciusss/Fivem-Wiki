'use client';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import ImageExtension from '@tiptap/extension-image';
import { Bold, Italic, Heading2, List, Quote, Image as ImageIcon } from 'lucide-react';

interface EditorProps {
  content: string;
  onChange: (richHtml: string) => void;
}

export default function RichTextEditor({ content, onChange }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      ImageExtension,
      Placeholder.configure({
        placeholder: 'Karakterinin geçmişini, çocukluğunu, kırılma noktalarını ve hikayesini buraya yaz...',
      }),
    ],
    content: content,
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-blue max-w-none focus:outline-none min-h-[220px] p-4 text-gray-200',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  const addImage = () => {
    const url = window.prompt('Görsel URL adresi girin:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    
      {/* Editor Menü Çubuğu */}
      
         editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-blue-900/50 ${editor.isActive('bold') ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
        >
          
        
         editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-blue-900/50 ${editor.isActive('italic') ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
        >
          
        
         editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-blue-900/50 ${editor.isActive('heading', { level: 2 }) ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
        >
          
        
         editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-blue-900/50 ${editor.isActive('bulletList') ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
        >
          
        
         editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-blue-900/50 ${editor.isActive('blockquote') ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
        >
          
        
        
          
        
      

      
    
  );
}