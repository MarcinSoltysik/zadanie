"use strict";

async function fetchData() {
  const url =
    "https://raw.githubusercontent.com/alexsimkovich/patronage/main/api/data.json";

  try {
    const response = await fetch(url);
    return response.json();
  } catch (error) {
    console.error("Upss, coś poszło nie tak :( ", error);
  }
}

function addSortingSuport() {
  const sortSelect = document.querySelector("#sort");

  sortSelect.addEventListener("change", (e) => {
    switch (e.target.value) {
      case "a-z-down":
        sortByNameAZ();
        break;
      case "a-z-up":
        sortByNameZA();
        break;
      case "price-down":
        sortPriceDown();
        break;
      case "price-up":
        sortPriceUp();
        break;
      default:
        sortByNameAZ();
        break;
    }
  });
}

function appStart() {
  sortByNameAZ();
  renderPizzaList();
  addSortingSuport();
  addSerchSuport();
  addToggleButtonSupport();
}

function addToggleButtonSupport() {
  const toggleButton = document.querySelector(".navbar-toggle");
  const navbarBtn = document.querySelector(".navbar-options");

  toggleButton.addEventListener("click", () => {
    navbarBtn.classList.toggle("active");
  });
}

function addSerchSuport() {
  const searchInput = document.querySelector(".search input");
  searchInput.addEventListener("keyup", searchIngredients);
}

function searchIngredients() {
  const searchInput = document.querySelector(".search input");

  const filteredProducts = pizzaList.filter((pizza) => {
    const ingredientsString = pizza.ingredients.join(",");
    const inputArray = searchInput.value.split(",");
    let condition = 1;

    inputArray.forEach((ingredient) => {
      if (!ingredientsString.includes(ingredient.trim())) {
        condition--;
      }
    });

    return condition > 0;
  });

  renderPizzaList(filteredProducts);
}

function renderFilteredPizzaList() {
  const searchInput = document.querySelector(".search input");

  if (searchInput.value) {
    searchIngredients();
  } else {
    renderPizzaList();
  }
}

function renderPizzaList(list) {
  const renderList = list || pizzaList;
  const menuPizzaList = document.querySelector("#pizza-list");

  menuPizzaList.innerHTML = "";

  renderList.forEach((pizza) => {
    const item = document.createElement("li");
    item.className = "pizza__item";
    item.innerHTML = `
            <img class = "pizza__img" src=${pizza.image}>
            <div class = "pizza__name">${pizza.title}</div>
            <div class = "pizza__price">${pizza.price.toFixed(2)} zł</div>
            <div class = "pizza__ingredients">${pizza.ingredients.join(
              ", "
            )}</div> 
            <div class = "pizza__button"><button class="btn__order" data-id=${
              pizza.id
            }>Zamów</button></div> 
            `;
    menuPizzaList.appendChild(item);
  });

  const buyBtns = [...document.querySelectorAll("#pizza-list .btn__order")];
  for (const btn of buyBtns) {
    btn.addEventListener("click", addProductToBasket);
  }
}

function creatBasketUi() {
  const basketTotalValue = basket.getTotalValue();
  const buyAllBtn = document.querySelector("#basket-buyall");
  const basketUl = document.querySelector("#basket-list");
  const btnClearBasket = document.querySelector("#btn-clear");

  buyAllBtn.innerText = `Złóż zamówienie na kwotę ${basketTotalValue.toFixed(
    2
  )} zł`;

  if (basketTotalValue > 0) {
    buyAllBtn.removeAttribute("disabled");
  } else {
    buyAllBtn.setAttribute("disabled", "true");
    buyAllBtn.innerText = `Głodny? Zamów naszą pizzę`;
  }
  basketUl.innerHTML = "";

  for (const oneProductInfo of basket.getBasketSummary()) {
    const newLi = document.createElement("li");
    newLi.innerHTML = ` ${oneProductInfo.text} <button class="btn__delete">Usuń</button> `;

    const deleteBtn = newLi.querySelector("button");

    deleteBtn.dataset.id = oneProductInfo.id;
    deleteBtn.addEventListener("click", removeItem);
    basketUl.appendChild(newLi);
  }

  buyAllBtn.addEventListener("click", buyAllProducts);
  btnClearBasket.addEventListener("click", clearBasketBtn);
}

