import { useState, useRef, useEffect } from "react";
import "./App.css";

interface Note {
  id: number;
  text: string;
  createdAt: string;
  crackCount: number;
  crackPhase: number;
}

interface Footprint {
  id: string;
  x: number;
  y: number;
  feet: string;
}

interface PunchEffect {
  id: string;
  noteId: number;
  x: number;
  y: number;
}

function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [noteInput, setNoteInput] = useState("");
  const [editMode, setEditMode] = useState(true);
  const [footprints, setFootprints] = useState<Footprint[]>([]);
  const [punchEffects, setPunchEffects] = useState<PunchEffect[]>([]);
  const clickCountersRef = useRef<Map<number, number>>(new Map());
  const editInputRef = useRef<HTMLInputElement>(null);
  let phase = 0;

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
      crackCount: 0,
      crackPhase: 0,
    };

    setNotes([...notes, newNote]);
    setNoteInput("");
  };

  const deleteNote = (id: number) => {
    setNotes(notes.filter((note) => note.id !== id));
    setPunchEffects((prev) => prev.filter((effect) => effect.noteId !== id));
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

  const handleNoteClick = (e: React.MouseEvent, id: number) => {
    handleFootPrint(e);

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
    } else if (!editMode) {

      if (count <= 3) {
        const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
        const effectId = `${Date.now()}-${Math.random()}`;
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setPunchEffects((prev) => [
          ...prev,
          {
            id: effectId,
            noteId: id,
            x,
            y,
          },
        ]);

        if (count === 1) {
          setNotes(notes.map((note) =>
            note.id === id ? { ...note, crackCount: count, crackPhase: 0 } : note
          ));

          // アニメーション開始：3フェーズ表示
          const animationInterval = setInterval(() => {
            if (counters.get(id) !== 1) {
              clearInterval(animationInterval);
              return;
            }
            phase++;
            if (phase <= 2) {
              setNotes((prevNotes) =>
                prevNotes.map((note) =>
                  note.id === id ? { ...note, crackPhase: phase } : note
                )
              );
            } else {
              clearInterval(animationInterval);
            }
          }, 150);
        } else {
          setNotes(notes.map((note) =>
            note.id === id ? { ...note, crackCount: count, crackPhase: 3 } : note
          ));
        }
      }

      if (count === 3) {
        counters.delete(id);
        setTimeout(() => {
          deleteNote(id);
        }, 300);
      }
    }
  };

  const handleFootPrint = (e: React.MouseEvent) => {
    if (!editMode) {
      const feetImages = ["feet_1.png", "feet_2.png", "feet_3.png", "feet_4.png", "feet_5.png"];
      const randomFeet = feetImages[Math.floor(Math.random() * feetImages.length)];

      const footprint: Footprint = {
        id: `${Date.now()}-${Math.random()}`,
        x: e.clientX,
        y: e.clientY,
        feet: randomFeet,
      };

      setFootprints(prev => [...prev, footprint]);

      setTimeout(() => {
        setFootprints(prev => prev.filter(f => f.id !== footprint.id));
      }, 2000);
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
    <div className="container" onClick={handleFootPrint}>
      <h1>catodo</h1>

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

      <div className="notes-board" onClick={handleFootPrint}>
        {footprints.map((footprint) => (
          <div
            key={footprint.id}
            className="footprint"
            style={{
              left: `${footprint.x}px`,
              top: `${footprint.y}px`,
              backgroundImage: `url(/cat/${footprint.feet})`,
            }}
          />
        ))}
        {notes.map((note) => (
          <div
            key={note.id}
            className="note"
            onClick={(e) => {
              e.stopPropagation();
              handleNoteClick(e, note.id);
            }}
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
              <div style={{ position: "relative" }}>
                <div
                  className="note-content"
                  title="クリックして編集\n3回クリックで削除"
                  dangerouslySetInnerHTML={{ __html: escapeHtml(note.text) }}
                  style={{ cursor: "text" }}
                />
                {punchEffects
                  .filter((effect) => effect.noteId === note.id)
                  .map((effect) => (
                    <video
                      key={effect.id}
                      className="punch-effect"
                      src="/effect/パンチエフェクトグレー.mp4"
                      autoPlay
                      muted
                      playsInline
                      preload="auto"
                      onEnded={() =>
                        setPunchEffects((prev) =>
                          prev.filter((item) => item.id !== effect.id)
                        )
                      }
                      style={{ left: effect.x, top: effect.y }}
                    />
                  ))}
                {note.crackCount > 0 && (
                  <div className="crack-container">
                    {note.crackPhase >= 1 && (
                      <img
                        src="/break/crack_1.png"
                        alt="crack"
                        className="crack-overlay"
                      />
                    )}
                    {note.crackPhase >= 2 && (
                      <img
                        src="/break/crack_2.png"
                        alt="crack"
                        className="crack-overlay"
                      />
                    )}
                    {note.crackPhase >= 3 && (
                      <img
                        src="/break/crack_3.png"
                        alt="crack"
                        className="crack-overlay"
                      />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
