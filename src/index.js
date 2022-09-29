import { refs } from './js/refs';
import { fetchPhotoList } from './js/fetchPhoto';
import renderGallery from './js/render-gallery';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import throttle from 'lodash.throttle';

import 'simplelightbox/dist/simple-lightbox.min.css';

const randomNumber = Math.trunc(Math.random() * (1 - 10) + 10);

refs.searchForm.addEventListener('submit', onSearchPhotos);

let searchUserText = 'popular';
let page = 0;
let simpleLightBox = new SimpleLightbox('.gallery a');
const perPage = 40;
const trottleLoadMore = throttle(onLoadMorePhotos, 200);

startTitlePage();

function startTitlePage() {
  fetchPhotoList(searchUserText, randomNumber, 6)
    .then(({ data }) => {
      renderGallery(data.hits);
      simpleLightBox = new SimpleLightbox('.gallery a').refresh();
    })
    .catch(error => console.log(error))
    .finally(() => {
      refs.searchForm.reset();
    });
}

function onSearchPhotos(e) {
  e.preventDefault();
  window.scrollTo({ top: 0 });
  page = 1;
  searchUserText = e.currentTarget.searchQuery.value.trim();
  refs.galleryBox.innerHTML = '';

  if (searchUserText === '') {
    alertNoEmptySearch();
    return;
  }

  fetchPhotoList(searchUserText, page, perPage)
    .then(({ data }) => {
      if (data.totalHits === 0) {
        alertNoImagesFound();
      } else {
        renderGallery(data.hits);
        window.addEventListener('scroll', trottleLoadMore, false);
        simpleLightBox.refresh();
        alertImagesFound(data);
      }
    })
    .catch(error => console.log(error))
    .finally(() => {
      refs.searchForm.reset();
    });
}

function onLoadMorePhotos() {
  const documentRect = document.documentElement.getBoundingClientRect().bottom;
  console.log('2');
  if (documentRect < document.documentElement.clientHeight + 10) {
    page += 1;
    fetchPhotoList(searchUserText, page, perPage)
      .then(({ data }) => {
        const totalPages = Math.ceil(data.totalHits / perPage);
        if (page >= totalPages) {
          alertEndOfSearch();
          window.removeEventListener('scroll', trottleLoadMore, false);
        } else {
          renderGallery(data.hits);
          simpleLightBox.refresh();
        }
      })
      .catch(error => console.log(error));
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
