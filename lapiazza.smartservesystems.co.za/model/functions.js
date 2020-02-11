/*===============================
        Global Variables
================================*/
var subCateList = [];
var mainCateList = [];
var itemsInCart = [];
var orderPlaced = false;
var isNewOrder = 'true';
var orderHistory = [];
var currentOrder = null;
var clickedPending = null;
var selectedTable = null;
var voidingTable = null;
var previousTip = 0;
var tip = 0;
var requestItems = [];
var addToOrder = "";
var newItems = [];
var paid = 0;
var staffList = [];
var adminsList = [];
var supervisorList = [];
var isAdminCheck = false;
var ballance = 0;
var payments = [];
var alreadyPaid = 0;
var page = "";
var attendantCliked = "";
var isOrder = false;
var authRun = null;
var currEmpl;
var currEmplName = "Unattended";
var parent;
var table = null;
var total = $('#total_home').text().trim();
var totalQty = $('#total_qty_home').text().trim();
var totalQtyHtml = document.getElementById('total_qty_home');
var totalHtml = document.getElementById('total_home');
var d = new Date();
d.setHours(0,0,0,0);

if (totalQtyHtml != null && totalHtml != null) {
  totalHtml.innerHTML = 0;
  totalQtyHtml.innerHTML = 0;
}

$(document).ready(function(){
  if (page == "home.html") {
  }
  $(document).on("click", "#no_cancel", function(event){
   cancelModal.style.display = "none"; 
  });
  $(document).on("click", "#close_cancel", function(event){
   cancelModal.style.display = "none"; 
  });
  $(document).on("click", "#yes_cancel", function(event){
    sessionStorage.setItem("cartList", null);
    orderHistory = [];
    currentOrder = ''; 
    window.location.href = "../home.html";
  });

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function(event) {
    if (event.target == cancelModal) {
      cancelModal.style.display = "none";
    }
    if (event.target == reqModel) {
      reqModel.style.display == "none";
    }
  }
});

window.onload = function(){
  if (localStorage.getItem("isNewOrder") != null) {
    isNewOrder = localStorage.getItem("isNewOrder");
  }

  if (localStorage.getItem("orderHistory") != "null" && localStorage.getItem("orderHistory") != null) {
    orderHistory = JSON.parse(localStorage.getItem("orderHistory"));
  }else{
    console.log("Order History Not Saved");
  }

  if (sessionStorage.getItem("currentOrder") != "null" && sessionStorage.getItem("currentOrder") != null) {
    currentOrder = sessionStorage.getItem("currentOrder");
  }else{
    console.log("Current Order Not Saved");
  }

 db.collection("Employees").onSnapshot(function(querySnapshot) {
    querySnapshot.forEach((doc) => {
      var empNo = doc.get("empNumber");
      var position = doc.get("position");
      var name = doc.get("name");
      var employee = {emplNo: empNo, position: position, name: name};
      switch(position){
        case "Admin":
          adminsList.push(employee);
          break;
        case "Supervisor":
          supervisorList.push(employee);
          break;
      }
      staffList.push(employee);
    });
  });

  var url = window.location.href.split("/");
  page = url[url.length - 1].trim();
  switch(page){
    case "home.html":
        loadHome();
      break;
    case "cart.html":
        loadCart();
      break;
    case "orderHistory.html":
        loadOrderHistory();
      break;
    case "kitchenWaiters.html":
        loadWaiters();
      break;
    case "kitchen.html":
        loadKitchen();
      break;
    case "posHome.html":
        loadPos();
      break;
    case "sales.html":
        isAdminCheck = true;
        authRun = loadSalesPage;
        authModal.style.display = "block";
        $('#empl_number').focus();
      break;
    case "index.html":
        loadWaiters();
      break;
    case "tableOrder.html":
        loadOrderDetails();
      break;
    default:
        window.location.href = "pages/kitchenWaiters.html";
      break;
  }
}

/*======================================
              Home Page
=======================================*/

function loadHome(){
  showLoader();
  db.collection("LaPiazzaMenu").doc("categories").get().then((doc) => {
    mainCateList = doc.get("categories");
    for (var i = 0; i < mainCateList.length; i++) {
      var category = mainCateList[i];
      addMainCategories(category);
      subCateList.push(doc.get(category));
    }
    selectMainCat(0);
    setTimeout(function(){ hideLoader();}, 2000);
  });
  resetAtMidnight();
  total = 0;
  totalQty = 0;
  if (itemsInCart.length === 0) {
    totalHtml.innerHTML = total;
    totalQtyHtml.innerHTML = totalQty;
  }else{
    for(var item of itemsInCart){
      var price = item.price;
      var qty = item.quantity;
      var subTotal = +qty * +price;
      totalQty = +totalQty + +qty;
      total = (+total + +subTotal).toFixed(2);
    }
    totalHtml.innerHTML = total;
    totalQtyHtml.innerHTML = totalQty;
  }

  $('#main_cats').on('click', 'li', function(e) {
    $('#main_cats').find('li').removeClass('active');
    $(this).addClass('active');
    var cat = $(this).text().trim();
    var a = mainCateList.indexOf(cat);
    selectMainCat(a);
  });

$('#sub_cats').on('click', 'li', function(e) {
  selectSubCat($(this).text().trim());
});

//Increase Button clicks
$('#item_container').on('click', '#increase_home', function(){
  qty = parseInt($(this).siblings('#in_qty_home')[0].value, 10);
  qty = isNaN(qty) ? 0 : qty;
  qty++;
  $(this).siblings('#in_qty_home')[0].value = qty;
  // Change the quantity of items or add an item
  var price = $(this).closest('.w3-display-bottommiddle').siblings('.price').find('h4').text().trim();
  var name = $(this).closest('.something').siblings('.content').find('h1').text().trim();
  price = price.replace(/\R/g, '');
  var itemID = $(this).closest('.nPicker').find('#doc_id').text().trim();
  var subCatego = $(this).closest('.nPicker').find('#item_cate').text().trim();
  var image = $(this).closest('.w3-display-container').find('img').attr("src");
  var item = {id: itemID, quantity: qty, name: name, price: price, img: image, subCate: subCatego};
  addToCart(itemsInCart, item, qty);
  var subTotal = qty * price;
  total = (+total + +price).toFixed(2);
  totalQty = +totalQty + 1;
  totalQtyHtml.innerHTML = totalQty;
  totalHtml.innerHTML = total;
  sessionStorage.setItem("cartList", JSON.stringify(itemsInCart));
});

//Decrease Button clicks
$('#item_container').on('click', '#decrease_home', function(){
  qty = parseInt($(this).siblings('#in_qty_home')[0].value, 10);
  qty = isNaN(qty) ? 0 : qty;
  qty < 1 ? qty = 1 : '';
  qty--;
  $(this).siblings('#in_qty_home')[0].value = qty;
  // Change the quantity of items or remove an item
  var price = $(this).closest('.w3-display-bottommiddle').siblings('.price').find('h4').text().trim();
  var name = $(this).closest('.something').siblings('.content').find('h1').text().trim();
  price = price.replace(/\R/g, '');
  var itemID = $(this).closest('.nPicker').find('#doc_id').text().trim();
  var subCatego = $(this).closest('.nPicker').find('#item_cate').text().trim();
  var image = $(this).closest('.w3-display-container').find('img').attr("src");
  var item = {id: itemID, quantity: qty, name: name, price: price, note: "", img: image, subCate: subCatego};
  var changeTotal = addToCart(itemsInCart, item, qty);
  if (changeTotal) {
    var subTotal = qty * price;
    total = (+total - +price).toFixed(2);
    totalQty = +totalQty - 1;
    totalQtyHtml.innerHTML = totalQty;
    totalHtml.innerHTML = total;
    sessionStorage.setItem("cartList", JSON.stringify(itemsInCart));
  }
});

  $('#item_container').on('keyup', '#chef_note', function(){
    var note = $(this).val();
    var itemID = $(this).closest('.w3-display-bottommiddle').find('#doc_id').text().trim();
    var qty = parseInt($(this).closest('.w3-display-bottommiddle').find('#in_qty_home')[0].value, 10);
    if (qty > 0) {
      const index = itemsInCart.findIndex((e) => e.id === itemID);
      if (index == -1) {
        alert("item not found in cart");
      }else{
        var item = itemsInCart[index];
        item.note = note;
        sessionStorage.setItem("cartList", JSON.stringify(itemsInCart));
      }
    }else{
      alert("please add the item first");
    }
  });
}

function addMainCategories(category){
  var html = '<li class="item">\
                <a data-toggle="pill" class="active" href="#cate1" style="margin-right: 10px;">\
                  <img src="img/all.png" alt="all categories" width="50%">\
                  <h4>' + category + '</h4>\
                </a>\
              </li>';
  $('#main_cats').append(html);
}

function selectMainCat(i){
  $('#sub_cats').empty();
  var subCateg = subCateList[i];
  selectSubCat(subCateg[0]);
  if (subCateg.length > 1) {
    for (var m = 0; m < subCateg.length; m++) {
      var categ = subCateg[m];
      addSubCategories(categ);
    }
  }
}

