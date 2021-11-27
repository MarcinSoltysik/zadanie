
const url = `https://raw.githubusercontent.com/alexsimkovich/patronage/main/api/data.json`;

fetch(url)
    .then(response => response.json())
    
    .then(json => renderPizzaList(json))  
    .catch(error => {
        console.error(error);
    });



const renderPizzaList = (pizzaList) => {
    const menuPizzaList = document.querySelector("#list-pizza");
    pizzaList.forEach( pizza => {
       
        const item = document.createElement('li');
        item.className = 'item__pizza';
        item.innerHTML = `
            <img class = "pizza__img" src=${pizza.image}>
            <div class = "pizza__name">${pizza.title}</div>
            <div class = "pizza__price">${pizza.price.toFixed(2)} zł</div>
            <div class = "pizza__ingredients">${pizza.ingredients}</div>
            <div class = "pizza__button"><button class="btn__order" id=${pizza.id} data-name=${pizza.title} data-price=${pizza.price} data-id=${pizza.id}>Zamów</button></div> 
            `
            menuPizzaList.appendChild(item);
            
    });


    const buyBtns = [...document.querySelectorAll('#list-pizza .btn__order')];
    const basketUl = document.querySelector('#basket-list');
    const buyAllBtn = document.querySelector('#basket-btn');


    const basket = new Basket();
    

    const removeItem = event => {
        
        const id = Number(event.target.dataset.id);
        basket.remove(id);
        creatBasketUi();
        
       
    };



    const creatBasketUi = () => {

        basketUl.innerHTML = '';
        
        for (const oneProductInfo of basket.getBasketSummary()) {

            const newLi = document.createElement('li');
            newLi.innerHTML = ` ${oneProductInfo.text} <button class="btn__delete">Usuń</button>`
           
           
            const deleteBtn = newLi.querySelector("button");
            deleteBtn.dataset.id = oneProductInfo.id;
            deleteBtn.addEventListener('click', removeItem); 
            basketUl.appendChild(newLi);


        }; 


        const basketTotalValue = basket.getTotalValue();
        buyAllBtn.innerText = `Złóż zamówienie na kwotę ${basketTotalValue.toFixed(2)} zł`;

        if (basketTotalValue > 0) {
            buyAllBtn.removeAttribute('disabled');

        } else {
            buyAllBtn.setAttribute('disabled', 'true');
            buyAllBtn.innerText = `Głodny? Zamów naszą pizzę`;
        }
 

    };

    
   
    const addProductToBasket = event => {
            
        const name = event.target.dataset.name;
        const price = Number(event.target.dataset.price);
    
        const newProduct = new Product(name, price);
        basket.add(newProduct);

        basket.getBasketSummary();
        creatBasketUi();
               
    
    };  

    for (const btn of buyBtns) {

        btn.addEventListener('click', addProductToBasket);
        
    };




   const buyAllProducts = () => {
    
        const basketTotalValue = basket.getTotalValue();
        alert(`Złożyłeś zamówienie na kwotę: ${basketTotalValue.toFixed(2)} zł, dziękujemy :) `); 
        basket.clear();
        creatBasketUi(); 

   };

    buyAllBtn.addEventListener('click', buyAllProducts);
    
};



class Basket {
    constructor() {
        this.items = [];   
    }


    clear() {
        this.items.length = 0;  
      
        
        
    }


    add(item) {
        this.items.push(item); 
    }

    getTotalValue() {
        return this.items.reduce((prev, product) => prev + product.price, 0); 
    }



    getBasketSummary() {
        
        return this.items
            .map((product, i) =>  {
               return { 
                   id: i+1,
                   text: `${i + 1} - ${product.name} - ${product.price.toFixed(2)} zł`,
                };
                

            });
            
            
    }



    remove(no) {
        this.items.splice(no - 1, 1); 
    }



}

class Product {
    constructor(name, price) {
        this.name = name;
        this.price = price;
    }
}
