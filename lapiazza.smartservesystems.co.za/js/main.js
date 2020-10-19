//Use this one for production (NB: always keep one of the configs commented unless you change the names and add it as secondary app)
// const firebaseConfig = {
//     apiKey: "AIzaSyB-ONpEfGsObnhbnEWoczi7KYnWw7lJQYA",
//     authDomain: "smartserve-9e1e5.firebaseapp.com",
//     databaseURL: "https://smartserve-9e1e5.firebaseio.com",
//     projectId: "smartserve-9e1e5",
//     storageBucket: "smartserve-9e1e5.appspot.com",
//     messagingSenderId: "1070424995930",
//     appId: "1:1070424995930:web:9437bd15d3755625e30063",
//     measurementId: "G-2W5H7B4H2D"
// };

//Use this one for testing purposes
const firebaseConfig = {
	apiKey: "AIzaSyBI6MUyP0xyIQ_of3y62TVXl3tFyZfOjes",
	authDomain: "resturantsdata.firebaseapp.com",
	databaseURL: "https://resturantsdata.firebaseio.com",
	projectId: "resturantsdata",
	storageBucket: "resturantsdata.appspot.com",
	messagingSenderId: "272512424369",
	appId: "1:272512424369:web:b1e3b99e893ce40ead0590",
	measurementId: "G-3V2BX5DF5Q"
};
firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();


var lots_of_stuff_already_done = false;

document.getElementById('newOrder').addEventListener("click", function(event) {
    if (lots_of_stuff_already_done) {
        lots_of_stuff_already_done = false; // reset flag
        return; // let the event bubble away
    }
    event.preventDefault();
    sessionStorage.setItem("cartList", null);
    lots_of_stuff_already_done = true; // set flag
    window.location.href = "../home.html";
});
