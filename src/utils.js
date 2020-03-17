export { getDocId };

// Fetch doc id from path
function getDocId() {
  return window.location.pathname
    .split("/")
    .filter(x => x) // remove empty elements
    .pop();
}
