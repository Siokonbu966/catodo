// 付箋データの管理
let notes = [];

/**
 * @param {string} currentMode - 現在のモード(edit ||delete)
 */
let currentMode = "edit";

// DOM要素の取得
const noteInput = document.getElementById("noteInput");
/**
 * @description 追加ボタンボタンのトリガー
 * @param {HTMLElement} addBtn - button trigger
 */
const addBtn = document.getElementById("addBtn");
const notesBoard = document.getElementById("notesBoard");

// 付箋を追加する関数
function addNote() {
  const text = noteInput.value.trim();

  // テキストが空でないかチェック
  if (text === "") {
    alert("テキストを入力してください");
    return;
  }

  // 新しい付箋オブジェクトを作成
  const note = {
    id: Date.now(), // 一意のIDを生成
    text: text,
    createdAt: new Date().toLocaleString("ja-JP"),
  };

  notes.push(note);
  renderNotes();
  noteInput.value = ""; // 入力フィールドをクリア
  noteInput.focus(); // フォーカスをもどす
}

// 付箋を削除する関数
function deleteNote(id) {
  notes = notes.filter((note) => note.id !== id);
  renderNotes();
}

// すべての付箋をレンダリングする関数
function renderNotes() {
  // 既存のDOMをクリア
  notesBoard.innerHTML = "";

  // 各付箋をDOMに追加
  notes.forEach((note) => {
    const noteElement = document.createElement("div");
    noteElement.className = "note";

    noteElement.innerHTML = `
            <div class="note-content">${escapeHtml(note.text)}</div>
            <button class="note-delete" onclick="deleteNote(${note.id})">削除</button>
        `;

    notesBoard.appendChild(noteElement);
  });
}

// HTMLエスケープ関数（セキュリティ対策）
function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// イベントリスナーの設定
addBtn.addEventListener("click", addNote);
noteInput.addEventListener("keypress", (e) => {
  // Enterキーで付箋を追加
  if (e.key === "Enter") {
    addNote();
  }
});

// 初期化
renderNotes();
