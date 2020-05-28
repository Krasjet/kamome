import CodeMirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/addon/dialog/dialog.css";
import "codemirror/keymap/vim";
// TODO make our own mode
// import "codemirror/mode/gfm/gfm";
// import "codemirror/mode/yaml-frontmatter/yaml-frontmatter";
import "codemirror/addon/dialog/dialog";
import {
  setInitPreview,
  toogleVim,
  renderPreview,
  fetchCode,
  saveDoc,
  checkSaved,
  syncScroll
} from "./handlers";

const editorTag = document.getElementById("editor");
const previewFrame = document.getElementById("preview-frame");
const renderButton = document.getElementById("menu-render");
const saveButton = document.getElementById("menu-save");
const vimCheckbox = document.getElementById("toggle-vim");
const editor = CodeMirror.fromTextArea(editorTag, {
  // TODO make our own mode
  // mode: "yaml-frontmatter",
  lineNumbers: true,
  tabSize: 2,
  lineWrapping: true,
  extraKeys: {
    Tab: cm => cm.execCommand("indentMore"), // replace tab with spaces
    "Shift-Tab": cm => cm.execCommand("indentLess"),
    "Ctrl-S": () => renderPreview(previewFrame, editor)
  }
});

// opinionated mapping, more to be added
// note to myself: this is not your vimrc
CodeMirror.Vim.map("j", "gj");
CodeMirror.Vim.map("k", "gk");

// after refresh, the checkbox is sometimes checked by default
toogleVim(vimCheckbox, editor);
fetchCode(editor);
setInitPreview(previewFrame);

// add listeners
vimCheckbox.addEventListener("click", () => toogleVim(vimCheckbox, editor));
renderButton.addEventListener("click", () =>
  renderPreview(previewFrame, editor, editor.getScrollInfo())
);
saveButton.addEventListener("click", () => saveDoc(previewFrame, editor, editor.getScrollInfo()));
editor.on("scroll", () => syncScroll(previewFrame, editor.getScrollInfo()));

window.addEventListener("beforeunload", e => checkSaved(e, editor));
