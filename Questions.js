//Functions
let username = document.getElementById("Username");
let email = document.getElementById("Email");
let question = document.getElementById("Question");

let subBtn = document.getElementById("Sub");

function askQuestions() {
    if(username.value.trim == "") {
        alert("Please type your username");
        return;
    }
    if(email.value.trim == "") {
        alert("Please type your email");
        return;
    }
    if(question.value.trim == "") {
        alert("Please type your valid question");
        return;
    }

    set(ref("QuestionSet/" + question.value), {
        username: String(username.value),
        email: email.value,
        question: question.value,
    })

    .then(() => {
        alert("Thank you for your advice");
    })
    .catch((error) => {
        alert("ERROR: An error has occured");
        console.log(error);
    })
}

subBtn.addEventListener("click", askQuestions);