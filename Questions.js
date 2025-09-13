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
let question = document.getElementById("Question");

let subBtn = document.getElementById("Sub");

function askQuestions() {
    if(username.value.trim() == "") {
        alert("Please type your username");
        return;
    }
    if(email.value.trim() == "") {
        alert("Please type your email");
        return;
    }
    if(question.value.trim() == "") {
        alert("Please type your valid question");
        return;
    }

    set(ref(db, "QuestionSet/" + question.value), {
        username: String(username.value),
        email: String(email.value),
        question: String(question.value),
    })

    .then(() => {
        alert("Thank you for your advice");
    })
    .catch((error) => {
        alert("ERROR: An error has occured");
        console.log(error);
    })
}

subBtn.addEventListener("click", (e) => {
    e.preventDefault();
    askQuestions();
    username.value = "";
    email.value = "";
    question.value = "";
});