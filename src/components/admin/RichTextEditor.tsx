'use client';

import { useEffect, useRef } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Table as TableIcon,
  Rows3,
  Columns3,
  Square,
  Trash2,
} from 'lucide-react';
import styles from './RichTextEditor.module.css';

const BorderAwareTable = Table.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      borderless: {
        default: false,
        parseHTML: element => element.getAttribute('data-borderless') === 'true',
        renderHTML: attributes => attributes.borderless ? { 'data-borderless': 'true' } : {},
      },
    };
  },
});

const extensions = [
  StarterKit,
  Underline,
  BorderAwareTable.configure({ resizable: true }),
  TableRow,
  TableHeader,
  TableCell,
];

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  minHeight?: number;
}

export default function RichTextEditor({ value, onChange, ariaLabel, minHeight = 150 }: RichTextEditorProps) {
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const editor = useEditor({
    extensions,
    content: value || '<p></p>',
    immediatelyRender: false,
    onUpdate: ({ editor: updatedEditor }) => onChangeRef.current(updatedEditor.getHTML()),
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== (value || '<p></p>')) {
      editor.commands.setContent(value || '<p></p>', { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) {
    return <div className={styles.loading} style={{ minHeight }} aria-label={ariaLabel} />;
  }

  const inTable = editor.isActive('table');
  const borderless = Boolean(editor.getAttributes('table').borderless);

  return (
    <div className={styles.editor}>
      <div className={styles.toolbar} role="toolbar" aria-label={`${ariaLabel} formatting`}>
        <button type="button" className={editor.isActive('bold') ? styles.activeTool : styles.tool} title="Bold" aria-label="Bold" aria-pressed={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={16} /></button>
        <button type="button" className={editor.isActive('italic') ? styles.activeTool : styles.tool} title="Italic" aria-label="Italic" aria-pressed={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={16} /></button>
        <button type="button" className={editor.isActive('underline') ? styles.activeTool : styles.tool} title="Underline" aria-label="Underline" aria-pressed={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}><UnderlineIcon size={16} /></button>
        <span className={styles.separator} />
        <button type="button" className={editor.isActive('bulletList') ? styles.activeTool : styles.tool} title="Bullet list" aria-label="Bullet list" aria-pressed={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}><List size={16} /></button>
        <button type="button" className={editor.isActive('orderedList') ? styles.activeTool : styles.tool} title="Numbered list" aria-label="Numbered list" aria-pressed={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered size={16} /></button>
        <span className={styles.separator} />
        <button type="button" className={styles.tool} title="Insert 3 × 3 table" aria-label="Insert table" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}><TableIcon size={16} /></button>
        <button type="button" className={styles.tool} title="Add row below" aria-label="Add row below" disabled={!inTable} onClick={() => editor.chain().focus().addRowAfter().run()}><Rows3 size={16} /></button>
        <button type="button" className={styles.tool} title="Add column right" aria-label="Add column right" disabled={!inTable} onClick={() => editor.chain().focus().addColumnAfter().run()}><Columns3 size={16} /></button>
        <button type="button" className={borderless ? styles.activeTool : styles.tool} title={borderless ? 'Show table borders' : 'Hide table borders'} aria-label={borderless ? 'Show table borders' : 'Hide table borders'} aria-pressed={borderless} disabled={!inTable} onClick={() => editor.chain().focus().updateAttributes('table', { borderless: !borderless }).run()}><Square size={16} /></button>
        <button type="button" className={styles.tool} title="Remove table" aria-label="Remove table" disabled={!inTable} onClick={() => editor.chain().focus().deleteTable().run()}><Trash2 size={16} /></button>
      </div>
      <EditorContent editor={editor} className={styles.content} style={{ minHeight }} aria-label={ariaLabel} />
    </div>
  );
}