function selectSubCat(criteria){
  console.log(criteria);
  $('#item_container').empty();
  db.collection("LaPiazzaMenu").where("subCate", "==", criteria)
  .where("available", "==", true).orderBy("name")
  .get().then((querySnapshot) => {
    var images = [];
    querySnapshot.forEach(function(doc) {
          var price = doc.get('price');
          var name = doc.get('name');
          var description = doc.get('description');
          var image = doc.get('picture');
          var itemId = doc.id;
          var html = '<div class="col-sm-4">\
                                <a data-toggle="collapse" data-target="#demo">\
                                    <div class="w3-display-container">\
                                        <div class="price w3-right">\
                                          <h4 id="item_price">R'+ price +'</h4>\
                                        </div>\
                                        <img src='+image+' style="width: 100%">\
                                        <div class="w3-display-bottommiddle w3-large">\
                                            <div class="content">\
                                                <h1>'+ name +'</h1>\
                                                <textarea id="chef_note" name="note" placeholder="Note to chef" style="color: #000"></textarea>\
                                            </div>\
                                            <div class="something">\
                                              <div class="nPicker">\
                                                <div class="value-button" id="decrease_home" value="Decrease Value">-</div>\
                                                <input type="number" id="in_qty_home" value="0">\
                                                <p hidden id="doc_id">'+ itemId +'</p>\
                                                <p hidden id="item_cate">'+ criteria +'</p>\
                                                <div class="value-button" id="increase_home" value="Increase Value">+</div>\
                                              </div> \
                                            </div>\
                                        </div>\
                                    </div>\
                                </a>\
                            </div>'
          $('#item_container').append(html);
      });
  });
}

function addSubCategories(subCategory){
  var html = '<li class="active">\
            <a class="myLink" href="#sub1" data-toggle="pill" style="margin-right: 10px;">' + subCategory + '</a>\
          </li>';
  $('#sub_cats').append(html);
}

function addToCart(arr, obj, qty) {
  const index = arr.findIndex((e) => e.id === obj.id);
  var changeTotal = true;
  if (index === -1) {
      if (qty == 0) {
        changeTotal = false;
        return changeTotal;
      }
      arr.push(obj);
  } else {
    if (qty == 0) {
      arr.splice(index);
      return changeTotal;
    }
      var item = arr[index];
      item.quantity = qty;
  }
  return changeTotal;
}

/*======================================
              Cart Page
=======================================*/

function loadCart(){
  authModal.style.display = "block";
  $('#empl_number').focus();
  var tableHtml = '<option value="Takeaway">Takeaway</option>';
  $('#table_number').append(tableHtml);
  for (var i = 1; i < 31; i++) {
    var tableHtml = '<option value='+i+'>'+i+'</option>';
    $('#table_number').append(tableHtml);
  }
  if (isNewOrder == 'false') {
    addToOrder = localStorage.getItem("addMoreTo");
    db.collection("Orders").doc(addToOrder).get().then((doc) =>{
      newItems = doc.get("pendingItems");
      var total = doc.get("total");
      var balance = doc.get("ballance");
      alreadyPaid = (+total - +balance).toFixed(2);
      table = doc.get("table");
      document.getElementById('table_number').value = table;
    });
  }
  if (sessionStorage.getItem("cartList") != "null" && sessionStorage.getItem("cartList") != null) {
    itemsInCart = JSON.parse(sessionStorage.getItem("cartList"));
    prepareCart();
  }else{
    $('#cart_container').append('<h3>Please add some items in your cart to place an order.</h3>');
    console.log("Cart List Not Saved");
  }

  $('#cart_container').on('click', '#increase_home', function(){
    var price = $(this).closest('.row').find('span#price').text().trim();
    var id = $(this).closest('.row').find('#cartItemId')[0].innerHTML;
    price = price.replace(/\R/g, '');
    qty = parseInt($(this).siblings('#number')[0].value, 10);
    total = $('#total_home').text().trim();
    totalQty = $('#total_qty_home').text().trim();
    qty = isNaN(qty) ? 0 : qty;
    qty++;
    var subTotal = (+qty * +price).toFixed(2);
    totalQty = +totalQty + 1;
    total = (+total + +price).toFixed(2);
    totalHtml.innerHTML = total;
    totalQtyHtml.innerHTML = totalQty;
    $(this).siblings('#number')[0].value = qty;
    $(this).closest('.col-sm-4').find('span#sub_total')[0].innerHTML = subTotal;
    $(this).closest('.row').find('span#quantityNum')[0].innerHTML = qty;
    addToCart(itemsInCart, {id: id}, 1)
    sessionStorage.setItem("cartList", JSON.stringify(itemsInCart));
  });

  $('#cart_container').on('click', '#decrease_home', function(){
    var price = $(this).closest('.row').find('span#price').text().trim();
    var id = $(this).closest('.row').find('#cartItemId')[0].innerHTML;
    price = price.replace(/\R/g, '');
    qty = parseInt($(this).siblings('#number')[0].value, 10);
    total = $('#total_home').text().trim();
    totalQty = $('#total_qty_home').text().trim();
    qty = isNaN(qty) ? 0 : qty;
    qty < 1 ? qty = 1 : '';
    qty--;
    var subTotal = (+qty * +price).toFixed(2);
    totalQty = +totalQty - 1;
    total = (+total - +price).toFixed(2);
    totalHtml.innerHTML = total;
    totalQtyHtml.innerHTML = totalQty;
    $(this).siblings('#number')[0].value = qty;
    $(this).closest('.col-sm-4').find('span#sub_total')[0].innerHTML = subTotal;
    $(this).closest('.row').find('span#quantityNum')[0].innerHTML = qty;
    if (qty === 0) {
      removeFromCart(itemsInCart, id);
    }else{
      addToCart(itemsInCart, {id: id}, -1)
      sessionStorage.setItem("cartList", JSON.stringify(itemsInCart)); 
    }
  });

  $('#table_number').change(function(){
    table = $(this).children("option:selected").val();
  });

  //Remove Item from cart
  $('#cart_container').on('click', '#remove_item', function(){
    var id = $(this).closest('.removeDiv').find('p')[0].innerHTML;
    removeFromCart(itemsInCart, id);
  });

  //Place the order so that it displays in kitchen
  $('#place_order').on('click', function(event){
    event.preventDefault();
    var NumLoc = db.collection("LaPiazzaMenu").doc("categories");
    var itemStatus = 1;
    var itemsDetails = [];
    var orderTotal = 0;
    if (table == null) {
      alert("Please Select a table");
      return;
    }
    var note = "";
    var orderTime = firebase.firestore.Timestamp.fromDate(new Date());
    for (var i = itemsInCart.length - 1; i >= 0; i--) {
      var item = itemsInCart[i];
      var qty = item.quantity;
      var name = item.name;
      var itemNote = item.note;
      if(itemNote == null){
          itemNote = "";
      }
      var price = item.price;
      var itemId = item.id;
      var subCategory = item.subCate;
      var subTotal = (+qty * +price).toFixed(2);
      itemsDetails.push({itemId: itemId, quantity: qty, name: name, note: itemNote, orderedAt: orderTime,
            itemStatus: itemStatus, subTotal: subTotal, subCat: subCategory});
    }
    for(var item = 0; item < itemsDetails.length; item++){
        var currentItem = itemsDetails[item];
        var subTotal = currentItem.subTotal;
        var orderTotal = (+orderTotal + +subTotal).toFixed(2);
    }
    if (itemsInCart.length != 0) {
      showLoader();
      if (isNewOrder == 'true') {
        var date = new Date();
        var myId = date.getTime().toString();
        NumLoc.get().then((doc) =>{
          var orderNum = parseInt(doc.get("orderNumber"), 10);
          if (isNaN(orderNum)) {
            orderNum = 100;
          }
          orderNum++;
          db.collection("Orders").doc(myId).set({
            tableOpenedAt: firebase.firestore.Timestamp.fromDate(new Date()),
            table: table,
            number: orderNum,
            isTableOpen: true,
            servedBy: currEmplName,
            pendingItems: itemsDetails,
            total: orderTotal,
            isPaid: false,
            ballance: orderTotal,
            note: note
          }).then(function() {
            sessionStorage.setItem("currentOrder", myId);
            orderHistory.push(myId);
            NumLoc.update({orderNumber: orderNum});
            localStorage.setItem("orderHistory", JSON.stringify(orderHistory));
            sessionStorage.setItem("cartList", null);
            hideLoader();
            window.location.href = "kitchenWaiters.html";
          }).catch(function(error) {
            console.error("Error writing document: ", error);
            hideLoader();
            alert("Something went wrong, Please check your internet connection or contact Support");
          });
        });
      }else{
        var allItems = newItems.concat(itemsDetails);
        var newTotal = 0;
        for (var i = allItems.length - 1; i >= 0; i--) {
          var item = allItems[i];
          newTotal = (+newTotal + +item.subTotal).toFixed(2);
        }
        var newBalance = (+newTotal - +alreadyPaid).toFixed(2);
        db.collection("Orders").doc(addToOrder).update({pendingItems: allItems, table: table, 
          total: newTotal, ballance: newBalance}).then(function(){
          localStorage.setItem("isNewOrder", true);
          hideLoader();
          window.location.href = "./kitchenWaiters.html";
      });
      }
    }else{
      alert("Your cart is empty! \nPlease go back and add items to place an order.");
    }
  });
}

function prepareCart(){
  $('#cart_container').empty();
  total = 0;
  totalQty = 0;
  console.log(itemsInCart.length);
  if (itemsInCart.length === 0) {
    $('#cart_container').append('<h3>Please add some items in your cart to place an order</h3>');
  }else{
    for(var item of itemsInCart){
      var id = item.id;
      var price = item.price;
      var name = item.name;
      var note = item.note;
      if (note == null) {
        note = "";
      }
      var description = item.description;
      var pic = item.img;
      var qty = item.quantity;
      var subTotal = +qty * +price;
      totalQty = +totalQty + +qty;
      total = (+total + +subTotal).toFixed(2);
      var html = '<div class="card1 w3-card">\
                    <div class="row">\
                      <div class="col-sm-4" style="text-align: center;">\
                        <img src='+pic+' alt="name image" style="width: 100%; border-radius: 10px">\
                      </div>\
                      <div class="col-sm-8">\
                        <div class="row">\
                          <div class="col-sm-8" style="word-wrap: break-word">\
                            <h3>'+ name +'</h3>\
                            <p>'+note+'</p>\
                            <h3 id="price_calc">R<span id="price">'+price+'</span> x <span id="quantityNum">'+qty+'</span> <span class="w3-right" id="sub_total">R'+subTotal+'</span></h3>\
                          </div>\
                          <div class="col-sm-4">\
                            <div class="cnPicker">\
                              <div class="value-button" id="decrease_home" value="Decrease Value">-</div>\
                              <input type="number" id="number" value="'+qty+'" />\
                              <div class="value-button" id="increase_home" value="Increase Value">+</div>\
                            </div>\
                          </div>\
                          <div class="removeDiv">\
                            <button type="button" class="btnRemove" id="remove_item">Remove</button>\
                            <p hidden id="cartItemId">'+id+'</p>\
                          </div>\
                        </div>\
                      </div>\
                    </div>\
                  </div>'
      $('#cart_container').append(html);
    }
    totalHtml.innerHTML = total;
    totalQtyHtml.innerHTML = totalQty;
  }
}

