const PAGE_MULTIPLIER = 50;
const DOMAIN = 'elotrolado.net';

const translateString = (text) => {
  return text.replace(/__MSG_(\w+)__/g, localizeString);
};

const localizeString = (_, str) => (str ? chrome.i18n.getMessage(str) : "");

const translateModal = () => {
  // FIXME: this translation function removes all the events in the html elements
  localizeHtmlPage(getModal());
};

const getModal = () => document.querySelector(".modal");

const getSourceAsDOM = (url) => {
  const xmlHttp = new XMLHttpRequest();
  xmlHttp.open("GET", url, false);
  xmlHttp.send();
  const parser = new DOMParser();
  return parser.parseFromString(xmlHttp.responseText, "text/html");
};

const getStartPage = (startPage) => PAGE_MULTIPLIER * --startPage;

const getUserTemplate = (name) => ({ name, count: 0 });

const initializeUsersArray = (usersList) =>
  usersList.reduce((acc, el) => {
    acc.push(getUserTemplate(el));
    return acc;
  }, []);

const addUserCounting = (el, usersList, addNewUsers) => {
  const name = el.innerText.trim();
  let user = usersList.find(
    (el) => el.name.toUpperCase() === name.toUpperCase()
  );
  if (addNewUsers || user) {
    if (user && name !== user.name) {
      user.name = name;
    }
    if (!user) {
      user = getUserTemplate(name);
      usersList.push(user);
    }
    user.count++;
  }
};

const getPosts = (url, usersList, startPage, sortBy) => {
  page = getStartPage(startPage);
  usersList = initializeUsersArray(usersList);
  const addNewUsers = usersList.length === 0;
  do {
    const dom = getSourceAsDOM(`${url}_s${page}`);
    const users = dom.querySelectorAll(".author.ellipsize");
    if (!users.length) break;
    users.forEach((el) => addUserCounting(el, usersList, addNewUsers));
  } while ((page += PAGE_MULTIPLIER));
  const sorting = {
    postsAsc: (el1, el2) => (el1.count > el2.count ? -1 : 1),
    postsDesc: (el1, el2) => (el1.count < el2.count ? -1 : 1),
    nameAsc: (el1, el2) => el1.name.toUpperCase() < el2.name.toUpperCase() ? -1 : 1,
    nameDesc: (el1, el2) => el1.name.toUpperCase() > el2.name.toUpperCase() ? -1 : 1
  };
  return usersList.sort(sorting[sortBy]);
};

const drawTable = (posts) => {
  const table = document.createElement("table");
  table.classList.add("table");
  table.innerHTML = `<thead><th>${translateString("__MSG_name__")}</th><th>${translateString("__MSG_posts__")}</th></thead>`;
  const tbody = document.createElement("tbody");
  let tbodyHTML = "";
  posts.forEach((el) => {
    tbodyHTML += `<tr><td>${el.name}</td><td>${el.count}</td></tr>`;
  });
  tbody.innerHTML = tbodyHTML;
  table.appendChild(tbody);
  const formContainer = document.querySelector(".form-container");
  formContainer.innerHTML = "";
  formContainer.appendChild(table);
  getModal().style.cssText += "justify-content: flex-start;";
  formContainer.appendChild(
    createButton(
      "btn-primary",
      translateString("__MSG_count_again__"),
      (event) => insertForm(document.querySelector(".form-container"), true)
    )
  );
};

const closeAll = () => {
  const modal = getModal();
  if (modal) {
    modal.parentElement.removeChild(modal);
    darkenLayer(false);
  }
};

const darkenLayer = (enable) => {
  if (enable) {
    document.body.style = "overflow: hidden;";
    document.documentElement.style = "overflow: hidden;";
    const darkLayer = document.createElement("div");
    darkLayer.classList.add("darkLayer");
    darkLayer.style.cssText =
      "background-color: rgba(0, 0, 0, .7); position: fixed; top: 0; right: 0; bottom: 0; left: 0; z-index: 999";
    darkLayer.addEventListener("click", closeAll);
    document.body.appendChild(darkLayer);
  } else {
    document.body.style = "";
    document.documentElement.style = "";
    const darkLayer = document.querySelector(".darkLayer");
    darkLayer && darkLayer.parentElement.removeChild(darkLayer);
  }
};

const showSpinner = () => {
  const spinner = document.createElement("div");
  spinner.classList.add("spinner");
  spinner.style.cssText =
    "border: 4px solid #395a2f; border-left-color: transparent; width: 36px; height: 36px; animation: spin 1s linear infinite; border-radius: 50%; margin: auto;";
  const formContainer = document.querySelector(".form-container");
  formContainer.innerHTML =
    "<style> @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } </style>";
  formContainer.appendChild(spinner);
};

const createModal = () => {
  const modal = document.createElement("div");
  modal.classList.add("modal");
  modal.style.cssText =
    "position: fixed; top: 0; right: 0; bottom: 0; left: 0; z-index: 999; display: flex; justify-content: center; flex-direction: column; width: 450px; max-width: 80%; margin: auto; background: white; padding: 2em; border-radius: 10px; height: fit-content; max-height: 80%; overflow-y: auto;";
  modal.innerHTML =
    "<style>.modal::-webkit-scrollbar { width: 8px; } .modal::-webkit-scrollbar-track { background: #efefef; border-radius: 10px; margin: 10px 0px; } .modal::-webkit-scrollbar-thumb { background-color: #ddd; border-radius: 10px; border: 3px solid #ccc; }</style>";
  return modal;
};

const createModalContent = () => {
  const modalContent = document.createElement("div");
  modalContent.classList.add("modal-content");
  modalContent.style.cssText = "position: relative;";
  return modalContent;
};

