import CodeMirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/addon/dialog/dialog.css";
import "codemirror/keymap/vim";
import "codemirror/mode/markdown/markdown";
import "codemirror/addon/dialog/dialog";
import { toogleVim, renderPreview, fetchCode } from "./handlers";

const editorTag = document.getElementById("editor");
const previewFrame = document.getElementById("preview-frame");
const renderButton = document.getElementById("menu-render");
const saveButton = document.getElementById("menu-save");
const vimCheckbox = document.getElementById("toggle-vim");
const editor = CodeMirror.fromTextArea(editorTag, {
  mode: "markdown",
  lineNumbers: true,
  tabSize: 2,
  lineWrapping: true,
  extraKeys: {
    Tab: cm => cm.execCommand("indentMore"), // replace tab with spaces
    "Shift-Tab": cm => cm.execCommand("indentLess")
  }
});

// opinionated mapping, more to be added
// note to myself: this is not your vimrc
CodeMirror.Vim.map("j", "gj");
CodeMirror.Vim.map("k", "gk");

// after refresh, the checkbox is sometimes checked by default
toogleVim(vimCheckbox, editor);
fetchCode(editor);

// add listeners
vimCheckbox.addEventListener("click", () => toogleVim(vimCheckbox, editor));
renderButton.addEventListener("click", () => renderPreview(previewFrame, editor));