function removeFromCart(arr, id) {
  const index = arr.findIndex((e) => e.id === id);
  if (index != -1) {
    arr.splice(index, 1);
    prepareCart();
    sessionStorage.setItem("cartList", JSON.stringify(itemsInCart));
  }
}

function resetAtMidnight() {
    var now = new Date();
    var night = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        11, 30, 0
    );
    var msToMidnight = night.getTime() - now.getTime();

    setTimeout(function() {
        resetOrderNumber();
        resetAtMidnight();
    }, msToMidnight);
}

function resetOrderNumber(){
  var NumLoc = db.collection("LaPiazzaMenu").doc("categories");
  var startOrderNumber = 100;
  NumLoc.update({orderNumber: orderNum});
}

/*======================================
              Order History
=======================================*/
function loadOrderHistory(){
  prepareOrderHistory();
  //Repeat an order from order history
  $('#ordered_item_container').on('click', '#repeat_order', function(){
    var orderId = $(this).closest('.header').find('#order_id')[0].innerHTML;
    console.log(orderId);
    db.collection("Orders").doc(orderId).get().then((doc) => {
      var orderNum = 2102;
      var itemsDetails = doc.get("items");
      var orderTotal = doc.get("total");
      var table = 12;
      placeOrder(table, orderNum, itemsDetails, orderTotal);
    })
    .catch(function(error) {
      alert("Failed to retreive the order, Please try again or Place a new order.");
    });
  });
}

function placeOrder(table, orderNum, itemsDetails, orderTotal){
  var myId = new Date().getTime().toString();
  db.collection("Orders").doc(myId).set({
    orderedAt: firebase.firestore.Timestamp.fromDate(new Date()),
    table: table,
    number: orderNum,
    orderStatus: 1,
    items: itemsDetails,
    total: orderTotal,
    isPaid: false,
    ballance: orderTotal
  })
  .then(function() {
    sessionStorage.setItem("currentOrder", myId);
    orderHistory.push(myId);
    localStorage.setItem("orderHistory", JSON.stringify(orderHistory));
    sessionStorage.setItem("cartList", null);
    window.location.href = "./orderHistory.html";
  })
  .catch(function(error) {
    alert("Something went wrong please try again.");
  });
}

function prepareOrderHistory(){
  orderHistory = JSON.parse(localStorage.getItem("orderHistory"));
  console.log(orderHistory.length);
  $('#ordered_item_container').empty;
  var orderedItems = [];
  var notes = [];
  if (orderHistory.length == 0) {
    $('#ordered_item_container').append('<h2>You have no orders in your order history, click on the button above to place a new order.</h2>')
  }
  for (var i = orderHistory.length - 1; i >= 0; i--) {
    var order = orderHistory[i];
    db.collection("Orders").doc(order).get().then((doc) =>{
      items = doc.get("items");
      var status = doc.get("orderStatus");
      var total = doc.get("total");
      var table = doc.get("table");
      var orderNum = doc.get("number");
      var note = doc.get("note");
      var id  = doc.id;
      var date = doc.get("orderedAt").toDate().toLocaleString();
      var selected = "selected";
      var recieved = "";
      var inProgress = "";
      var served = "";
      var readyText = "Ready";
      switch(status) {
        case 4:
            readyText = "Served";
            served = selected;
            break;
        case 3:
            served = selected;
          break;
        case 2:
            inProgress = selected;
          break;
        default:
            recieved = selected;
      }
      orderedItems.push(items);
      notes.push(note);
      var html = '<div class="col-sm-6">\
                    <div class="order1">\
                      <div class="header">\
                        <h1>ORDER #<span>'+orderNum+'</span></h1>\
                        <p class="date">'+date+'</p>\
                        <p id="order_id" hidden>'+id+'</p>\
                        <h3 class="w3-right" id="repeat_order">Repeat Order</h3>\
                      </div>\
                      <hr/>\
                      <div id="order_item_container"></div>\
                      <hr/>\
                      <div class="orderTotal">\
                        <h3>Total</h3>\
                        <h3 class="totalPrice">R<span>'+total+'</span></h3>\
                      </div>\
                      <hr/>\
                      <div class="orderProgress">\
                        <h3 class='+recieved+'>Received</h3>\
                        <h3 class='+inProgress+'>In Progress</h3>\
                        <h3 class='+served+'>'+readyText+'</h3>\
                      </div>\
                    </div>\
                  </div>'
    $('#ordered_item_container').append(html);
    })
    .catch(function(error) {
      // alert("Something went wrong please try again.");
    });
  }
  setTimeout(function() { addItemsToOrder(orderedItems, notes); }, 1000);
}

function addItemsToOrder(orderedItems, notes){
  var children = $('#ordered_item_container').children();
  for (var i = children.length - 1; i >= 0; i--) {
    var child = children[i];
    var order = orderedItems[i];
    var note = notes[i];
    $(child).find('#order_item_container').empty();
    for (var w = order.length - 1; w >= 0; w--) {
      var item = order[w];
      var qty = item.quantity;
      var name = item.name;
      var price = item.subTotal;
      var itemHtml = '<div class="ordered-items">\
                        <h3><span>'+qty+'</span> x <span>'+name+'</span></h3>\
                        <h3 class="sub-price">R<span>'+price+'</span></h3>\
                      </div>'
      $(child).find('#order_item_container').append(itemHtml);
    }
    if (note != null && note.length > 2) {
      $(child).find('#order_item_container').append('<h3>'+note+'</h3>');
    }
  }
}

/*======================================
              Kitchen Page
=======================================*/
function loadKitchen(){
  parent = $('#kitchen_order_items');
  prepareKitchenOrders(parent);

  $('#kitchen_order_items').on('click', '#progress', function(){
    var index = $(this).val();
    var newStatus = $(this).text().trim();
    var id = $(this).closest('.kitchen-progress-btn').find('p').text().trim();
    db.collection("Orders").doc(id).get().then((doc) =>{
      var pendingItems = doc.get("pendingItems");
      var item = pendingItems[index];
      if (newStatus == "Preparing") {
        item.itemStatus = 2;
      }else{
        item.itemStatus = 3;
      }
      pendingItems[index] = item;
      db.collection("Orders").doc(id).update({pendingItems: pendingItems});
    });
  });
}

function prepareKitchenOrders(parent){
  db.collection("Orders").where("tableOpenedAt", ">", d).where("isTableOpen", "==", true).orderBy("tableOpenedAt", "asc")
  .onSnapshot(function(querySnapshot) {
    $('#kitchen_order_items').empty();
    if (querySnapshot.size == 0) {
      $('#kitchen_order_items').append('<h2>No pending orders.</h2>');
    }
    var orderItems = [];
    var dates = [];
    querySnapshot.forEach((order) =>{
    	var doc = order.data();
    	doc.id = order.id;
      var status = doc.isTableOpen;
      var items = doc.pendingItems;
      var unReadyItems = [];
      for (var i = items.length - 1; i >= 0; i--) {
        var checkItem = items[i];
        if (checkItem.itemStatus < 3) {
          unReadyItems.push(checkItem);
        }
      }
      if (unReadyItems.length > 0) {
        var orderNumber = doc.number;
        var table = doc.table;
        var note = doc.note;
        if (note == null) {
          note = "";
        }
        var waiterName = doc.servedBy;
        if (waiterName == null) {
          waiterName = "Unattended";
        }
        var orderId = doc.id;
        var tableHtml = '<div class="row">\
                          <div class="content">\
                            <div class="header w3-center">\
                              <span class="">'+waiterName+'</span><span class="w3-right">T'+table+'</span>\
                            </div>\
                            <div id="'+doc.id+'items"></div>\
                          </div>\
                        </div>';
        $('#kitchen_order_items').append(tableHtml);
        for (var i = items.length - 1; i >= 0; i--) {
         var item = items[i];
         var qty = item.quantity;
         var name = item.name;
         var note = item.note;
         var time = item.orderedAt.toDate();
         if (note == null) {
          note = "";
         }
         var itemStatus = item.itemStatus;
         var bgColor = "#fff";
          if (itemStatus == 1) {
            status = "Preparing";
          }else {
            bgColor = "#e3d059";
            status = "Ready";
          }
         var itemHtml = '<div class="order" style="background-color: '+bgColor+'">\
                          <div class="w3-row">\
                            <span id="'+doc.id+''+i+'time" class="time w3-left"></span>\
                            <div class="kitchen-progress-btn">\
                              <p hidden>'+doc.id+'</p>\
                              <button type="button" id="progress" value="'+i+'" class="w3-card">'+status+'</button>\
                            </div>\
                          </div>\
                          <div class="item">\
                            <div class="name-and-price">\
                              <h2>'+qty+' x '+name+'</h2>\
                            </div>\
                            <div class="note-to-chef">'+note+'</div>\
                          </div>\
                        </div>';
          if (itemStatus < 3) {
            $('#'+doc.id+'items').append(itemHtml);
            var clockElem = $('#'+doc.id+''+i+'time')[0];
            var now = new Date();
            var diff = now - time;
            var hours   = Math.floor(diff / 3.6e6);
            var min = Math.floor((diff % 3.6e6) / 6e4);
            var sec = Math.floor((diff % 6e4) / 1000);
            clockCount(clockElem, hours, min, sec);
          }
        }
      }
    });
  });
}

