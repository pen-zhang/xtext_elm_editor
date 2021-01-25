window.onload = dividerAction;

function dividerAction() {
  var editorNode = document.getElementById('editor');
  var dividerNode = document.getElementById('divider');
  var outputNode = document.getElementById('output');
  dividerNode.addEventListener('mousedown', function(e) {
    editorNode.style.pointerEvents = 'none';
    outputNode.style.pointerEvents = 'none';
    document.body.addEventListener('mouseup', dividerUp);
    document.body.addEventListener('mousemove', dividerMove);
  });
  function dividerUp() {
    editorNode.style.pointerEvents = 'auto';
    outputNode.style.pointerEvents = 'auto';
    document.body.removeEventListener('mouseup', dividerUp);
    document.body.removeEventListener('mousemove', dividerMove);
  }
  function dividerMove(e) {
    if (e.buttons === 0) {
      dividerUp();
      return;
    }
    var fraction = 100 * (e.pageX / window.innerWidth);
    dividerNode.style.left = fraction + '%';
    editorNode.style.width = fraction + '%';
    outputNode.style.width = 100 - fraction + '%';
  }
};
