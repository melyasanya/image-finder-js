import './css/styles.css';
import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const lightbox = new SimpleLightbox('.gallery a', {
  /* options */
});

const form = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
const loadBtn = document.querySelector('.load-more');
loadBtn.hidden = true;
const input = document.querySelector('input');

let pageNumber = 1;

const pixabayAPI = axios.create({
  baseURL: 'https://pixabay.com/api/',
  params: {
    key: '36255807-75837d89431772e88b07b47aa',
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: 'true',
    per_page: 40,
  },
});

const getPictures = async (queryInput, pageNumber) => {
  const getAllPictures = await pixabayAPI.get('', {
    params: { q: queryInput, page: pageNumber },
  });
  return getAllPictures;
};

const picturesMarkUp = data => {
  loadBtn.hidden = false;
  const picturesArray = data.data.hits;
  if (pageNumber === 1 && data.data.totalHits !== 0) {
    Notify.info(`Hooray! We found ${data.data.totalHits} images.`);
  }
  if (data.data.totalHits === 0) {
    loadBtn.hidden = true;
    Notify.warning(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }
  if (
    Math.ceil(data.data.totalHits / 40 < pageNumber) &&
    data.data.totalHits < 40 &&
    data.data.totalHits !== 0
  ) {
    loadBtn.hidden = true;
    Notify.warning(
      "We're sorry, but you've reached the end of search results."
    );
  }
  const markUp = picturesArray
    .map(
      e =>
        `<div class="photo-card">
    <a href='${e.largeImageURL}'>
      <img src="${e.webformatURL}" alt="${e.tags}" loading="lazy" />
      </a>
      <div class="info">
        <p class="info-item">
          <b>Likes<br>${e.likes}</b>
        </p>
        <p class="info-item">
          <b>Views<br>${e.views}</b>
        </p>
        <p class="info-item">
          <b>Comments<br>${e.comments}</b>
        </p>
        <p class="info-item">
          <b>Downloads<br>${e.downloads}</b>
        </p>
      </div>
    </div>`
    )
    .join('');
  gallery.insertAdjacentHTML('beforeend', markUp);
  lightbox.refresh();
};

const submitForm = async e => {
  e.preventDefault();
  gallery.innerHTML = '';
  pageNumber = 1;
  const result = await getPictures(
    e.target.elements.searchQuery.value,
    pageNumber
  );
  picturesMarkUp(result);
};

const loadMore = async () => {
  pageNumber += 1;
  const result = await getPictures(input.value, pageNumber);
  picturesMarkUp(result);
};

form.addEventListener('submit', submitForm);

loadBtn.addEventListener('click', loadMore);