function addItemsKitchen(parent, items, dates){
  var children = $(parent).children();
  console.log(children.length);
  for (var i = children.length - 1; i >= 0; i--) {
    var child = children[i];
    var order = items[i];
    $(child).find('#kitchen_items').empty();
    for (var w = order.length - 1; w >= 0; w--) {
      var item = order[w];
      var qty = item.quantity;
      var name = item.name;
      var html = '<h3><span>'+qty+'</span> x <span>'+name+'</span></h3>'
      $(child).find('#kitchen_items').append(html);
    }
    var clockElem = $(child).find('#time-elapsed')[0];
    var now = new Date();
    var time = dates[i];
    var diff = now - time;
    var hours   = Math.floor(diff / 3.6e6);
    var min = Math.floor((diff % 3.6e6) / 6e4);
    var sec = Math.floor((diff % 6e4) / 1000);
    clockCount(clockElem, hours, min, sec);
  }
}

/*======================================
              Waiters page
=======================================*/
function loadWaiters(){
  var parent = $('#waiter_order_items');
  localStorage.setItem("isNewOrder", true);
  prepareWaiterTables();
  // prepareWaiterOrders(parent);

  $('#table_row').on('click', '.table', function(){
    var id = $(this).find('#order_id').text().trim();
    sessionStorage.setItem("selectedTableId", id);
    window.location.href = "tableOrder.html";
  });

  $('#table_row').on('click', '.add-items', function(e){
    e.stopPropagation();
    var id = $(this).closest('.add-close-btns').find('#order_id').text().trim();
    localStorage.setItem("addMoreTo", id);
    localStorage.setItem("isNewOrder", false);
    window.location.href = "../home.html";
  });

  $('#table_row').on('click', '.close-table', function(e){
    e.stopPropagation();
    var id = $(this).closest('.add-close-btns').find('#order_id').text().trim();
    sessionStorage.setItem("selectedTableId", id);
    window.location.href = "posHome.html";
  });
  // Open the verification modal
  // $('#kitchen_requests').on('click', function(){
  //   isOrder = false;
  //   attendantCliked = $(this).find('#req_id')[0].innerHTML.trim();
  //   authRun = respondRequest; 
  //   authModal.style.display = "block";
  //   $('#empl_number').focus();
  // });
}
function prepareWaiterTables(){
  $('#table_row').empty();
  var d = new Date();
  d.setHours(0,0,0,0);
  db.collection("Orders").where("tableOpenedAt", ">", d).where("isTableOpen", "==", true).orderBy("tableOpenedAt", "asc")
  .onSnapshot(function(querySnapshot) {
    $('#table_row').empty();
    var previouslyReady = JSON.parse(localStorage.getItem("readyOrders"));
    console.log(previouslyReady);
  	if (previouslyReady == null) {
  		previouslyReady = [];
 		}
    if (querySnapshot.size == 0) {
      $('#table_row').append('<h2 class="w3-center">No pending Requests.</h2>');
    }
    querySnapshot.forEach((doc) =>{
      var table = doc.get("table");
      var pendingItems = doc.get("pendingItems");
      var waiterName = doc.get("servedBy");
      var orderId = doc.id;
      var preparing = 0;
      var ready = 0;
      var received = 0;
      if (table == "Takeaway") {
        table = "/A"
      }
      for (var i = pendingItems.length - 1; i >= 0; i--) {
        var item = pendingItems[i];
        var status = item.itemStatus;
        switch(status){
          case 3:
            ready++;
            break;
          case 2:
            preparing++;
            break;
          case 1:
            received++;
            break;
        }
      }
      var wasReady = previouslyReady.includes(orderId);
      var style = "";
      if (ready > 0) {
        style = 'style="background-color: #28a745"';
        if (!wasReady) {
        	playSound("pages");
        	previouslyReady.push(orderId);
        }
      }else{
      	if (wasReady) {
      		var index = previouslyReady.indexOf(orderId);
      		previouslyReady.splice(index, 1);
      	}
      }
      localStorage.setItem("readyOrders", JSON.stringify(previouslyReady));
      var html = '<div class="col-sm-3">\
                      <div class="table" '+style+'>\
                        <div class="name-and-table"><span>'+waiterName+'</span><span class="w3-right">T'+table+'</span></div>\
                        <div class="status-and-totals w3-center">\
                          <h2 class="status ready">'+ready+' Ready</h2>\
                          <h2 class="status">'+preparing+' Preparing</h2>\
                          <h2 class="status">'+received+' Pending</h2>\
                        </div>\
                        <div class="add-close-btns">\
                          <p hidden id="order_id">'+orderId+'</p>\
                          <button class="add-items">Add</button>\
                          <div class="w3-right">\
                            <button class="close-table">Close</button>\
                          </div>\
                        </div>\
                      </div>\
                  </div>'
      $('#table_row').append(html);
    });
  });
}

function serveOrder () {
  var clickedOrder = db.collection("Orders").doc(attendantCliked);
  clickedOrder.get().then((doc) =>{
    var status = doc.get("orderStatus");
    if (status == 3) {
      clickedOrder.update({orderStatus: 4, servedBy: currEmplName});
    }else{
      alert("Order not yet ready.")
    }
    currEmpl = null;
  });
}

function respondRequest (){
  db.collection("Requests").doc(attendantCliked)
  .update({responded: true, respondedBy: currEmpl});
  currEmpl = null;
}

function prepareWaiterOrders(parent){
  var d = new Date();
  d.setHours(0,0,0,0);
  db.collection("Orders").where("orderedAt", ">", d).orderBy("orderedAt", "asc")
  .onSnapshot(function(querySnapshot) {
    $('#waiter_order_items').empty();
    var orderItems = [];
    var dates = [];
    var ordersToShow = [];
    querySnapshot.forEach((doc) =>{
      var oStatus = doc.get("orderStatus");
      if (oStatus < 4) {
        var orderNumber = doc.get("number");
        var table = doc.get("table");
        var items = doc.get("items");
        var time = doc.get("orderedAt").toDate();
        var waiterName = doc.get("servedBy");
        if (waiterName == null) {
          waiterName = "Unattended";
        }
        var orderId = doc.id;
        var order = {id: orderId, servedBy: waiterName, table: table, items: items, 
          time: time, orderNum: orderNumber, status: oStatus};
        ordersToShow.push(order);
      }
    });
    if (querySnapshot.size == 0) {
      $('#waiter_order_items').append('<h2>No pending orders.</h2>');
    }else{
      for (var i = 0; i < ordersToShow.length; i++) {
        orderToShow  = ordersToShow[i];
        var status = orderToShow.status;
        var orderNumber = orderToShow.orderNum;
        var table = orderToShow.table;
        var items = orderToShow.items;
        var time = orderToShow.time;
        var orderId = orderToShow.id;
        waiterName = orderToShow.servedBy;
        dates.push(time);
        orderItems.push(items);
        var selected = "selected";
        var recieved = "";
        var inProgress = "";
        var served = "";
        switch(status) {
          case 3:
            served = selected;
            break;
          case 2:
            inProgress = selected;
            break;
          case 1:
            recieved = selected;
            break;
        }
        var html = '<div class="waiter-item-1 w3-card">\
                      <div class="order1">\
                        <div class="header">\
                          <div class="orderNumber">\
                            <h1 class="w3-wrap" style="background: #336699">ORDER #<span>'+orderNumber+'</span></h1>\
                            <p class="time w3-right" id="time-elapsed"></p>\
                            <div class="waiter-name">'+waiterName+'</div>\
                          </div>\
                        </div>\
                        <div class="table">\
                          <h3>Table #'+table+'</h3>\
                          <h4 id="add_items">Add more</h4>\
                        </div>\
                        <div class="ordered-items" id="kitchen_items"></div>\
                        <div class="orderProgress">\
                          <h4 class="'+recieved+' b-right" id="received">Received</h4>\
                          <h4 class="'+inProgress+' b-right" id="in_progress">In Progress</h4>\
                          <h4 class='+served+' id="served">Ready</h4>\
                          <p id="order_id" hidden>'+orderId+'</p>\
                        </div>\
                      </div>\
                    </div>'
        $('#waiter_order_items').append(html);
      }
    }
    setTimeout(function() { addItemsKitchen(parent, orderItems, dates); }, 1000);
  });
}

function prepareRequests(){
  db.collection("Requests").orderBy("requestedAt", "asc").where("responded", '==', false).onSnapshot(function(querySnapshot) {
    var items = [];
    var dates = [];
    $('#kitchen_requests').empty();
    if (querySnapshot.size == 0) {
      $('#kitchen_requests').append('<h2>No pending Requests.</h2>');
    }
    querySnapshot.forEach((doc) =>{
      var table = doc.get("table");
      var reqId = doc.id;
      var itemsDetails = doc.get("items");
      var time = doc.get("requestedAt").toDate();
      dates.push(time);
      items.push(itemsDetails);
      var html = '<div class="request_card w3-card">\
                    <div class="header">\
                      <h2>Table #<span>'+table+'</span></h2>\
                      <p class="w3-right" id="req_clock"></p>\
                      <p hidden id="req_id">'+reqId+'</p>\
                    </div>\
                    <div class="request_items"></div>\
                  </div>'
      $('#kitchen_requests').append(html);
    });
    setTimeout(function() { addRequestItems(items, dates); }, 2000);
  });
}

