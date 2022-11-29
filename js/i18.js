const translateString = (text) => text.replace(/__MSG_(\w+)__/g, localizeString);

const localizeString = (_, str) => (str ? (chrome || browser).i18n.getMessage(str) : "");