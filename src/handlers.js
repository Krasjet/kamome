// I hate JavaScript
export { toogleVim, renderPreview, fetchCode, setInitPreview, saveDoc };

import {
  getDocId,
  isCleanSince,
  markClean,
  askAccessCode,
  saveAccessCode,
  clearAccessCode,
  appendCodeToBody
} from "./utils";

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
  if (isCleanSince(editor, window.lastRender)) {
    return;
  }

  let accessCode = askAccessCode();
  let preview = previewFrame.contentDocument;

  let reqBody = {
    docId: getDocId(),
    markdown: editor.getValue()
  };
  appendCodeToBody(reqBody, accessCode);

  fetch(process.env.KARASU_SERVER + "/api/preview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reqBody)
  })
    .then(res => {
      if (!res.ok) {
        clearAccessCode();
      }
      return res.text();
    })
    .then(html => {
      setPreviewContent(preview, html);
      saveAccessCode(accessCode);
      window.lastRender = markClean(editor);
    })
    .catch(e => {
      setPreviewContent(preview, "Something went wrong. Try again.\n\n" + e);
      // prompt again next time
      clearAccessCode();
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
      console.log("doc version: " + data.version);
    })
    .catch(e => {
      editor.setValue("# Error obtaining the document\n\n" + e);
    });
  window.lastChanged = markClean(editor);
}

// write to preview frame
function setPreviewContent(previewContent, content) {
  previewContent.open();
  previewContent.write(content);
  previewContent.close();
}

// fetch the initial preview
function setInitPreview(previewFrame) {
  previewFrame.src = process.env.KARASU_SERVER + "/view/" + getDocId();
}

// save the document the preview frame
function saveDoc(previewFrame, editor) {
  // do not save if nothing has been changed yet
  if (isCleanSince(editor, window.lastSave)) {
    return;
  }

  let accessCode = askAccessCode();
  let preview = previewFrame.contentDocument;

  let reqBody = {
    docId: getDocId(),
    markdown: editor.getValue(),
    version: window.docVersion
  };
  appendCodeToBody(reqBody, accessCode);

  fetch(process.env.KARASU_SERVER + "/api/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reqBody)
  })
    .then(res => {
      if (res.statusCode == 403) {
        clearAccessCode();
      }
      if (!res.ok) {
        res.text().then(text => setPreviewContent(preview, text));
      } else {
        return res.json();
      }
    })
    .then(data => {
      setPreviewContent(preview, data.html);
      window.docVersion = data.newVersion;
      console.log("doc version: " + data.newVersion);
      saveAccessCode(accessCode);
      window.lastSave = markClean(editor);
    })
    .catch(e => {
      setPreviewContent(preview, "Something went wrong. Try again.\n\n" + e);
      // prompt again next time
      clearAccessCode();
    });
}