function addRequestItems(items, dates){
  var children = $('#kitchen_requests').children();
  for (var i = children.length - 1; i >= 0; i--) {
    var child = children[i];
    var item = items[i];
    for (var w = 0; w < item.length; w++) {
      $(child).find('.request_items').append('<h4>'+item[w]+'</h4>')
    }
    var clockElem = $(child).find('#req_clock')[0];
    var now = new Date();
    var time = dates[i];
    var diff = now - time;
    var hours   = Math.floor(diff / 3.6e6);
    var min = Math.floor((diff % 3.6e6) / 6e4);
    var sec = Math.floor((diff % 6e4) / 1000);
    clockCount(clockElem, hours, min, sec);
  }
}

/*======================================
              TableOrder
=======================================*/
function loadOrderDetails(){
  $('.pending-items-side').not(':first').empty();
  $('.served-items').empty();
  var id = sessionStorage.getItem("selectedTableId");
  var selectdOrder = null;
  db.collection("Orders").doc(id).get().then((doc) =>{
    selectdOrder = doc.data();
    var pendingItems = doc.get("pendingItems");
    var servedItems = doc.get("servedItems");
    selectedTable = doc.get("table");
    if (servedItems == null || servedItems.length == 0) {
      $('.served-items').append('<h2>No items served yet</h2>');
    }else{
      for (var i = servedItems.length - 1; i >= 0; i--) {
        var item = servedItems[i];
        var qty = item.quantity;
        var name = item.name;
        var note = item.note;
        var subTotal = item.subTotal;
        var status = item.itemStatus;
        var html = '<div class="item">\
                        <div class="name-and-price">\
                            <h2>'+qty+' x '+name+' <span class="w3-right">R'+subTotal+'</span></h2> \
                        </div>\
                        <div class="note-to-chef">'+note+'</div>\
                    </div>';
        $('.served-items').append(html);
      }
    }
    if (pendingItems.length > 0) {
      for (var i = pendingItems.length - 1; i >= 0; i--) {
        var item = pendingItems[i];
        var qty = item.quantity;
        var name = item.name;
        var note = item.note;
        var subTotal = item.subTotal;
        var status = item.itemStatus;
        var bgColor = "#fff";
        if (status == 2) {
          bgColor = "#e3d059";
        }else if (status == 3) {
          bgColor = "#28a745";
        }
        var inActive = "active-status";
        var received = "";
        var preparing = "";
        var ready = "";
        switch(status){
          case 1:
            preparing = inActive;
            ready = inActive;
            break;
          case 2:
            received = inActive;
            ready = inActive;
            break;
          case 3:
            preparing = inActive;
            received = inActive;
            break;
        }
        var html = '<div class="pending-item">\
                      <div id="voiding_item" style="background-color: '+bgColor+'">\
                      <div class="item" style="margin-bottom: 10px;">\
                        <div class="name-and-price">\
                            <h2><span id="qty">'+qty+'</span> x <span id="name">'+name+'</span> <span id="price" class="w3-right">R'+subTotal+'</span></h2> \
                        </div>\
                        <div class="note-to-chef">'+note+'</div>\
                        <div class="orderProgress" style="background-color: '+bgColor+'; padding: 5px;">\
                            <p id="index" hidden>'+i+'</p>\
                            <h4 class='+received+' id="received">Received</h4>\
                            <h4 class='+preparing+' id="in_progress">Preparing</h4>\
                            <h4 class='+ready+' id="served">Ready</h4>\
                            <p id="order_id" hidden>'+id+'</p>\
                        </div>\
                      </div>\
                    </div>\
                    </div>';
        $('.pending-items-side').append(html);
      }
    }else{
      $('.pending-items-side').append('<h2>No items pending</h2>');
    }
  });

  $('.pending-item').on('click', '#voiding_item', function(e){
    var name = $(this).find('#name')[0].innerHTML;
    var qty = $(this).find('#qty')[0].innerHTML;
    var orderId = $(this).find('#order_id')[0].innerHTML;
    var index = $(this).find('#index')[0].innerHTML;
    var price = $(this).find('#price')[0].innerHTML;
    price = price.substr(1).trim();
    clickedPending = {itemName: name, itemQty: qty, orderId: orderId, index: index, price:price}
    // Get the modal
        var modal = document.getElementById("voiding");

        // Get the <span> element that closes the modal
        var span = document.getElementsByClassName("close")[0];
        modal.style.display = "block";

        // When the user clicks on <span> (x), close the modal
        span.onclick = function() {
          modal.style.display = "none";
        }

        // When the user clicks anywhere outside of the modal, close it
        window.onclick = function(event) {
          if (event.target == modal) {
            modal.style.display = "none";
          }
        }
  });

  $('#void_table').on('click', function(){
    if (selectdOrder == null) {
      showSnackbar("Table not selected properly, void canceled");
      return;
    }
    voidingTable = selectdOrder;
    voidingTable.id = id;
    isAdminCheck = true;
    authRun = voidTable;
    authModal.style.display = "block";
    $('#empl_number').focus();
  });

  $('#serve_item').on('click', function(){
    showLoader();
    var index = clickedPending.index;
    var id = clickedPending.orderId;
    console.log(index);
    console.log(id);
    db.collection("Orders").doc(id).get().then((doc) =>{
      var pendingItems = doc.get("pendingItems");
      var servedItems = doc.get("servedItems");
      if (servedItems == null) {
        servedItems = [];
      }
      var item = pendingItems[index];
      var name = item.name;
      item.itemStatus = 4;
      servedItems.push(item);
      pendingItems.splice(index, 1);
      db.collection("Orders").doc(id).update({pendingItems: pendingItems, servedItems: servedItems})
      .then(function(){
        hideLoader();
        window.location.reload();
      });
    });
  });

  $('#void_item').on('click', function(){
    var modal = document.getElementById("voiding");
    modal.style.display = "none";
    isAdminCheck = true;
    authRun = voidItem;
    authModal.style.display = "block";
    $('#empl_number').focus();
  });
}

function voidItem (voider){
    if (clickedPending != null && selectedTable != null) {
      showLoader();
      var name = clickedPending.itemName;
      var qty = clickedPending.itemQty;
      var id = clickedPending.orderId;
      var price = clickedPending.price;
      var index = clickedPending.index;
      db.collection("Orders").doc(id).get().then((doc) =>{
        var pendingItems = doc.get("pendingItems");
        var total = doc.get("total");
        var ballance = doc.get("ballance");
        total = (+total - +price).toFixed(2);
        ballance = (+ballance - +price).toFixed(2);
        pendingItems.splice(index, 1);
        db.collection("Orders").doc(id).update({pendingItems: pendingItems, total: total, ballance: ballance});
      }).then(function(){
        db.collection("LaPiazzaVoids").doc().set({
          itemName: name,
          quantity: qty,
          orderId: id,
          time: firebase.firestore.Timestamp.fromDate(new Date()),
          TableNumber: selectedTable,
          authorisedBy: voider
        }).then(function(){
          hideLoader();
          window.location.reload();
        });
      });
    }else{
      alert("Something went wrong!");
    }
}

function voidTable(voider){
  var servedItems = voidingTable.servedItems;
  var pendingItems = voidingTable.pendingItems;
  if (servedItems != null && servedItems.length > 0) {
    showSnackbar("This table has served items, Unable to void table\n Please Close the table from POS");
    return;
  }
  showLoader();
  for (var i = pendingItems.length - 1; i >= 0; i--) {
    var item = pendingItems[i];
    var name = item.name;
    var qty = item.quantity;
    var id = voidingTable.id;;
    var selectedTable = voidingTable.table;
    db.collection("LaPiazzaVoids").doc().set({
      itemName: name,
      quantity: qty,
      orderId: id,
      time: firebase.firestore.Timestamp.fromDate(new Date()),
      TableNumber: selectedTable,
      authorisedBy: voider
    });
  }

  setTimeout(function(){
    db.collection("Orders").doc(voidingTable.id).delete().then(function(){
      hideLoader();
      window.location.href = "kitchenWaiters.html";
    }, 3000);
  });
}

/*======================================
              POS Page
=======================================*/

