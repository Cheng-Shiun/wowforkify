import View from './View.js';

import icons from 'url:../../img/icons.svg';
class PaginationView extends View {
  _parentElement = document.querySelector('.pagination');

  addHandlerClick(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn--inline');
      if (!btn) return;
      const goToPage = +btn.dataset.goto;

      handler(goToPage);
    });
  }

  _generateMarkup() {
    const curPage = this._data.page;

    // total pages amount
    const amountPage = Math.ceil(
      this._data.results.length / this._data.resultsPerPage,
    );
    console.log(amountPage);

    // Page 1, and there are other pages
    if (curPage === 1 && amountPage > 1) {
      return this._generateNextBtn(curPage);
    }
    // Page 1, and there are NO other pages
    if (curPage === 1 && amountPage === 1) {
      return '';
    }
    // Last page
    if (curPage === amountPage && amountPage > 1) {
      return this._generatePrevBtn(curPage);
    }
    // Other page
    return this._generatePrevBtn(curPage) + this._generateNextBtn(curPage);
  }

  _generateNextBtn(curPage) {
    return `
        <button data-goto="${curPage + 1}" class="btn--inline pagination__btn--next">
            <span>Page ${curPage + 1}</span>
            <svg class="search__icon">
                <use href="${icons}#icon-arrow-right"></use>
            </svg>
        </button> 
      `;
  }

  _generatePrevBtn(curPage) {
    return `
        <button data-goto="${curPage - 1}" class="btn--inline pagination__btn--prev">
            <svg class="search__icon">
                <use href="${icons}#icon-arrow-left"></use>
            </svg>
            <span>Page ${curPage - 1}</span>
        </button>
      `;
  }
}

export default new PaginationView();
