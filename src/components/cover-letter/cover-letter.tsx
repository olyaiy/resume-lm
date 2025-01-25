'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect } from 'react'

function CoverLetter() {
  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>Start writing your cover letter...</p>',
    editorProps: {
        attributes: {
          class: 'prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl p-8 focus:outline-none  h-full bg-green-500 overflow-hidden',
        },
      },
    
  })

  // Cleanup editor on unmount
  useEffect(() => {
    return () => {
      editor?.destroy()
    }
  }, [editor])

  return (
    <div className="relative w-full max-w-[816px] mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      <div 
        className="relative pb-[129.41%]" // 11/8.5 = 1.2941
        style={{ aspectRatio: '8.5 / 11' }}
      >
        <div className="absolute inset-0 p-8">
          <EditorContent 
            editor={editor} 
            className="h-full focus:outline-none prose prose-sm max-w-none"
          />
        </div>
      </div>
    </div>
  )
}

export default CoverLetter