// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
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
const db = getFirestore(app);
const auth = getAuth(app);

const newsForm = document.getElementById("news-form");

// Add news
let title = document.getElementById("title");
let content = document.getElementById("content");
let image = document.getElementById("image");

let submitBtn = document.getElementById("submit");

// Submit function
function addNews(title, content, image, author) {
    const date = new Date();

    if (title.value.trim() === "") {
        alert("Please type the news title");
        return;
    }
    if (content.value.trim() === "") {
        alert("Please add content to your news");
        return;
    }
    
    addDoc(collection(db, "News"), {
        title: title.value,
        content: content.value,
        image: image.files[0] ? image.files[0].name : null,
        author: author.uid ? author : "Anonymous",
        date: date.toISOString()
    })

    .then(() => {
        alert("News created successfully");
        newsForm.reset();
    })
    .catch((error) => {
        console.error("Error adding news: ", error);
        alert("Error creating news: " + error.message);
    })
}

submitBtn.addEventListener("click", (e) => {
    e.preventDefault();
    onAuthStateChanged(auth, (user) => {
        if (user) {
            if (user.emailVerified) {
                addNews(title, content, image, user);
            } else {
                alert("Please verify your email before creating news using your account");
                addNews(title, content, image, "Anonymous");
            }
        } else {
            addNews(title, content, image, "Anonymous");
        }
    })
})