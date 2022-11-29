(() => {
  const browserObj = chrome || browser;
  const activeClass = 'active';
  const footer = document.querySelector("footer");
  const year = new Date().getFullYear();
  footer.innerHTML = footer.innerHTML.replace(
    "%year%",
    year === 2021 ? year : `2021-${year}`
  );
  document.querySelectorAll('[data-label]').forEach((el) => { el.textContent = translateString(el.dataset.label)});

  document.querySelector(".posts-counter").addEventListener("click", (el) => {
    browserObj.tabs.query(
      {
        active: true,
        currentWindow: true
      },
      (tabs) => {
        browserObj.tabs.sendMessage(tabs[0].id, { message: "EOL_POSTS_COUNTER" });
      }
    );
  });
  
  const adBlockerButton = document.querySelector(".ad-blocker");
  browserObj.storage.sync.get(['adBlocker'], (result) => {
    if (result.adBlocker) {
      adBlockerButton.classList.add(activeClass);
    }
  });

  adBlockerButton.addEventListener("click", (el) => {
    adBlockerButton.classList.toggle(activeClass);
    browserObj.storage.sync.set({adBlocker: adBlockerButton.classList.contains(activeClass)});
    browserObj.tabs.query(
      {
        active: true,
        currentWindow: true
      },
      (tabs) => {
        browserObj.tabs.sendMessage(tabs[0].id, { message: "EOL_AD_BLOCKER" });
      }
    );
  });

  const improveUxButton = document.querySelector(".improve-ux");
  browserObj.storage.sync.get(['improveUx'], (result) => {
    if (result.improveUx) {
      improveUxButton.classList.add(activeClass);
    }
  });

  improveUxButton.addEventListener("click", (el) => {
    improveUxButton.classList.toggle(activeClass);
    browserObj.storage.sync.set({improveUx: improveUxButton.classList.contains(activeClass)});
    browserObj.tabs.query(
      {
        active: true,
        currentWindow: true
      },
      (tabs) => {
        browserObj.tabs.sendMessage(tabs[0].id, { message: "EOL_IMPROVE_UX" });
      }
    );
  });
})();


/*
// Popup actions listener
chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (typeof request.directive !== 'undefined') {
      let files = request.directive.split(','),
        jsFiles = [],
        cssFiles = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.includes('.js')) jsFiles.push({ file: file });
        else if (file.includes('.css')) cssFiles.push({ file: file });
      }
      if (jsFiles.length) executeScripts(null, jsFiles);
      if (cssFiles.length) insertCSSs(null, cssFiles);
      // close
      let windows = chrome.extension.getViews({ type: "popup" });
      if (windows.length) {
        windows[0].close();
      }
    }
  }
);
*/