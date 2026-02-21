import icons from 'url:../../img/icons.svg';
export default class View {
  _data;

  render(data, render = true) {
    if (!data || (Array.isArray(data) && data.length === 0))
      return this.renderError(); // render the default XXXView errorMessage

    this._data = data; // 將 model 透過 controller 傳來的數據作為屬性
    const markup = this._generateMarkup();

    if (!render) return markup;

    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  update(data) {
    this._data = data; // 將 model 透過 controller 傳來的數據作為屬性
    const newMarkup = this._generateMarkup(); // 新的標記

    // 比較有改變 value 的 element
    const newDOM = document.createRange().createContextualFragment(newMarkup);
    const newElements = Array.from(newDOM.querySelectorAll('*')); // nodeList change to array
    const curElements = Array.from(this._parentElement.querySelectorAll('*'));

    // Compare the different node
    newElements.forEach((newEl, i) => {
      const curEl = curElements[i]; // 因為剛好是相同的 DOM 比較所以基本上 index 相同
      // console.log(curEl, newEl.isEqualNode(curEl));

      // Update changed TEXT
      if (
        !newEl.isEqualNode(curEl) &&
        newEl.firstChild?.nodeValue.trim() !== ''
      ) {
        // console.log(newEl.firstChild.nodeValue.trim());
        curEl.textContent = newEl.textContent;
      }

      // Update changed DATA ATTRIBUTE(data-update-to)
      if (!newEl.isEqualNode(curEl)) {
        // console.log(newEl.attributes);
        // console.log(Array.from(newEl.attributes));
        Array.from(newEl.attributes).forEach(
          attr => curEl.setAttribute(attr.name, attr.value), // 將 data-update-tp 的值更新
        );
      }
    });
  }

  _clear() {
    this._parentElement.innerHTML = '';
  }

  // 加載動畫
  renderSpinner() {
    const markup = `
      <div class="spinner">
        <svg>
          <use href="${icons}#icon-loader"></use>
        </svg>
      </div>
    `;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  // 失敗
  renderError(message = this._errorMessage) {
    const markup = `
      <div class="error">
        <div>
            <svg>
            <use href="${icons}#icon-alert-triangle"></use>
            </svg>
        </div>
        <p>${message}</p>
       </div>
    `;

    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  // 成功
  renderMessage(message = this._successMessage) {
    const markup = `
      <div class="message">
        <div>
            <svg>
            <use href="${icons}#icon-smile"></use>
            </svg>
        </div>
        <p>${message}</p>
       </div>
    `;

    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }
}
