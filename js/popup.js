(() => {
  const footer = document.querySelector("footer");
  const year = new Date().getFullYear();
  footer.innerHTML = footer.innerHTML.replace(
    "%year%",
    year === 2021 ? year : `2021-${year}`
  );

  const addPostCounterEvent = () => {
    document.querySelector(".posts-counter").addEventListener("click", (el) => {
      chrome.tabs.query(
        {
          active: true,
          currentWindow: true
        },
        (tabs) => {
          chrome.tabs.sendMessage(
            tabs[0].id,
            {
              message: "CUENTA_POSTS_EOL"
            },
            (response) => {
              if (!window.chrome.runtime.lastError) {
                if (response && response.data) {
                  // do sthg with the response, if needed
                }
              } else {
                console.error("Error getting CUENTA_POSTS_EOL");
              }
            }
          );
        }
      );
    });
  };

  const messageRegex = /__MSG_(\w+)__/g;
  const localizeHtmlPage = (el) => {
    for (let i = 0; i < el.children.length; i++) {
      localizeHtmlPage(el.children[i]);
      if (el.children[i].hasAttributes()) {
        for (let j = 0; j < el.children[i].attributes.length; j++) {
          el.children[i].attributes[j].name = el.children[i].attributes[
            j
          ].name.replace(messageRegex, localizeString);
          el.children[i].attributes[j].value = el.children[i].attributes[
            j
          ].value.replace(messageRegex, localizeString);
        }
      }
      if (el.children[i].innerHTML.length) {
        el.children[i].innerHTML = el.children[i].innerHTML.replace(
          messageRegex,
          localizeString
        );
      }
    }
  };

  const localizeString = (_, str) => (str ? chrome.i18n.getMessage(str) : "");

  localizeHtmlPage(document.body);
  addPostCounterEvent();
})();
