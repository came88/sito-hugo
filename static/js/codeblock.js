"use strict";

window.onload = function() {
  let article = document.querySelector(".content .container.post article");
  if (article) {
    let codeBlocks = article.getElementsByTagName('code');
    for (let [key, codeBlock] of Object.entries(codeBlocks)) {
      var widthDif = codeBlock.parentNode.scrollWidth - codeBlock.parentNode.clientWidth;
      if (widthDif > 0) {
        codeBlock.parentNode.classList.add('expand');
      }
    }
  }
}