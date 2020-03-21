// I hate JavaScript
export { toogleVim, renderPreview, fetchCode, setInitPreview, saveDoc, checkSaved};

import {
  getDocId,
  isCleanSince,
  markClean,
  askAccessCode,
  saveAccessCode,
  clearAccessCode,
  appendCodeToBody,
  setStatus,
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
  let accessCode = askAccessCode();
  // clicked cancel
  if (accessCode === null) {
    return;
  }

  // do not render if nothing has been changed yet
  if (isCleanSince(editor, window.lastRender)) {
    return;
  }
  let reqBody = {
    docId: getDocId(),
    markdown: editor.getValue()
  };
  appendCodeToBody(reqBody, accessCode);

  setStatus("rendering");
  fetch(window.location.origin + "/api/preview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reqBody)
  })
    .then(res => {
      if (!res.ok) {
        clearAccessCode();
        setStatus("no access");
        res.text().then(text => setPreviewContent(previewFrame, text));
      } else {
        res.text().then(html => {
          setPreviewContent(previewFrame, html);
          saveAccessCode(accessCode);
          window.lastRender = markClean(editor);
          setStatus("done");
        });
      }
    })
    .catch(e => {
      setStatus("error");
      setPreviewContent(previewFrame, "Something went wrong. Try again.\n\n" + e);
      // prompt again next time
      clearAccessCode();
    });
}

// fetch code from url
function fetchCode(editor) {
  fetch(window.location.origin + "/api/get/" + getDocId(), {
    cache: "no-store" // do not cache result
  })
    .then(res => res.json())
    .then(data => {
      editor.setValue(data.markdown);
      // global variable to keep track of the version
      window.docVersion = data.version;
      setStatus("loaded ver " + data.version);
    })
    .catch(e => {
      editor.setValue("# Error obtaining the document\n\n" + e);
      setStatus("error");
    });
  window.lastSave = markClean(editor);
}

// write to preview frame
function setPreviewContent(previewFrame, content) {
  let previewContent = previewFrame.contentDocument;
  previewContent.open();
  previewContent.write(content);
  previewContent.close();
}

// fetch the initial preview
function setInitPreview(previewFrame) {
  fetch(window.location.origin + "/view/" + getDocId(), {
    cache: "no-store" // do not cache result
  })
    .then(res => res.text())
    .then(html => {
      setPreviewContent(previewFrame, html);
    })
    .catch(e => {
      setPreviewContent(previewFrame, "Error retreiving the preview\n\n" + e);
      setStatus("error");
    });
  // previewFrame.src = window.location.origin + "/view/" + getDocId();
}

// save the document the preview frame
function saveDoc(previewFrame, editor) {
  let accessCode = askAccessCode();
  // clicked cancel
  if (accessCode === null) {
    return;
  }

  // do not save if nothing has been changed yet
  if (isCleanSince(editor, window.lastSave)) {
    return;
  }

  let reqBody = {
    docId: getDocId(),
    markdown: editor.getValue(),
    version: window.docVersion
  };
  appendCodeToBody(reqBody, accessCode);

  setStatus("saving");
  fetch(window.location.origin + "/api/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reqBody)
  })
    .then(res => {
      // no access
      if (res.statusCode == 403) {
        setStatus("no access");
        clearAccessCode();
      }
      if (res.statusCode == 409) {
        setStatus("conflict");
      }
      if (!res.ok) {
        res.text().then(text => setPreviewContent(previewFrame, text));
      } else {
        res.json().then(data => {
          setPreviewContent(previewFrame, data.html);
          window.docVersion = data.newVersion;
          setStatus("saved ver" + data.newVersion);
          saveAccessCode(accessCode);
          window.lastSave = markClean(editor);
        });
      }
    })
    .catch(e => {
      setPreviewContent(previewFrame, "Something went wrong. Try again.\n\n" + e);
      setStatus("error");
      // prompt again next time
      clearAccessCode();
    });
}

// check saved status, warn before unload window
function checkSaved(e, editor) {
  // just in case
  sessionStorage["docBackup"] = editor.getValue();
  if (!isCleanSince(editor, window.lastSave)) {
    e.preventDefault();
    let msg = "Document not saved.";
    e.returnValue = msg;
    return msg;
  }
}
