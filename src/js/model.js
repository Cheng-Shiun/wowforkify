import 'regenerator-runtime/runtime';
import { API_URL, KEY, RES_PER_PAGE } from './config.js';
// import { getJSON, sendJSON } from './helpers.js';
import { AJAX } from './helpers.js';

export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    page: 1, // default start page
    resultsPerPage: RES_PER_PAGE,
  },
  bookmarkers: [],
};

const createRecipeObject = function (data) {
  const { recipe } = data.data; // 解構物件取出數據到變數中

  // 將 fetch 到的 recipe 數據放入 state obj 的 recipe {} 中
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    ...(recipe.key && { key: recipe.key }), // if has key -> add key property
  };
};

export const loadRecipe = async function (id) {
  try {
    const data = await AJAX(`${API_URL}${id}?key=${KEY}`);

    state.recipe = createRecipeObject(data);

    // Check recipe whether has been marked
    if (state.bookmarkers.some(recipe => recipe.id === id)) {
      state.recipe.bookmarked = true;
    } else state.recipe.bookmarked = false;

    // console.log(state.recipe);
  } catch (err) {
    console.error(`${err} ❌❌❌`);
    throw err; // sent to controlRecipe
  }
};

export const loadSearchResults = async function (query) {
  try {
    state.search.query = query;
    const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);

    state.search.results = data.data.recipes.map(rec => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
        ...(rec.key && { key: rec.key }), // if has key -> add key property
      };
    });
    // console.log(state.search.result);
    // 重置 state page 回預設值
    state.search.page = 1;
  } catch (err) {
    console.error(`${err} ❌❌❌`);
    throw err; // sent to controlSearchResult
  }
};

export const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page; // update state

  const start = (page - 1) * state.search.resultsPerPage;
  const end = page * state.search.resultsPerPage;

  return state.search.results.slice(start, end);
};

export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach(ing => {
    // newQuantity = oldQuantity * newServings / oldServings
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
  });

  state.recipe.servings = newServings; // update state
};

const persisBookmarks = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarkers));
};

export const addBookmarker = function (recipe) {
  // Add bookmarker
  state.bookmarkers.push(recipe);

  // Mark current recipe as bookmarked if current recipe has been marked
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true; // add a property of recipe object

  persisBookmarks();
};

export const deleteBookmarker = function (id) {
  // Delete bookmarker
  const index = state.bookmarkers.findIndex(recipe => recipe.id === id);
  console.log(index);
  state.bookmarkers.splice(index, 1);

  // Mark current recipe as NOT bookmarked if current recipe has been cancel marked
  if (id === state.recipe.id) state.recipe.bookmarked = false; // add a property of recipe object

  persisBookmarks();
};

const init = function () {
  const storage = localStorage.getItem('bookmarks');
  if (storage) state.bookmarkers = JSON.parse(storage);
};

init();
// console.log(state.bookmarkers);

const clearBookmarkers = function () {
  localStorage.clear('bookmarks');
};

// clearBookmarkers();

export const uploadRecipe = async function (newRecipe) {
  try {
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ing => {
        const ingArr = ing[1].split(',').map(value => value.trim());

        if (ingArr.length !== 3)
          throw new Error(
            'Wrong ingredient format! Please use the correct format :)',
          );
        const [quantity, unit, description] = ingArr;
        return { quantity: quantity ? +quantity : null, unit, description };
      });

    const recipe = {
      title: newRecipe.title,
      publisher: newRecipe.publisher,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      servings: +newRecipe.servings,
      cooking_time: +newRecipe.cookingTime,
      ingredients,
    };

    const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
    state.recipe = createRecipeObject(data);
    addBookmarker(state.recipe);
  } catch (err) {
    throw err;
  }
};
