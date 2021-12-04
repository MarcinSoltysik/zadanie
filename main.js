const url = `https://raw.githubusercontent.com/alexsimkovich/patronage/main/api/data.json`;

fetch(url)
  .then((response) => response.json())

  .then((json) => renderPizzaList(json))
  .catch((error) => {
    console.error(error);
  });

const renderPizzaList = (pizzaList) => {
  const menuPizzaList = document.querySelector("#list-pizza");
  pizzaList.forEach((pizza) => {
    const item = document.createElement("li");
    item.className = "item__pizza";
    item.innerHTML = `
            <img class = "pizza__img" src=${pizza.image}>
            <div class = "pizza__name">${pizza.title}</div>
            <div class = "pizza__price">${pizza.price.toFixed(2)} zł</div>
            <div class = "pizza__ingredients">${pizza.ingredients.join(
              ", "
            )}</div> 
            <div class = "pizza__button"><button class="btn__order" id=${
              pizza.id
            } data-name=${pizza.title} data-price=${
      pizza.price
    }  data-productid=${pizza.id}>Zamów</button></div> 
            `;
    menuPizzaList.appendChild(item);
  });

  const buyBtns = [...document.querySelectorAll("#list-pizza .btn__order")];
  const basketUl = document.querySelector("#basket-list");
  const buyAllBtn = document.querySelector("#basket-btn");

  const basket = new Basket();

  const removeItem = (event) => {
    

    const idNo = Number(event.target.dataset.noId);
    basket.remove(idNo);
    

    creatBasketUi();
  };

  const creatBasketUi = () => {
    basketUl.innerHTML = "";

    for (const oneProductInfo of basket.getBasketSummary()) {
      const newLi = document.createElement("li");
      newLi.innerHTML = ` ${oneProductInfo.text} 
            
            <button class="btn__delete">Usuń</button> `;

      const deleteBtn = newLi.querySelector("button");

      deleteBtn.dataset.noId = oneProductInfo.noId;
      deleteBtn.addEventListener("click", removeItem);
      basketUl.appendChild(newLi);
    }

    const basketTotalValue = basket.getTotalValue();
    buyAllBtn.innerText = `Złóż zamówienie na kwotę ${basketTotalValue.toFixed(
      2
    )} zł`;

    if (basketTotalValue > 0) {
      buyAllBtn.removeAttribute("disabled");
    } else {
      buyAllBtn.setAttribute("disabled", "true");
      buyAllBtn.innerText = `Głodny? Zamów naszą pizzę`;
    }
  };

  const addProductToBasket = (event) => {
    const name = event.target.dataset.name;
    const price = Number(event.target.dataset.price);
    const noId = Number(event.target.dataset.productid);

    const newProduct = new Product(name, price, noId, 1);
    basket.add(newProduct);

    basket.getBasketSummary();
    creatBasketUi();
  };

  for (const btn of buyBtns) {
    btn.addEventListener("click", addProductToBasket);
  }

  const buyAllProducts = () => {
    const basketTotalValue = basket.getTotalValue();
    alert(
      `Złożyłeś zamówienie na kwotę: ${basketTotalValue.toFixed(
        2
      )} zł, dziękujemy :) `
    );
    basket.clear();
    creatBasketUi();
  };

  buyAllBtn.addEventListener("click", buyAllProducts);
};

class Basket {
  constructor() {
    this.items = [];
  }

  clear() {
    this.items.length = 0;
  }

  add(item) {
    // this.items.push(item);

    const idInfoBP = this.items.find((el) => el.noId === item.noId);
    if (idInfoBP) {
      idInfoBP.quantity++;
    } else {
      this.items.push(item);
    }
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
       
        noId: product.noId,
        text: `${i + 1} - ${product.name} - ${product.price.toFixed(
          2
        )} zł - ilość: 
                   ${product.quantity} - wartość: ${(
          product.price * product.quantity
        ).toFixed(2)} `,
      };
    });
  }

  // remove(n) {
  //     this.items.splice(n - 1, 1);
  // }

  remove(id) {
    const usuwanieIdKoszyk = this.items.find((el) => el.noId === id);

    if (usuwanieIdKoszyk.quantity > 1) {
      usuwanieIdKoszyk.quantity--;
    } else {
      this.items = this.items.filter((el) => el.noId !== usuwanieIdKoszyk.noId);
    }
  }
}

class Product {
  constructor(name, price, idPizza, quantity) {
    this.name = name;
    this.price = price;
    this.noId = idPizza;
    this.quantity = quantity;
  }
}