function loadPos(){
  var id = sessionStorage.getItem("selectedTableId");
  var parent = $('#pos_h_orders');
  var amountEntered = 0;
  var orderId = id;
  if (currEmpl == null) {
    authRun = loadPos;
    authModal.style.display = "block";
    $('#empl_number').focus();
    return;
  }else{
    selectOrderToPay(id);
  }

  $('#pos_keypad').on('click', 'div', function(){
    var keyClicked = $(this).text().trim();
    switch (keyClicked){
      case "5c":
        amountEntered = (+amountEntered + 0.05).toFixed(2);
        break;
      case "10c":
        amountEntered = (+amountEntered + 0.10).toFixed(2);
        break;
      case "20c":
        amountEntered = (+amountEntered + 0.20).toFixed(2);
        break;
      case "50c":
        amountEntered = (+amountEntered + 0.50).toFixed(2);
        break;
      case "R1":
        amountEntered = (+amountEntered + 1).toFixed(2);
        break;
      case "R2":
        amountEntered = (+amountEntered + 2).toFixed(2);
        break;
      case "R5":
        amountEntered = (+amountEntered + 5).toFixed(2);
        break;
      case "R10":
        amountEntered = (+amountEntered + 10).toFixed(2);
        break;
      case "R20":
        amountEntered = (+amountEntered + 20).toFixed(2);
        break;
      case "R50":
        amountEntered = (+amountEntered + 50).toFixed(2);
        break;
      case "R100":
        amountEntered = (+amountEntered + 100).toFixed(2);
        break;
      case "R200":
        amountEntered = (+amountEntered + 200).toFixed(2);
        break;
    }
    $('#amount_entered').val(amountEntered);
  });

  $('.posKeypad').on('click', 'div', function(){
    var keyClicked = $(this).text().trim();
    if (keyClicked == ".") {
      amountEntered = (amountEntered).toFixed(1);
    }else{
     amountEntered = keyInDigit(amountEntered, keyClicked);
    }
    $('#amount_entered').val(amountEntered);
  });

  $('#tip_input').focus(function(){
    previousTip = $(this).val();
    if (previousTip == null || previousTip == "") {
      previousTip = 0;
    }
  });

  $('#tip_input').focusout(function(){
    tip = $(this).val();
    if (tip == null || tip == "" || tip == 0) {
      tip = 0;
      ballance = (+ballance - +previousTip).toFixed(2);
      console.log("minus");
    }else{
      ballance = (+ballance + +tip).toFixed(2);
    }
    db.collection("Orders").doc(id).update({tip: tip});
    $('#phd_ballance').val(ballance);
  });
  
  $('#phd_ballance').focusout(function(){
    ballance = $(this).val();
    if (ballance == null || ballance == "") {
      ballance = 0;
    }
    db.collection("Orders").doc(id).update({ballance: ballance});
  });

  $('#side_buttons').on('click', 'div', function(){
    var button = $(this).text().trim();
    switch(button){
      case "Del":
        amountEntered = amountEntered.toString().slice(0, -1);
        break;
      case "Clear":
        amountEntered = (0).toFixed(2);
        break;
      case "Print Bill":
        printBill();
        break;
      case "Print 1 Receipt":
        printReciept(false);
        break;
      case "Print 2 Receipts":
        printReciept(true);
        break;
      default:
        clearAndClosePos();
    }
    $('#amount_entered').val(amountEntered);
  });

  $('.phiMethodBtn').on('click', 'h1', function(){
    var method = $(this).text().trim();
    var amount = parseFloat($('#amount_entered').val()).toFixed(2);
    if (ballance == 0) {
      alert("This order has already been paid for!");
      return;
    }
    if (amount == 0) {
      alert("Please enter amount to make a payment.");
    }else{
      showLoader();
      if (amount < ballance) {
        var newPayment = {method: method, amount: amount};
        if (payments == null) {
          payments = [];
          payments.push(newPayment);
        }else{
          payments.push(newPayment);
        }
        var isPaid = false;
        ballance = (+ballance - +amount).toFixed(2);
        if (ballance < 0) {
        	ballance = 0;
        }
        var change = (0).toFixed(2);
        paid = (+paid + +amount).toFixed(2);
        db.collection("Orders").doc(orderId)
        .update({payments: payments, paid: paid, ballance: ballance, isPaid: isPaid})
        .then(function(){
          hideLoader();
        	$('#phd_change').text(change);
        	$('#phd_ballance').val(ballance);
        });
      }else{
        var newPayment = {method: method, amount: ballance};
        if (payments == null) {
          payments = [];
          payments.push(newPayment);
        }else{
          payments.push(newPayment);
        }
        isPaid = true;
        var change = (+amount - +ballance).toFixed(2);
        paid = (+paid + +ballance).toFixed(2);
        ballance = 0;
        $('#phd_change').text(change);
        $('#phd_ballance').val("0.00");
        db.collection("Orders").doc(orderId)
        .update({isTableOpen: false, payments: payments, paid: paid, ballance: 0, isPaid: isPaid})
        .then(function(){
          hideLoader();
        });
      }
      amountEntered = 0;
      $('#phd_paid').text(amount);
      $('#amount_entered').val("0.00");
      $('#tip_input').val("0.00");
    }
  });
}

function clearAndClosePos(){
  $('#pos_selected_order').empty();
  amountEntered = (0).toFixed(2);
  $('#phd_ballance').val("0.00");
  $('#phd_paid').text("0.00");
  $('#phd_change').text("0.00");
  window.location.href = "kitchenWaiters.html";
}

function printBill(){
  var loadedItems = $('#order_item_container').children();
  if(loadedItems.length == 0){
    alert("Please Wait a second for items to be loaded first!");
    return;
  }
  var date = new Date();
  var str = moment(date).format('MMM D, YYYY: H:mm');
  $('#bill_date').text(str);
  $('.bill-amounts').children().hide();
  $('.bill-amounts').children().slice(0,3).show();
  $('#not_print').hide();
  $('.bill-print').show();
  window.print();
  setTimeout(function(){ 
    $('#not_print').show(); 
    $('.bill-print').hide();
  },300);
}

function printReciept(printTwo){
  var loadedItems = $('#order_item_container').children();
  if(loadedItems.length == 0){
    alert("Please Wait a second for items to be loaded first!");
    return;
  }
  var date = new Date();
  var str = moment(date).format('MMM D, YYYY: H:mm');
  $('#bill_date').text(str);
  $('.bill-amounts').children().hide();
  $('.bill-amounts').children().slice(0,2).show();
  var totalPaid = 0;
  var cardPaid = 0;
  var cashPaid = 0;
  var voucherPaid = 0;
  if (payments == null) {
    alert("Please make a payment first or Print Bill instead.");
    return;
  }
  for (var i = 0; i < payments.length; i++) {
    var payment = payments[i];
    var amount = payment.amount;
    var method = payment.method;
    switch(method){
      case "Cash":
        cashPaid = (+cashPaid + +amount).toFixed(2);
        break;
      case "Card":
        cardPaid = (+cardPaid + +amount).toFixed(2);
        break;
      case "Voucher":
        voucherPaid = (+voucherPaid + +amount).toFixed(2);
        break;
    }
    totalPaid = (+totalPaid + +amount).toFixed(2);
  }
  $('.receiptTip').text(tip);
  if (cashPaid > 0) {
    var cashHtml = '<h4>Cash:<span class="w3-right ss-b-mr">'+cashPaid+'</span></h4>';
    $('.bill-amounts').append(cashHtml);
  }
  if (cardPaid > 0) {
    var cardHtml = '<h4>Card:<span class="w3-right ss-b-mr">'+cardPaid+'</span></h4>';
    $('.bill-amounts').append(cardHtml);
  }
  if (voucherPaid > 0) {
    var voucherHtml = '<h4>Voucher:<span class="w3-right ss-b-mr">'+voucherPaid+'</span></h4>';
    $('.bill-amounts').append(voucherHtml);
  }
  var paidHtml = '<h4>Paid:<span class="w3-right ss-b-mr">'+totalPaid+'</span></h4>';
  $('.bill-amounts').append(paidHtml);
  $('#not_print').hide();
  $('.bill-print').show();
  if (printTwo) {
    for (var i = 0; i < 2; i++) {
      window.print();
    }
  }else{
    window.print();
  }
  setTimeout(function(){ 
    $('#not_print').show(); 
    $('.bill-print').hide();
  },300);
}

function keyInDigit(amountEntered, digit){
  if (amountEntered.toString().includes(".")) {
    var parts = amountEntered.toString().split(".");
    if (parts[1] == 0) {
      amountEntered = (+amountEntered + (digit/10)).toFixed(1);
    }else if (parts[1].length < 2) {
      amountEntered = (+amountEntered + (digit/100)).toFixed(2);
    }else{
      alert("You can only enter up to two decimals");
    }
    return amountEntered;
  }
  if (amountEntered == 0) {
    amountEntered = parseInt(digit, 10);
  }else{
    amountEntered = parseInt((amountEntered + digit), 10);
  }
  return amountEntered;
}

function selectOrderToPay(orderId){
  db.collection("Orders").doc(orderId).get().then((doc) =>{
  $('#pos_selected_order').empty();
    orderedItems = [];
    var pendingItems = doc.get("pendingItems");
    var servedItems = doc.get("servedItems");
    var total = doc.get("total");
    var table = doc.get("table");
    payments = doc.get("payments");
    tip = doc.get("tip");
    if (tip == null) {
      tip = 0;
    }
    tip = (+tip).toFixed(2);
    $('#tip_input').val(tip);
    paid = doc.get("paid");
    if (paid == null) {
      paid = 0;
    }
    paid = (+paid).toFixed(2);
    var orderNum = doc.get("number");
    var waiter = doc.get("servedBy");
    var id  = doc.id;
    var billTable = "Table #" + table;
    if (table == "Takeaway") {
      billTable = table;
    }
    $('.bill-table').text(billTable);
    $('#bill_waiter').text(waiter);
    var date = doc.get("tableOpenedAt").toDate().toLocaleString();
    $('#phd_paid').text("0.00");
    $('#phd_change').text("0.00");
    orderedItems.push(pendingItems);
    if (servedItems != null) {
      orderedItems.push(servedItems);
    }
    var html = '<div class="col-sm-6">\
                  <div class="order1">\
                    <div class="header">\
                      <h1>T<span>'+table+'</span></h1>\
                      <p class="date">'+date+'</p>\
                      <p id="order_id" hidden>'+id+'</p>\
                    </div>\
                    <hr/>\
                    <div id="order_item_container"></div>\
                    <hr/>\
                    <div class="orderTotal">\
                      <h3>Total <span id="pos_total_screen" class="w3-right"></span></h3>\
                    </div>\
                  </div>\
                </div>';
    $('#pos_selected_order').append(html);
    setTimeout(function() { addItemsToPosOrder(orderedItems); }, 1000);
  });
}

