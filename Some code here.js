// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-analytics.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDjGsS1ysiIleLKa5z_LGfBQqZLkImcNY4",
    authDomain: "absolute-firebase-52d31.firebaseapp.com",
    projectId: "absolute-firebase-52d31",
    storageBucket: "absolute-firebase-52d31.firebasestorage.app",
    messagingSenderId: "1031045023743",
    appId: "1:1031045023743:web:a16ce917946eb943f309ca",
    measurementId: "G-QSF3CVJG1G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app);

//Functions
let username = document.getElementById("Username");
let email = document.getElementById("Email");
let phonenumber = document.getElementById("phonenumber");
let password = document.getElementById("Password");
let confirm = document.getElementById("repeat");

let subBtn = document.getElementById("sub");

//Add new account
function addData() {
    if (username.value.trim() === "") {
        alert("Please type your username");
        return;
    }
    if (email.value.trim() == "") {
        alert("Please type your email");
        return;
    }
    if (phonenumber.value.trim() == "") {
        alert("Please type your phone number");
        return;
    }
    if (password.value.trim() == "") {
        alert("Please type your password");
        return;
    }
    else if (confirm.value !== password.value) {
        alert("Your confirm password is incorrect");
        return;
    }
    
    set(ref(db, "UserSet/" + username.value), {
        username: String(username.value),
        email: email.value,
        phonenumber: Number(phonenumber.value),
        password: String(password.value),
    })

    .then(() => {
        alert("Successfully added your data");
    })
    .catch((error) => {
        alert("ERROR: Can't add your data \n Please try again later");
        console.log(error);
    })
}

subBtn.addEventListener("click", addData);