const browserObj = chrome || browser;

browserObj.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "EOL_POSTS_COUNTER") {
    sendResponse({ data: !getModal() ? openModal() : false });
  }
});

browserObj.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "EOL_AD_BLOCKER") {
    if (getAds().length) {
      sendResponse({ data: deleteAds() });
    } else {
      location.reload();
    }
  }
});

browserObj.storage.sync.get(['adBlocker'], (result) => {
  if (result.adBlocker) {
    deleteAds();
  }
});

browserObj.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "EOL_IMPROVE_UX") {
    sendResponse({ data: document.documentElement.classList.toggle('improve-ux') });
  }
});

browserObj.storage.sync.get(['improveUx'], (result) => {
  if (result.improveUx) {
    document.documentElement.classList.add('improve-ux')
  }
});