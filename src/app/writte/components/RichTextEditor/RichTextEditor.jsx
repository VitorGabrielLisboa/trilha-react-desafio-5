"use client";
import { EditorContent, useEditor } from "@tiptap/react";
import styles from "./styles.module.scss";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { computePosition, offset } from "@floating-ui/react-dom";
import Placeholder from "@tiptap/extension-placeholder";
import BulletList from "@tiptap/extension-bullet-list";
import {
  MdOutlineFormatBold,
  MdFormatItalic,
  MdFormatQuote,
  MdFormatUnderlined,
  MdStrikethroughS,
  MdCode,
  MdFormatSize,
  MdHorizontalRule,
  MdFormatListBulleted,
} from "react-icons/md";

const FloatingToolbar = ({ editor }) => {
  const [show, setShow] = useState(false);
  const [selectionRect, setSelectionRect] = useState(null);
  const floatingRef = useRef(null);

  useLayoutEffect(() => {
    if (!editor || !floatingRef.current || !selectionRect) return;

    const virtualElement = {
      getBoundingClientRect: () => ({
        ...selectionRect,
        width: selectionRect.right - selectionRect.left || 1, // Garante no mínimo 1px
        height: selectionRect.bottom - selectionRect.top || 1,
        x: selectionRect.left,
        y: selectionRect.top,
      }),
      contextElement: editor?.view?.dom,
    };

    computePosition(virtualElement, floatingRef.current, {
      placement: "top",
      middleware: [offset(2)],
    }).then(({ x, y }) => {
      console.log("Posição calculada:", { x, y }); // Adicione esta linha
      Object.assign(floatingRef.current.style, {
        left: `${x}px`,
        top: `${y}px`,
      });
    });
  }, [selectionRect, editor]);

  useLayoutEffect(() => {
    if (!editor) return;

    const updateToolbar = () => {
      const { from, to, empty } = editor.state.selection;

      if (empty) {
        setShow(false);
        setSelectionRect(null);
        return;
      }

      const rect = editor.view.coordsAtPos(from, to);
      if (rect) {
        console.log();
        setSelectionRect(rect);
        setShow(true);
      } else {
        setSelectionRect(null);
        setShow(false);
      }
    };

    editor.on("selectionUpdate", updateToolbar);
    editor.on("blur", () => setShow(false));

    return () => {
      editor.off("selectionUpdate", updateToolbar);
      editor.off("blur", () => setShow(false));
    };
  }, [editor]);

  if (
    !editor |
    {
      /*| !show |*/
    } |
    !selectionRect
  ) {
    return null;
  }

  return (
    <div className={styles.toolbar} ref={floatingRef}>
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleBold().run();
        }}
        className={`${editor.isActive("bold") ? styles.isActive : ""}`}
      >
        <MdOutlineFormatBold />
      </button>
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault;
          editor.chain().focus().toggleItalic().run();
        }}
        className={`${editor.isActive("italic") ? styles.isActive : ""}`}
      >
        <MdFormatItalic />
      </button>
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault;
          editor.chain().focus().toggleHeading({ level: 3 }).run();
        }}
        className={`${
          editor.isActive("heading", { level: 3 }) ? styles.isActive : ""
        }`}
      >
        <MdFormatSize />
      </button>
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault;
          editor.chain().focus().toggleBlockquote().run();
        }}
        className={`${editor.isActive("blockquote") ? styles.isActive : ""}`}
      >
        <MdFormatQuote />
      </button>
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleUnderline().run();
        }}
        className={`${editor.isActive("underline") ? styles.isActive : ""}`}
      >
        <MdFormatUnderlined />
      </button>
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleStrike().run();
        }}
        className={`${editor.isActive("strike") ? styles.isActive : ""}`}
      >
        <MdStrikethroughS />
      </button>
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleBulletList().run();
        }}
        className={`${editor.isActive("bulletList") ? styles.isActive : ""}`}
      >
        <MdFormatListBulleted />
      </button>

      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleCode().run();
        }}
        className={`${editor.isActive("code") ? styles.isActive : ""}`}
      >
        <MdCode />
      </button>
    </div>
  );
};

export const RichTextEditor = ({ initialContent, onContentChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      BulletList,
      Placeholder.configure({
        placeholder: "Write something …",
        emptyEditorClass: "is-empty",
      }),
    ],
    content: initialContent || "",
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      if (onContentChange) {
        onContentChange(editor.getHTML());
      }
      // console.log(editor.getHTML()); // Opcional: para ver o conteúdo mudando no console
    },
  });
  if (!editor) {
    return <div className="loading-editor">Carregando editor...</div>;
  }
  return (
    <div className={styles.richTextEditorContainer}>
      <FloatingToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};
