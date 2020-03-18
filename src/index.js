import CodeMirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/addon/dialog/dialog.css";
import "codemirror/keymap/vim";
import "codemirror/mode/gfm/gfm";
import "codemirror/mode/yaml-frontmatter/yaml-frontmatter";
import "codemirror/addon/dialog/dialog";
import { setInitPreview, toogleVim, renderPreview, fetchCode } from "./handlers";

const editorTag = document.getElementById("editor");
const previewFrame = document.getElementById("preview-frame");
const renderButton = document.getElementById("menu-render");
const saveButton = document.getElementById("menu-save");
const vimCheckbox = document.getElementById("toggle-vim");
const editor = CodeMirror.fromTextArea(editorTag, {
  mode: "yaml-frontmatter",
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
setInitPreview(previewFrame);

// add listeners
vimCheckbox.addEventListener("click", () => toogleVim(vimCheckbox, editor));
renderButton.addEventListener("click", () => renderPreview(previewFrame, editor));
