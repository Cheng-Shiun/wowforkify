class SearchView {
  _parentElement = document.querySelector('.search');

  getQuery() {
    const query = this._parentElement.querySelector('.search__field').value;
    this.clearInput();

    return query;
  }

  clearInput() {
    this._parentElement.querySelector('.search__field').value = '';
  }

  addHandlerSearch(handler) {
    this._parentElement.addEventListener('submit', function (e) {
      e.preventDefault(); // 預設表單送出會重載 reload page
      handler(); // call handler
    });
  }
}

export default new SearchView();
