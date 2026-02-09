import { useState, useRef, useEffect } from "react";
import "./App.css";

interface Note {
  id: number;
  text: string;
  createdAt: string;
}

function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [noteInput, setNoteInput] = useState("");
  const [editMode, setEditMode] = useState(true);
  const clickCountersRef = useRef<Map<number, number>>(new Map());
  const editInputRef = useRef<HTMLInputElement>(null);

  const escapeHtml = (text: string): string => {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return text.replace(/[&<>"']/g, (m) => map[m] || m);
  };

  const addNote = () => {
    const text = noteInput.trim();

    if (text === "") {
      alert("テキストを入力してください");
      return;
    }

    const newNote: Note = {
      id: Date.now(),
      text: text,
      createdAt: new Date().toLocaleString("ja-JP"),
    };

    setNotes([...notes, newNote]);
    setNoteInput("");
  };

  const deleteNote = (id: number) => {
    setNotes(notes.filter((note) => note.id !== id));
    if (editingNoteId === id) {
      setEditingNoteId(null);
    }
  };

  const startEditNote = (id: number) => {
    setEditingNoteId(id);
  };

  const saveEditNote = (id: number, newText: string) => {
    const text = newText.trim();
    if (text === "") {
      alert("テキストを入力してください");
      return;
    }
    setNotes(notes.map((note) => (note.id === id ? { ...note, text } : note)));
    setEditingNoteId(null);
  };

  const cancelEdit = () => {
    setEditingNoteId(null);
  };

  const handleNoteClick = (id: number) => {
    const counters = clickCountersRef.current;
    const count = (counters.get(id) || 0) + 1;
    counters.set(id, count);

    if (count === 1 && editMode) {
      startEditNote(id);

      setTimeout(() => {
        if (counters.get(id) === 1) {
          counters.delete(id);
        }
      }, 500);
    } else if (count === 3 && !editMode) {
      counters.delete(id);
      if (confirm("この付箋を削除しますか？")) {
        deleteNote(id);
      }
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    id: number,
    value: string,
  ) => {
    if (e.key === "Enter") {
      saveEditNote(id, value);
    } else if (e.key === "Escape") {
      cancelEdit();
    }
  };

  const handleEditBlur = (id: number, value: string) => {
    saveEditNote(id, value);
  };

  useEffect(() => {
    if (editingNoteId !== null && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingNoteId]);

  return (
    <div className="container">
      <h1>付箋アプリ</h1>

      <div className="controls">
        <div className="add_field">
          <input
            type="text"
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                addNote();
              }
            }}
            placeholder="付箋のテキストを入力..."
            className="note-input"
          />
          <button onClick={addNote} className="add-btn">
            追加
          </button>
        </div>

        <div className="mode-select">
          <button
            className={`stateBtn ${editMode ? "active" : ""}`}
            onClick={() => setEditMode(true)}
            style={{
              backgroundColor: editMode ? "#283593" : "#9f9f9f",
            }}
          >
            編集
          </button>
          <button
            className={`stateBtn ${!editMode ? "active" : ""}`}
            onClick={() => setEditMode(false)}
            style={{
              backgroundColor: !editMode ? "#283593" : "#9f9f9f",
            }}
          >
            削除
          </button>
          <p className="mode-desc">モード選択</p>
        </div>
      </div>

      <div className="notes-board">
        {notes.map((note) => (
          <div
            key={note.id}
            className="note"
            onClick={() => handleNoteClick(note.id)}
          >
            {editingNoteId === note.id ? (
              <>
                <input
                  ref={editInputRef}
                  type="text"
                  className="note-edit-input"
                  defaultValue={note.text}
                  onKeyDown={(e) =>
                    handleKeyDown(e, note.id, e.currentTarget.value)
                  }
                  onBlur={(e) => handleEditBlur(note.id, e.currentTarget.value)}
                />
                <div className="note-edit-actions">
                  <button
                    className="note-cancel"
                    onClick={(e) => {
                      e.stopPropagation();
                      cancelEdit();
                    }}
                  >
                    キャンセル
                  </button>
                  <button
                    className="note-save"
                    onClick={(e) => {
                      e.stopPropagation();
                      const input = editInputRef.current;
                      if (input) {
                        saveEditNote(note.id, input.value);
                      }
                    }}
                  >
                    保存
                  </button>
                </div>
              </>
            ) : (
              <div
                className="note-content"
                title="クリックして編集\n3回クリックで削除"
                dangerouslySetInnerHTML={{ __html: escapeHtml(note.text) }}
                style={{ cursor: "text" }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