function addItemsToPosOrder(orderedItems){
  var children = $('#pos_selected_order').children();
  $(child).find('#order_item_container').empty();
  $('.bill-items').empty();
  var billTotal = 0;
  for (var i = orderedItems.length - 1; i >= 0; i--) {
    var child = children[0];
    var order = orderedItems[i];
    for (var w = order.length - 1; w >= 0; w--) {
      var item = order[w];
      var qty = item.quantity;
      var name = item.name;
      var price = item.subTotal;
      billTotal = (+billTotal + +price).toFixed(2);
      var billItem = '<span>'+qty+' x </span><span class="bill-item-name">'+name+'</span> <span class="w3-right ss-b-mr">'+price+'</span><br>'
      var itemHtml = '<div class="ordered-items">\
                        <h3><span>'+qty+'</span> x <span>'+name+'</span></h3>\
                        <h3 class="sub-price">R<span>'+price+'</span></h3>\
                      </div>'
      $(child).find('#order_item_container').append(itemHtml);
      $('.bill-items').append(billItem);
    }
  }
  ballance = (+billTotal - +paid).toFixed(2);
  $('#bill_total').text(billTotal);
  $('#phd_ballance').val(ballance);
  $('#pos_total_screen').text("R" + billTotal);
}

/*======================================
              Sales Page
=======================================*/

function loadSalesPage(userSigned) {
  var td = new Date();
  var n = td.getMonth();
  var today = td.getDate();
  if (currEmpl == null) {
    isAdminCheck = true;
    authRun = loadSalesPage;
    authModal.style.display = "block";
    $('#empl_number').focus();
    return;
  }else{
    switch(userSigned){
      case "Admin":
        AdminReports();
        break;
      case "Supervisor":
        supervisorReports();
        break;
      default:
        loadSigleWaiter(userSigned);
    }
    if (userSigned != "Admin") {
      $('#waiter_total').remove();
    }
  }

  $('#month_picker').change(function(){
    var month = $(this).children("option:selected").val();
    monthlySales(month);
  });

  $('#day_picker').change(function(){
    var daysBack = $(this).children("option:selected").val();
    var showDay = +today - +daysBack;
    dailySales(showDay, (+showDay + 1));
  });

  $('#waiters_list').on('click', 'li', function(){
    var empNumber = $(this).find('a')[0].innerHTML.trim();
    var table = document.getElementById('waiter_sales_table');
    while(table.rows.length > 2) {
      table.deleteRow(1);
    }
    db.collection("Orders").where("tableOpenedAt", ">", d).where("servedBy", "==", empNumber)
    .get().then((querySnapshot) =>{
      $('#n_tables_served').text(querySnapshot.size);
      var dailyTotal = 0;
      var cash = 0;
      var card = 0;
      var voucher = 0;
      var soldItems = [];
      $('#sales_per_table').empty();
      querySnapshot.forEach((doc) =>{
        var table = doc.get("table");
        var total = doc.get("total");
        var paid = doc.get("paid");
        var tip = doc.get("tip");
        var payments = doc.get("payments");
        if (payments != null) {
        	for (var i = payments.length - 1; i >= 0; i--) {
  	        var payment = payments[i];
	          switch(payment.method){
            	case "Cash":
          	  	cash = (+cash + +payment.amount).toFixed(2);
        	    	break;
      	      case "Card":
    	        	card = (+card + +payment.amount).toFixed(2);
  	          	break;
	            case "Voucher":
            		voucher = (+voucher + +payment.amount).toFixed(2);
            		break;
          	}
        	}
        }
        if (tip == null) {
          tip = 0;
        }
        if (paid == null) {
          paid = 0;
        }
        var tableHtml = '<table id='+doc.id+' class="table table-bordered table-striped w3-card" id="d_sales_table" style="margin-bottom: 20px">\
                          <thead>\
                            <h4 >Table '+table+'</h4>\
                            <tr>\
                              <th>Menu Item</th>\
                              <th>Menu Categ</th>\
                              <th>Item Qty</th>\
                              <th>Gross Amount (R)</th>\
                            </tr>\
                          </thead>\
                          <tbody>\
                            <!-- this is the total of all item -->\
                            <tr style="font-weight: bolder;">\
                              <td colspan="3">Total of Items</td>\
                              <td>R'+total+'</td>\
                            </tr>\
                            <tr style="font-weight: bolder;">\
                              <td colspan="3">Tip</td>\
                              <td>R'+tip+'</td>\
                            </tr>\
                            <tr style="font-weight: bolder;">\
                              <td colspan="3">Total Paid</td>\
                              <td>R'+paid+'</td>\
                            </tr>\
                          </tbody>\
                        </table>';
        $('#sales_per_table').append(tableHtml);
        var items = doc.get("servedItems");
        if (items == null) {
          items = doc.get("pendingItems");
        }else{
          items = items.concat(doc.get("pendingItems"));
        }
        for (var i = 0; i < items.length; i++) {
          var item = items[i];
          var name = item.name;
          var qty = item.quantity;
          var subTotal = item.subTotal;
          var category = item.subCat;
          addItemToSales(soldItems, item);
          var itemHtml = '<tr>\
                            <td>'+name+'</td>\
                            <td>'+category+'</td>\
                            <td>'+qty+'</td>\
                            <td>'+subTotal+'</td>\
                          </tr>'
          $('#'+doc.id+' tr:first').after(itemHtml);
        }
      });
      for (var i = 0; i < soldItems.length; i++) {
        var soldItem =soldItems[i];
        var name = soldItem.name;
        var qty = soldItem.quantity;
        var subTotal = soldItem.subTotal;
        var subCat = soldItem.subCat;
        dailyTotal = (+dailyTotal + +subTotal).toFixed(2);
        var saleRow = '<tr>\
                        <td>'+name+'</td>\
                        <td>'+subCat+'</td>\
                        <td>'+qty+'</td>\
                        <td>'+subTotal+'</td>\
                      </tr>'
        $('#waiter_sales_table tr:last').before(saleRow);
      }
      if (cash > 0) {
      	var html = addPaymentMethod("Cash", cash);
      	$('#waiter_sales_table tr:last').before(html);
      }
      if (card > 0) {
      	var html = addPaymentMethod("Card", card);
      	$('#waiter_sales_table tr:last').before(html);
      }
      if (voucher > 0) {
      	var html = addPaymentMethod("Voucher", voucher);
      	$('#waiter_sales_table tr:last').before(html);
      }
      $('#waiter_total').text(dailyTotal);
    });
    $('#waiters_list').children('li').removeClass("active-tab");
    $('#waiterSales').fadeIn("slow").show();
    $('#day').removeClass("active-tab");
    $('#tsales').removeClass("active-tab");
    $(this).addClass("active-tab");
    $('#totalSales').hide();
    $('#daily').hide();
  });

  $('#save_pdf').on('click', function(){
    monthlySalePdf();
  });
}

function addPaymentMethod(method, amount){
	var html = '<tr style="font-weight: bolder;">\
                <td colspan="3">'+method+' Paid</td>\
                <td>R'+amount+'</td>\
              </tr>';
  return html;
}

function AdminReports(){
  var ad = new Date();
  var n = ad.getMonth();
  var today = ad.getDate();
  dailySales(today, today+1);
  loadVoids(today, today+1);
  monthlySales(n);
  waiterSales();
}

function supervisorReports(){
  $('#day').remove();
  $('#tsales').remove();
  $('#daily').remove();
  $('#totalSales').remove();
  waiterSales();
}

function monthlySalePdf(){ 
  var month = $('#month_picker').children("option:selected").val(); 
  var dateOfNow = new Date(); var yearFull = dateOfNow.getFullYear(); 
  var doc = new jsPDF('p', 'pt'); 
  var Title = getMonthName(month) + " " + yearFull + " Sales"; 
  doc.text(Title, 40, 30); 
  var elem = document.getElementById("m_sales_table"); 
  var res = doc.autoTableHtmlToJson(elem); doc.autoTable(res.columns, res.data); 
  doc.save(getMonthName(month) + " Sales.pdf"); 
}

function loadSigleWaiter(waiter){
  $('#day').remove();
  $('#tsales').remove();
  $('#daily').remove();
  $('#totalSales').remove();
  db.collection("Employees").where("name", "==", waiter).get().then((querySnapshot) =>{
    querySnapshot.forEach((doc) =>{
      var name = doc.get("name");
      var empNumber = doc.get("empNumber");
      var waiterHtml = '<li><a class="waiter-sales" id="waiter" style="cursor: pointer;">'+name+'</a>\
                        <p hidden>'+empNumber+'</p></li>';
      $('#waiters_list').append(waiterHtml);
    });
  });
}

function dailySales(start, end){
  var date = new Date(), y = date.getFullYear(), m = date.getMonth();
  var startDate = new Date(y, m, start);
  var endDate = new Date(y, m, end);
  $('#daily_total_date').text(startDate.toLocaleDateString('en-GB'));
  var table = document.getElementById('d_sales_table');
  while(table.rows.length > 2) {
    table.deleteRow(1);
  }
  db.collection("Orders").where("tableOpenedAt", ">", startDate).where("tableOpenedAt", "<", endDate)
  .orderBy("tableOpenedAt", "asc").onSnapshot(function(querySnapshot) {
    var dailyTotal = 0;
    var soldItems = [];
    querySnapshot.forEach((doc) => {
      var items = doc.get("servedItems");
        if (items == null) {
          items = doc.get("pendingItems");
        }else{
          items = items.concat(doc.get("pendingItems"));
        }
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        addItemToSales(soldItems, item);
      }
    });
    for (var i = 0; i < soldItems.length; i++) {
        var soldItem =soldItems[i];
        var name = soldItem.name;
        var qty = soldItem.quantity;
        var subTotal = soldItem.subTotal;
        var subCat = soldItem.subCat;
        dailyTotal = (+dailyTotal + +subTotal).toFixed(2);
        var saleRow = '<tr>\
                        <td>'+name+'</td>\
                        <td>'+subCat+'</td>\
                        <td>'+qty+'</td>\
                        <td>'+subTotal+'</td>\
                      </tr>'
        $('#d_sales_table tr:last').before(saleRow);
      }
    $('#daily_total').text(dailyTotal);
  });
}

