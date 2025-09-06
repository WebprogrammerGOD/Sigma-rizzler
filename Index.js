// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-analytics.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
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
const db = getFirestore(app);
const auth = getAuth();

let creatorBtn = document.getElementById("creator");

//User check
if (!auth) {
    console.log("No user is signed in");
} else {
    const uid = auth.uid;
}

//Role
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const docRef = doc(db, "Users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const role = docSnap.data().role;
            if (role === "ADMIN") window.location.href = "admin.html";
            else if (role === "Viewer") window.location.href = "index.html";
            else if (role === "News writer") window.location.href = "create.html";
        }
    } else {
        console.log("You are not signed in");
    }

    //Check role on the database
    db.collection("Users").where("role", "==", "ADMIN").get()
    .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const role = doc.data().role;
        })
       console.log("Role checked, your role is: " + role);
    })
    .catch((error) => {
        console.log("Cannot get your role" + error)
    })
})

//News sorting
const newsList = document.getElementById("news-list");
db.collection("News").orderBy("date", "desc").onSnapshot((snapshot) => {
    newsList.innerHTML = "";
    snapshot.forEach((doc) => {
        const news = doc.data();
        const li = document.createElement("li");
        li.innerHTML = `<h3>${news.title}<\h3><p>${news.content}<\p><p>${news.date}<\p><hr>`;
        newsList.appendChild(li);
    })
})

//Check role
function checkRole() {
    const user = auth.currentUser;
    if (user) {
        const uid = user.uid;
        const docRef = doc(db, "Users", uid);
        getDoc(docRef).then((doc) => {
            if (doc.exists()) {
                const rol = doc.data().role;
            }
        })
    } else {
        alert("You are not signed in!");
        return;
    }
}

creatorBtn.addEventListener("click", (e) => {
    checkRole();
    if (rol === "News writer" || rol === "ADMIN") {
        window.location.href = "create.html";
    } else {
        alert("You do not have permission to access this page");
        return;
    }
})