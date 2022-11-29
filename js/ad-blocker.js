const getAds = () => document.querySelectorAll('.dfp-queue');

const deleteAds = () => {
  getAds().forEach((el) => el.parentElement.removeChild(el))
};