function monthlySales(month){
  document.getElementById('month_picker').value = month;
  var date = new Date(), y = date.getFullYear();
  var firstDay = new Date(y, month, 1);
  var lastDay = new Date(y, (+month + 1), 0);
  var table = document.getElementById('m_sales_table');
  while(table.rows.length > 2) {
    table.deleteRow(1);
  }
  db.collection("Orders").where("tableOpenedAt", ">", firstDay).where("tableOpenedAt", "<", lastDay)
  .orderBy("tableOpenedAt", "asc").onSnapshot(function(querySnapshot) {
    var soldItems = [];
    var dailySales = [];
    var monthlyTotal = 0;
    for (var day = firstDay.getDate(); day <= lastDay.getDate(); day++) {
      var dailyTotal = 0;
      querySnapshot.forEach((doc) => {
        var items = doc.get("servedItems");
        if (items == null) {
          items = doc.get("pendingItems");
        }else{
          items = items.concat(doc.get("pendingItems"));
        }
        var date = doc.get("tableOpenedAt").toDate();
        var purchaseDay = date.getDate();
        var purchaseMonth = date.getMonth();
        for (var i = items.length - 1; i >= 0; i--) {
          var item = items[i];
          var subTotal = item.subTotal;
          if (purchaseMonth == month && purchaseDay == day) {
            dailyTotal = (+dailyTotal + +subTotal).toFixed(2);            
          }
        }
      });
      var currentDate = new Date(y, month, day);
      var currDay = getWeekday(currentDate);
      var salesDay = {date: currentDate.toLocaleDateString('en-GB'), day: currDay, Total: dailyTotal};
      monthlyTotal = (+monthlyTotal + +dailyTotal).toFixed(2);
      dailySales.push(salesDay);
    }
    for (var i = 0; i < dailySales.length; i++) {
      var saleRow =dailySales[i];
      var rowDate = saleRow.date;
      var day = saleRow.day;
      var dayTotal = saleRow.Total;
      var salesDayRow = '<tr>\
                          <td>'+rowDate+'</td>\
                          <td>'+day+'</td>\
                          <td>'+dayTotal+'</td>\
                        </tr>';
      $('#m_sales_table tr:last').before(salesDayRow);
    }
    $('#monthly_total').text("R"+monthlyTotal);
  });
}

function waiterSales(){
  db.collection("Employees").get().then((querySnapshot) =>{
    querySnapshot.forEach((doc) =>{
      var name = doc.get("name");
      var empNumber = doc.get("empNumber");
      var waiterHtml = '<li><a class="waiter-sales" id="waiter" style="cursor: pointer;">'+name+'</a>\
                        <p hidden>'+empNumber+'</p></li>';
      $('#waiters_list').append(waiterHtml);
    });
  });
}

function loadVoids (start, end){
  var date = new Date(), y = date.getFullYear(), m = date.getMonth();
  var startDate = new Date(y, m, 1);
  var endDate = new Date(y, (+m + 1), 0);
  var table = document.getElementById('voided_item_table');
  while(table.rows.length > 2) {
    table.deleteRow(1);
  }
  db.collection("LaPiazzaVoids").where("time", ">", startDate).where("time", "<", endDate)
  .orderBy("time", "asc").onSnapshot(function(querySnapshot) {
    querySnapshot.forEach((doc) =>{
      var name = doc.get("itemName");
      var qty = doc.get("quantity");
      var table = doc.get("TableNumber");
      var authorisedBy = doc.get("authorisedBy");
      var time = doc.get("time").toDate();
      time = time.toLocaleString();
      var voidHtml = '<tr>\
              <td>'+name+'</td>\
              <td>'+qty+'</td>\
              <td>'+time+'</td>\
              <td>'+table+'</td>\
              <td>'+authorisedBy+'</td>\
            </tr>';
      $('#voided_item_table tr:last').after(voidHtml);
    });
  });
}

function addItemToSales(arr, obj) {
  const index = arr.findIndex((e) => e.name === obj.name);
  if (index === -1) {
      arr.push(obj);
  } else {
      var item = arr[index];
      item.quantity = +item.quantity + +obj.quantity;
      item.subTotal = (+item.subTotal + +obj.subTotal).toFixed(2);
  }
}

function getWeekday(date){
  var weekday = new Array(7);
  weekday[0] = "Sunday";
  weekday[1] = "Monday";
  weekday[2] = "Tuesday";
  weekday[3] = "Wednesday";
  weekday[4] = "Thursday";
  weekday[5] = "Friday";
  weekday[6] = "Saturday";

  var n = weekday[date.getDay()];
  return n;
}

function getMonthName(n){
  const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];
  return monthNames[n];
}

/*======================================
              Multi Pages
=======================================*/
function clockCount(element, hours, minutes, seconds) {
    // Fetch the display element
    var el = element;

    // Set the timer
    var interval = setInterval(function() {
        if(seconds == 60) {
          minutes++;
          seconds = 0;
        }
        if (minutes == 60) {
          hours++;
          minutes = 0;
        }
        var minute_text = 0;
        var second_text = 0;
        if (hours != 0 && minutes < 10) {
          minute_text = "0" + minutes;
        }else{
          minute_text = minutes;
        }
        if (seconds < 10) {
          second_text = "0" + seconds;
        }else{
          second_text = seconds;
        }
        if (hours == 0) {
          el.innerHTML = minute_text + ':' + second_text;
        }else{
          el.innerHTML = hours + ":" +minute_text + ':' + second_text;
        }
        
        seconds++;
    }, 1000);
}

// Auth Modal
// Get the modal
var authModal = document.getElementById("authModal");

// Get the <span> element that closes the modal
$('.authClose').on('click', function(){
  authModal.style.display = "none";
});

$("#authModal").keyup(function(event) {
    if (event.keyCode === 13) {
        $("#verify_employee").click();
    }
});

$('#verify_employee').on('click', function(){
  currEmpl = $('#authModal input').val();
  var userSigned;
  var empIndex;
  var employee;
    empIndex = adminsList.findIndex((e) => e.emplNo === currEmpl);
    if (empIndex == -1) {
      empIndex = supervisorList.findIndex((e) => e.emplNo === currEmpl);
      if (empIndex != -1) {
        employee = supervisorList[empIndex];
        userSigned = "Supervisor";
      }else{
        empIndex = staffList.findIndex((e) => e.emplNo === currEmpl);
        if (empIndex != -1) {
          employee = staffList[empIndex];
          userSigned = employee.name;
        }
      }
    }else{
      employee = adminsList[empIndex];
      userSigned = "Admin";
    }
  if (empIndex == -1) {
    $('#auth_error').show();
    currEmpl = null;
    $('#authModal input').val("");
  }else{
    $('#auth_error').hide();
    currEmplName = employee.name;
    $('#authModal input').val("");
    switch (authRun){
      case prepareKitchenOrders:
        authRun(parent);
        break;
      case prepareWaiterOrders:
        authRun(parent);
        break;
      case serveOrder:
        authRun(currEmpl);
        break;
      case respondRequest:
        authRun(currEmpl);
        break;
      case loadPos:
        authRun();
        break;
      case loadSalesPage:
        authRun(userSigned);
        break;
      case voidItem:
        if (userSigned == "Admin" || userSigned == "Supervisor") {
          var name = employee.name;
          authRun(name);
        }
        break;
      case voidTable:
        if (userSigned == "Admin" || userSigned == "Supervisor") {
          var name = employee.name;
          authRun(name);
        }
        break;
    }
    authModal.style.display = "none";
  }
});

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == authModal) {
    authModal.style.display = "none";
  }
}

// Other Modals
// Get the modal
var cancelModal = document.getElementById("cancelModal");

$('#confirmCancel').on('click', function(){
  cancelModal.style.display = "block";
});

var reqModel = document.getElementById("ss_request_modal");

$('#request_fab').on('click', function(){
  reqModel.style.display = "block";
});

$('#ss_request_modal').on('click', '.close', function(){
  reqModel.style.display = "none";
});

$('#ss_request_modal').on('click', 'input', function(){
  var value = $(this).val().trim();
  addOrRemove(requestItems, value);
});

$('#ss_request_modal').on('click', '#submit_request', function(){
  var text = $('#note_waiter_text').val().trim();
  if(text.length != 0){
    requestItems.push(text);
  }
  if (requestItems.length != 0) {
    db.collection("Requests").doc().set({
      requestedAt: firebase.firestore.Timestamp.fromDate(new Date()),
      items: requestItems,
      responded: false,
      table: table
    }).then(function(){
      requestItems = [];
      uncheckBox();
      $('#note_waiter_text').val("");
      reqModel.style.display = "none";
      alert("Your Request has been submitted!\nAn attendant will attend to you shortly.");
    });
  }
});

function addOrRemove(selectArr, dataid) {
var idx = $.inArray(dataid, selectArr);
  if (idx == -1) {
    selectArr.push(dataid);
  } else {
    selectArr.splice(idx, 1);
  }
}

function uncheckBox(){
  var boxes = $('#ss_request_modal').find('input');
  for (var i = boxes.length - 1; i >= 0; i--) {
    $(boxes[i]).attr('checked', false);
  }
}

function showSnackbar(text){
  var snackbarHtml = '<div id="snackbar">'+text+'</div>';
  if ($('body').find('#snackbar').length == 0) {
    $('body').append(snackbarHtml);
  }

  var x = document.getElementById("snackbar");

  x.className = "show";

  setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
}

function playSound(from){
	var path = "../sounds/beep_beep_car_alarm.mp3"
	if (from != "pages") {
		path = "sounds/beep_beep_car_alarm.mp3"
	}
	var audio = new Audio(path);
	audio.play().catch(function(error){
		console.log(error);
	});
}

/*=====================================
          Loader wheel
======================================*/
function showLoader(){
  $("#loader").addClass("loader");
}

function hideLoader(){
  $("#loader").removeClass("loader");
}