function addProductToBasket(event) {
  const id = Number(event.target.dataset.id);
  const pizza = pizzaList.find((pizza) => pizza.id === id);

  const newProduct = new Product(pizza.title, pizza.price, pizza.id, 1);
  basket.add(newProduct);

  basket.getBasketSummary();
  creatBasketUi();
}

function removeItem(event) {
  const id = Number(event.target.dataset.id);
  basket.remove(id);
  creatBasketUi();
}

function buyAllProducts() {
  const basketTotalValue = basket.getTotalValue();
  alert(
    `Złożyłeś zamówienie na kwotę: ${basketTotalValue.toFixed(
      2
    )} zł, dziękujemy :) `
  );
  basket.clear();
  creatBasketUi();
}

/* FUNKCJA CLEAR BTN */

function clearBasketBtn() {
  basket.clear();
  creatBasketUi();
}

/* FUNKCJE SORTOWANIA */

function sortByNameAZ() {
  pizzaList.sort(function (a, b) {
    const nameA = a.title.toUpperCase();
    const nameB = b.title.toUpperCase();
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    return 0;
  });

  renderFilteredPizzaList();
}

function sortByNameZA() {
  pizzaList.sort(function (a, b) {
    const nameA = a.title.toUpperCase();
    const nameB = b.title.toUpperCase();
    if (nameB < nameA) {
      return -1;
    }
    if (nameB > nameA) {
      return 1;
    }
    return 0;
  });

  renderFilteredPizzaList();
}

function sortPriceDown() {
  pizzaList.sort(function (a, b) {
    return a.price - b.price;
  });

  renderFilteredPizzaList();
}

function sortPriceUp() {
  pizzaList.sort(function (a, b) {
    return b.price - a.price;
  });

  renderFilteredPizzaList();
}

/*  constructor  Basket, Product, LocalStorage */

class Basket {
  constructor() {
    this.items = this.loadFromLocalStorage() || [];
  }

  clear() {
    this.items.length = 0;
    this.saveToLocalStorage();
  }

  add(item) {
    const idInfoBP = this.items.find((el) => el.id === item.id);
    if (idInfoBP) {
      idInfoBP.quantity++;
    } else {
      this.items.push(item);
    }
    this.saveToLocalStorage();
  }

  getTotalValue() {
    return this.items.reduce(
      (prev, product) => prev + product.price * product.quantity,
      0
    );
  }

  getBasketSummary() {
    return this.items.map((product, i) => {
      return {
        id: product.id,
        text: `
          <div class="item-id">${i + 1}</div>
          <div class="item-name">${product.name}</div>
          <div class="item-price">${product.price.toFixed(2)} zł</div>
          <div class="item-quantity">${product.quantity} szt</div>
          <div class="item-sum"> ${(product.price * product.quantity).toFixed(
            2
          )} zł</div>
        `,
      };
    });
  }

  remove(id) {
    const deleteIdBasket = this.items.find((el) => el.id === id);

    if (deleteIdBasket.quantity > 1) {
      deleteIdBasket.quantity--;
    } else {
      this.items = this.items.filter((el) => el.id !== deleteIdBasket.id);
    }
    this.saveToLocalStorage();
  }

  saveToLocalStorage() {
    localStorage.setItem("basket-items", JSON.stringify(this.items));
  }

  loadFromLocalStorage() {
    return JSON.parse(localStorage.getItem("basket-items"));
  }
}

class Product {
  constructor(name, price, idPizza, quantity) {
    this.name = name;
    this.price = price;
    this.id = idPizza;
    this.quantity = quantity;
  }
}

/* app start */
const basket = new Basket();
let pizzaList;

(async () => {
  pizzaList = await fetchData();

  appStart();
  creatBasketUi();
})();
