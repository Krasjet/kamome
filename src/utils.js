export {
  // General
  getDocId,
  setStatus,
  // Editor
  isCleanSince,
  markClean,
  // Access code
  askAccessCode,
  saveAccessCode,
  clearAccessCode,
  appendCodeToBody
};

// -- Some utils used by every function
// Fetch doc id from path
function getDocId() {
  let tokens = window.location.pathname.split("/");
  tokens.indexOf("edit");

  return tokens[tokens.indexOf("edit") + 1]; // i.e. the token after "edit"
}

// Set the status bar
function setStatus(message) {
  let status = document.getElementById("menu-status");
  if (status) {
    status.innerText = ":" + message + ":";
  }
}
// -- <end

// -- Editor related
// Check if nothing has changed since last render
function isCleanSince(editor, gen) {
  return gen !== undefined && editor.isClean(gen);
}

// Mark clean
function markClean(editor) {
  return editor.changeGeneration(true);
}
// -- <end

// -- Access code related
// Get access code from user
function askAccessCode() {
  // only ask if storage is empty
  if (sessionStorage["accessCode"] === undefined || sessionStorage["docId"] !== getDocId())
    return prompt("Access code (will be saved, probably for a while):");
  return sessionStorage["accessCode"];
}

// Save access code for the session
function saveAccessCode(accessCode) {
  sessionStorage["accessCode"] = accessCode;
  sessionStorage["docId"] = getDocId();
}

// clear access code for the session
function clearAccessCode() {
  sessionStorage.removeItem("accessCode");
  sessionStorage.removeItem("docId");
}

// Append access code to request body
function appendCodeToBody(reqBody, accessCode) {
  // only send the access code if it's not empty
  if (accessCode !== "") reqBody.accessCode = accessCode;
}
// -- <end
