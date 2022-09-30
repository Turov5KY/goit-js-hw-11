const axios = require('axios').default;
export { fetchPhotoList };

axios.defaults.baseURL = "https://pixabay.com/api/";
const API_KEY = "30121041-b482cf85d8fbdb4df3c3b5b93";

async function fetchPhotoList(searchUserText, page, perPage) {
  return await axios.get(
    `?key=${API_KEY}&q=${searchUserText}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`
  );
}
