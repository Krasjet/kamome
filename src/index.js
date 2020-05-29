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
const isMac = CodeMirror.keyMap["default"] == CodeMirror.keyMap.macDefault;

const editor = CodeMirror.fromTextArea(editorTag, {
  // TODO make our own mode
  // mode: "yaml-frontmatter",
  lineNumbers: true,
  tabSize: 2,
  lineWrapping: true,
  extraKeys: {
    Tab: cm => cm.execCommand("indentMore"), // replace tab with spaces
    "Shift-Tab": cm => cm.execCommand("indentLess"),
    "Ctrl-S": () => renderPreview(previewFrame, editor),
    "Ctrl-C": cm => {
      // use ctrl-c to copy in insert mode of vim
      // ref: https://github.com/hackmdio/codimd/commit/f49fc192f64a7fb86baa8eae5717ea87de43c8e5
      if (!isMac && cm.getOption("keyMap").substr(0, 3) === "vim") {
        document.execCommand("copy");
      } else {
        return CodeMirror.Pass;
      }
    }
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

// warn unsaved changed before unload
window.addEventListener("beforeunload", e => checkSaved(e, editor));
