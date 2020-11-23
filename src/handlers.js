export {
  // Editor
  toogleVim,
  syncScroll,
  // Preview
  fetchCode,
  setInitPreview,
  // Rendering
  renderPreview,
  saveDoc,
  // Warning
  checkSaved
};

import {
  getDocId,
  isCleanSince,
  markClean,
  askAccessCode,
  saveAccessCode,
  clearAccessCode,
  appendCodeToBody,
  setStatus
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
async function renderPreview(previewFrame, editor) {
  let accessCode = askAccessCode();
  // clicked cancel
  if (accessCode === null) {
    return;
  }

  // do not render if nothing has been changed yet
  if (isCleanSince(editor, window.lastRender)) {
    return;
  }

  // now send request to preview server
  let reqBody = {
    docId: getDocId(),
    markdown: editor.getValue()
  };
  appendCodeToBody(reqBody, accessCode);

  setStatus("rendering");
  try {
    // fetch the preview from server
    let res = await fetch(window.location.origin + "/api/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reqBody)
    });

    if (res.ok) {
      let html = await res.text();

      // 1. update preview
      setPreviewContent(previewFrame, html);

      // 2. save access code
      saveAccessCode(accessCode);

      // 3. mark editor as clean
      window.lastRender = markClean(editor);

      // 4. sync scroll
      syncScroll(previewFrame, editor.getScrollInfo());

      setStatus("done");
    } else {
      // No access
      setStatus("no access");
      clearAccessCode();
      res.text().then(text => setPreviewContent(previewFrame, text));
    }
  } catch (e) {
    setStatus("error");
    setPreviewContent(previewFrame, "Something went wrong. Try again.\n\n" + e);
    // prompt again next time
    clearAccessCode();
  }
}

// fetch code from url
async function fetchCode(editor) {
  try {
    let json = await fetch(window.location.origin + "/api/get/" + getDocId(), {
      cache: "no-store" // do not cache result
    }).then(res => res.json());

    editor.setValue(json.markdown);
    // global variable to keep track of the version
    window.docVersion = json.version;
    window.lastSave = markClean(editor);
    setStatus("loaded ver " + json.version);
  } catch (e) {
    editor.setValue("# Error obtaining the document\n\n" + e);
    window.lastSave = markClean(editor);
    setStatus("error");
  }
}

// write to preview frame
function setPreviewContent(previewFrame, content) {
  let previewContent = previewFrame.contentDocument;
  if (previewContent) {
    previewContent.open();
    previewContent.write(content);
    previewContent.close();
  }
}

// fetch the initial preview
async function setInitPreview(previewFrame) {
  try {
    let html = await fetch(window.location.origin + "/view/" + getDocId(), {
      cache: "no-store" // do not cache result
    }).then(res => res.text());
    setPreviewContent(previewFrame, html);
  } catch (e) {
    setPreviewContent(previewFrame, "Error retreiving the preview\n\n" + e);
    setStatus("error");
  }
  // previewFrame.src = window.location.origin + "/view/" + getDocId();
}

// save the document the preview frame
async function saveDoc(previewFrame, editor) {
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
  try {
    // send markdown to server for saving
    let res = await fetch(window.location.origin + "/api/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reqBody)
    });

    // error
    if (res.statusCode == 403) {
      setStatus("no access");
      clearAccessCode();
      return;
    } else if (res.statusCode == 409) {
      setStatus("conflict");
      return;
    }

    if (res.ok) {
      let data = await res.json();

      // 1. update preview
      setPreviewContent(previewFrame, data.html);
      window.docVersion = data.newVersion;

      // 2. now the access code is correct, also save that
      saveAccessCode(accessCode);

      // 3. set editor state to clean
      window.lastSave = markClean(editor);

      // 4. sync scroll
      syncScroll(previewFrame, editor.getScrollInfo());

      // 5. update status
      setStatus("saved ver" + data.newVersion);
    } else {
      setStatus("error");
      // display error message returned from server
      let text = await res.text();
      setPreviewContent(previewFrame, text);
    }
  } catch (e) {
    setStatus("error");
    setPreviewContent(previewFrame, "Something went wrong. Try again.\n\n" + e);
    // prompt again next time
    clearAccessCode();
  }
}

// check saved status, warn before unload window
function checkSaved(e, editor) {
  // just in case
  sessionStorage["docBackup"] = editor.getValue();
  if (!isCleanSince(editor, window.lastSave)) {
    e.preventDefault();
    const msg = "Document not saved.";
    e.returnValue = msg;
    return msg;
  }
}

// synchronize editor scrolling to preview frame scrolling (one-way)
function syncScroll(previewFrame, scrollInfo) {
  // don't ask me why we need to pass scrollinfo all around
  let editorMaxTop = scrollInfo.height - scrollInfo.clientHeight;
  let editorTop = scrollInfo.top;

  if (previewFrame.contentDocument) {
    let html = previewFrame.contentDocument.getElementsByTagName("html")[0];
    let frameMaxTop = html.scrollHeight - html.clientHeight;
    html.scrollTop = frameMaxTop * (editorTop / editorMaxTop);
  }
}