const createFormContainer = () => {
  const formContainer = document.createElement("div");
  formContainer.classList.add("form-container");
  return formContainer;
};

const createFormGroup = (label, input, annotation) => {
  const formGroup = document.createElement("div");
  formGroup.classList.add("form-group");
  formGroup.innerHTML = label + input + annotation;
  return formGroup;
};

const createButton = (clazz, label, click) => {
  const button = document.createElement("button");
  button.classList.add("btn");
  button.classList.add(clazz);
  button.style.cssText = "width: 100%;";
  button.innerText = label;
  button.addEventListener("click", click);
  return button;
};

const getCurrentPage = () => {
  let currentPage = 1;
  const path = window.location.pathname.split("_");
  let baseUrl = path[path.length - 1];
  if (baseUrl[0] === "s") {
    currentPage = (baseUrl.substring(1) * 1) / PAGE_MULTIPLIER + 1;
  }
  return currentPage;
};

const getLastPage = () => {
  const pages = document.querySelectorAll(".pages > *");
  return pages[pages.length - 1].textContent * 1;
};

const getSortOptions = (sortCriteria) => {
  return (
    `<option value="${sortCriteria}Asc">${translateString(`__MSG_sort_by_${sortCriteria}_asc__`)}</option>` +
    `<option value="${sortCriteria}Desc">${translateString(`__MSG_sort_by_${sortCriteria}_desc__`)}</option>`
  );
};

const insertForm = (formContainer, translate = false) => {
  formContainer.innerHTML = "";
  const path = window.location.pathname.split("_");
  let baseUrl = path[path.length - 1];
  if (baseUrl[0] === "s") {
    baseUrl = path[path.length - 2];
  }

  formContainer.appendChild(
    createFormGroup(
      `<label for="baseUrl">${translateString("__MSG_thread_url__")}</label>`,
      `<input type="url" class="form-control" id="baseUrl" aria-describedby="baseUrlHelp" placeholder="${translateString("__MSG_thread_url_placeholder__")}" value="${baseUrl}" />`,
      `<small id="baseUrlHelp" class="form-text text-muted">${translateString("__MSG_thread_url_description__")}</small>`
    )
  );
  const startPageFormGroup = createFormGroup(
    `<label for="startPage">${translateString("__MSG_start_page__")}</label>`,
    `<input type="number" class="form-control" id="startPage" aria-describedby="startPageHelp" value="${getCurrentPage()}" required min="1" max="${getLastPage()}" />`,
    `<small id="startPageHelp" class="form-text text-muted">${translateString("__MSG_start_page_description__")}</small>`
  );
  formContainer.appendChild(startPageFormGroup);
  startPageFormGroup.appendChild(
    createButton(
      "btn-secondary",
      translateString("__MSG_start_page_switch__"),
      (event) => {
        const startPage = document.querySelector("#startPage");
        const currentValue = startPage.value * 1;
        const currentPage = getCurrentPage();
        const lastPage = getLastPage();
        if (currentValue === 1) {
          startPage.value = currentPage;
        } else if (currentValue === currentPage && currentPage !== lastPage) {
          startPage.value = lastPage;
        } else {
          startPage.value = 1;
        }
      }
    )
  );
  formContainer.appendChild(
    createFormGroup(
      `<label for="usersList">${translateString("__MSG_users_list__")}</label>`,
      `<textarea class="form-control" id="usersList" aria-describedby="usersListHelp" placeholder="${translateString("__MSG_users_list_placeholder__")}" style="max-width: 100%;"></textarea>`,
      `<small id="usersListHelp" class="form-text text-muted">${translateString("__MSG_users_list_description__")}</small>`
    )
  );

  formContainer.appendChild(
    createFormGroup(
      `<label for="sortBy">${translateString("__MSG_sort_by__")}</label>`,
      `<select class="form-control" id="sortBy">${getSortOptions("posts")}${getSortOptions("name")}</select>`,
      ""
    )
  );

  const submitButton = createButton(
    "btn-primary",
    translateString("__MSG_count__"),
    (event) => {
      let usersList = document.querySelector("#usersList").value.trim();
      if (usersList.length) {
        usersList = usersList.split(",");
      } else {
        usersList = [];
      }
      let baseUrl = document.querySelector("#baseUrl").value.trim();
      if (baseUrl.indexOf(DOMAIN) === -1) {
        baseUrl = `https://www.${DOMAIN}/hilo__${baseUrl}`;
      }
      const startPost = document.querySelector("#startPage").value.trim() * 1;
      const sortBy = document.querySelector("#sortBy").value.trim();
      showSpinner();
      setTimeout(() => {
        const posts = getPosts(baseUrl, usersList, startPost, sortBy);
        drawTable(posts);
      }, 10);
    }
  );
  formContainer.appendChild(submitButton);
  formContainer.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      submitButton.click();
    }
  });
  if (translate) {
    localizeHtmlPage(formContainer);
  }
};

const openModal = () => {
  darkenLayer(true);

  const modal = createModal();
  const modalContent = createModalContent();
  modal.appendChild(modalContent);

  const formContainer = createFormContainer();
  modalContent.appendChild(formContainer);

  insertForm(formContainer);

  const closeButton = createButton(
    "btn-secondary",
    translateString("__MSG_close__"),
    closeAll
  );
  closeButton.classList.add("closeButton");
  closeButton.style.cssText += "margin-top: 1em;";
  modalContent.appendChild(closeButton);

  document.body.appendChild(modal);

  return true;
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "CUENTA_POSTS_EOL") {
    sendResponse({ data: !getModal() ? openModal() : false });
  }
});
