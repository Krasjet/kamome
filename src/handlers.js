// I hate JavaScript
export { toogleVim, renderPreview, fetchCode, setInitPreview };

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
  // do not render if nothing has been changed yet
  if (window.lastRender !== undefined && editor.isClean(window.lastRender)) {
    return;
  }

  // use the access code from storage first
  let accessCode = sessionStorage["accessCode"];
  // only ask if storage is empty
  if (accessCode === undefined)
    accessCode = prompt("Access code (will be saved, probably for a while):");

  let preview = previewFrame.contentDocument;

  let reqBody = {
    docId: getDocId(),
    markdown: editor.getValue()
  };
  if (accessCode !== "")
    // only send the access code if it's not empty
    reqBody.accessCode = accessCode;

  fetch(process.env.KARASU_SERVER + "/api/preview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reqBody)
  })
    .then(res => {
      if (!res.ok) {
        sessionStorage.removeItem("accessCode");
      }
      return res.text();
    })
    .then(html => {
      setPreviewContent(preview, html);
      sessionStorage["accessCode"] = accessCode;
      window.lastRender = editor.changeGeneration(true);
    })
    .catch(e => {
      setPreviewContent(preview, "Something went wrong. Try again.\n\n" + e);
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
    })
    .catch(e => {
      editor.setValue("# Error obtaining the document\n\n" + e);
    });
  window.lastChanged = editor.changeGeneration(true);
}

function setPreviewContent(previewContent, content) {
  previewContent.open();
  previewContent.write(content);
  previewContent.close();
}

function setInitPreview(previewFrame) {
  previewFrame.src = process.env.KARASU_SERVER + "/view/" + getDocId();
}
