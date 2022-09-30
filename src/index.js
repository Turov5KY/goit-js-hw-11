import { refs } from './js/refs';
import { fetchPhotoList } from './js/fetchPhoto';
import renderGallery from './js/render-gallery';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import throttle from 'lodash.throttle';

import 'simplelightbox/dist/simple-lightbox.min.css';

refs.searchForm.addEventListener('submit', onSearchPhotos);

let searchUserText = 'popular';
let page = 0;
let simpleLightBox = new SimpleLightbox('.gallery a');
const perPage = 40;
const trottleLoadMore = throttle(onLoadMorePhotos, 1000);

async function onSearchPhotos(e) {
  e.preventDefault();
  window.scrollTo({ top: 0 });
  page = 1;
  searchUserText = e.currentTarget.searchQuery.value.trim();
  refs.galleryBox.innerHTML = '';

  if (searchUserText === '') {
    alertNoEmptySearch();
    return;
  }

  try {
    const respons = await fetchPhotoList(searchUserText, page, perPage);
    if (respons.data.totalHits === 0) {
      alertNoImagesFound();
    } else {
      renderGallery(respons.data.hits);
      window.addEventListener('scroll', trottleLoadMore, false);
      simpleLightBox.refresh();
      alertImagesFound(respons.data);
    }
    refs.searchForm.reset();
  } catch (error) {
    console.log(error);
  }
}

async function onLoadMorePhotos() {
  const documentRect = document.documentElement.getBoundingClientRect().bottom;
  refs.loader.classList.add('is-hiden')
  if (documentRect < document.documentElement.clientHeight + 50) {
    try {
      page += 1;
      const respons = await fetchPhotoList(searchUserText, page, perPage);
      const totalPages = Math.ceil(respons.data.totalHits / perPage);
      if (page >= totalPages) {
        refs.loader.classList.remove('is-hiden');
        alertEndOfSearch();
        window.removeEventListener('scroll', trottleLoadMore, false);
      } else {
        renderGallery(respons.data.hits);
        simpleLightBox.refresh();
      }
    } catch (error) {
      console.log(error);
    }
  }
}

function alertImagesFound(data) {
  Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
}

function alertNoEmptySearch() {
  Notiflix.Notify.failure(
    'The search string cannot be empty. Please specify your search query.'
  );
}

function alertNoImagesFound() {
  Notiflix.Notify.failure(
    'Sorry, there are no images matching your search query. Please try again.'
  );
}

function alertEndOfSearch() {
  Notiflix.Notify.failure(
    "We're sorry, but you've reached the end of search results."
  );
}

refs.arrowTop.onclick = function () {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.addEventListener('scroll', function () {
  refs.arrowTop.hidden =
    window.pageYOffset < document.documentElement.clientHeight;
});
