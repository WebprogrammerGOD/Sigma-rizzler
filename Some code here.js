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
    storageBucket: "absolute-firebase-52d31.appspot.com",
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
let confirmPassword = document.getElementById("repeat");

let subBtn = document.getElementById("sub");

//Check email pattern
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    if (!emailPattern.test(email.value.trim())) {
        alert("Please type a valid email address");
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
    if (password.value.trim().length < 6) {
        alert("Your passwrod must be at least 6 characters long");
        return;
    }
    else if (confirmPassword.value.trim() !== password.value.trim()) {
        alert("Your confirm password is incorrect");
        return;
    }
    
    const userRef = ref(db, "UserSet/" + username.value);
    get(userRef).then((snapshot) => {   //Check if username already exists
        if (snapshot.exists()) {
            alert("This username already exists. Please choose another one.");
            return;
        } else {
            return set(userRef, {
                username: String(username.value),
                email: String(email.value),
                phonenumber: String(phonenumber.value),
                password: String(password.value),
            })
        }
    })

    .then(() => {
        alert("Successfully added your data");
    })
    .catch((error) => {
        alert("ERROR: Can't add your data \n Please try again later");
        console.log(error);
    })
}

subBtn.addEventListener("click", (e) => {
    e.preventDefault();
    addData();
    username.value = "";
    email.value = "";
    phonenumber.value = "";
    password.value = "";
    confirmPassword.value = "";
});