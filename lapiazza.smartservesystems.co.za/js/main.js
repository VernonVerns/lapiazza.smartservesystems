const firebaseConfig = {
    apiKey: "AIzaSyB-ONpEfGsObnhbnEWoczi7KYnWw7lJQYA",
    authDomain: "smartserve-9e1e5.firebaseapp.com",
    databaseURL: "https://smartserve-9e1e5.firebaseio.com",
    projectId: "smartserve-9e1e5",
    storageBucket: "smartserve-9e1e5.appspot.com",
    messagingSenderId: "1070424995930",
    appId: "1:1070424995930:web:9437bd15d3755625e30063",
    measurementId: "G-2W5H7B4H2D"
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
