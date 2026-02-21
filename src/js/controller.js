import { MODEL_CLOSE_SEC } from './config.js';
import * as model from './model.js';
import addRecipeView from './views/addRecipeView.js';
import bookmarksView from './views/bookmarksView.js';
import paginationView from './views/paginationView.js';
import recipeView from './views/recipeView.js';
import resultsView from './views/resultsView.js';
import searchView from './views/searchView.js';

import 'core-js/stable';

// console.log(icons);

if (module.hot) {
  module.hot.accept();
}

///////////////////////////////////////
// 處理錯誤的情境是 -> 程式執行異常驅動
// 當使用者輸入一個不存在的 ID 時，API 會回傳 404，getJSON 直接拋出錯誤。
const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1); // 因 hash 預設開頭為#
    // console.log(id);
    if (!id) return; // without throwing an error

    // 0. Updating results list view to mark selected search result and bookmarks
    resultsView.update(model.getSearchResultsPage());
    bookmarksView.update(model.state.bookmarkers);

    // 1. Loading recipe
    recipeView.renderSpinner();

    await model.loadRecipe(id);

    // 2. Rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    console.error('💥 真正的錯誤在這邊:', err);
    recipeView.renderError(); // catch err from (helpers - getJSON() -> loadRecipe() )
  }
};

// 處理錯誤的情境是 -> 數據狀態驅動的
// 當使用者搜尋一個不存在的關鍵字（如 "abc"）時，API 回傳的是 200 OK 伴隨一個空陣列 []。
const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();

    // 1. Get search query
    const query = searchView.getQuery();
    if (!query) return; // guard clause 保護條款

    // 2. Load search results
    await model.loadSearchResults(query);

    // 3. Render results
    // console.log(model.state.search.result);
    // resultsView.render(model.state.search.result);
    resultsView.render(model.getSearchResultsPage());

    // 4. Render initial pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (goToPage) {
  // 1. Render new results
  resultsView.render(model.getSearchResultsPage(goToPage));

  // 2. Render new pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // 1. Update the recipe servings
  model.updateServings(newServings);

  // 2. Update the recipe view -> 因為有更新 state 所以直接重新渲染比較方便，不用手動針對每個 element 更新值
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlBookmarker = function () {
  // 1. Add/remove bookmark
  if (!model.state.recipe.bookmarked) {
    model.addBookmarker(model.state.recipe);
  } else model.deleteBookmarker(model.state.recipe.id);
  // console.log(model.state.recipe);

  // 2. Update the bookmarker button in recipe view
  recipeView.update(model.state.recipe);

  // 3. Render bookmarks
  bookmarksView.render(model.state.bookmarkers);
};

const controlBookmarksRender = function () {
  bookmarksView.render(model.state.bookmarkers);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    addRecipeView.renderSpinner();

    // Upload the new recipe
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    // Render recipe
    recipeView.render(model.state.recipe);

    // Success message
    addRecipeView.renderMessage();

    // Render bookmark view
    bookmarksView.render(model.state.bookmarkers);

    // Change id in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // Close form window
    setTimeout(function () {
      addRecipeView.toggleShow();
    }, MODEL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error(err);
    addRecipeView.renderError(err.message);
  }
};

// 初始化用來渲染 DOM
// 發佈-訂閱模式用來將 controller 層的函數作為 handler 參數給 view 層呼叫使用
const init = function () {
  bookmarksView.addHandlerRender(controlBookmarksRender);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmarker(controlBookmarker);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};

init();
