export { toogleVim, renderPreview, fetchCode };

import { getDocId } from "./utils";

// toogle editor's vim mode
function toogleVim(checkbox, editor) {
  if (checkbox.checked) {
    editor.setOption("keyMap", "vim");
  } else {
    editor.setOption("keyMap", "default");
  }
}

// render the preview frame
function renderPreview(previewFrame, editor) {
  // use the access code from storage first
  let accessCode = sessionStorage["accessCode"];
  if (!accessCode) accessCode = prompt("Access code (will be saved, probably for a while):");

  let preview = previewFrame.contentDocument;

  let reqBody = {
    docId: getDocId(),
    markdown: editor.getValue(),
    accessCode: accessCode
  };
  fetch(process.env.KARASU_SERVER + "/api/preview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reqBody)
  })
    .then(res => res.text())
    .then(html => {
      preview.open();
      preview.write(html);
      preview.close();
      sessionStorage["accessCode"] = accessCode;
    })
    .catch(e => {
      preview.open();
      preview.write("Something went wrong. Try again.\n\n" + e);
      preview.close();
      // prompt again next time
      sessionStorage.removeItem("accessCode");
    });
}

// fetch code from url
function fetchCode(editor) {
  fetch(process.env.KARASU_SERVER + "/api/get/" + getDocId())
    .then(res => res.json())
    .then(data => {
      editor.setValue(data.markdown);
      // global variable to keep track of the version
      window.docVersion = data.version;
      editor.markClean();
    })
    .catch(e => {
      editor.setValue("# Error obtaining the document\n\n" + e);
    });
}
