const loginTab = document.querySelector("#loginTab");
const signUpTab = document.querySelector("#signUpTab");
const tab = document.querySelector(".tab");

function clearForm() {
    tab.innerHTML = '';
}

async function showLoginForm() {
    clearForm();

    const mailLabel = document.createElement("label");
    mailLabel.setAttribute("for", "email");
    mailLabel.innerText = "Email*";
    tab.appendChild(mailLabel);
    
    const userEmail = document.createElement("input");
    userEmail.id = "email";
    userEmail.type = "email";
    userEmail.placeholder = "user123@gmail.com";
    userEmail.required = true;
    mailLabel.appendChild(userEmail);

    const passLabel = document.createElement("label");
    passLabel.setAttribute("for", "password");
    passLabel.innerText = "Password*";
    tab.appendChild(passLabel);
    
    const userPassword = document.createElement("input");
    userPassword.id = "password";
    userPassword.type = "password";
    userPassword.placeholder = "********";
    userPassword.required = true;
    passLabel.appendChild(userPassword);

    const errorText = document.createElement("span");
    errorText.id = "errorText";
    tab.appendChild(errorText);

    const loginBtn = document.createElement("button");
    loginBtn.className = "button button-primary";
    loginBtn.innerText = "Login";
    loginBtn.type = "button";
    tab.appendChild(loginBtn);

    loginBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        errorText.innerText = "";
        errorText.style.color = "red";

        if(!userEmail.value || !userPassword.value) {
            errorText.innerText = "Please enter all fields";
            return;
        }

        console.log(userEmail.value, userPassword.value)

        try {
            const response = await fetch("http://localhost:6060/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: userEmail.value,
                    password: userPassword.value
                })
            });
            const data = await response.json();
            console.log(data);

            if (data.success) {
                sessionStorage.setItem("loggedInUser", JSON.stringify(data.user));
                if(data.user.isAdmin) {
                    window.location.href = "admin.html";
                } else {
                    window.location.href = "user.html";
                }
            } else {
                errorText.innerText = "Email or Password is incorrect";
            }
        } catch (error) {
            console.error("Login error:", error);
            errorText.innerText = "An error occurred during login. Please try again.";
        }
    });
}

async function showSignUpForm() {
    clearForm();

    const nameLabel = document.createElement("label");
    nameLabel.setAttribute("for", "username");
    nameLabel.innerText = "Name*";
    tab.appendChild(nameLabel);
    
    const userName = document.createElement("input");
    userName.id = "username";
    userName.type = "text";
    userName.placeholder = "Dominic Toretto";
    userName.required = true;
    nameLabel.appendChild(userName);

    const mailLabel = document.createElement("label");
    mailLabel.setAttribute("for", "email");
    mailLabel.innerText = "Email*";
    tab.appendChild(mailLabel);
    
    const userEmail = document.createElement("input");
    userEmail.id = "email";
    userEmail.type = "email";
    userEmail.placeholder = "user123@gmail.com";
    userEmail.required = true;
    mailLabel.appendChild(userEmail);

    const passLabel = document.createElement("label");
    passLabel.setAttribute("for", "password");
    passLabel.innerText = "Password*";
    tab.appendChild(passLabel);
    
    const userPassword = document.createElement("input");
    userPassword.id = "password";
    userPassword.type = "password";
    userPassword.placeholder = "********";
    userPassword.required = true;
    passLabel.appendChild(userPassword);

    const adminLabel = document.createElement("label");
    adminLabel.setAttribute('for', 'chkAdmin');
    adminLabel.innerText = "Register as Admin? ";
    tab.appendChild(adminLabel);
    
    const isAdmin = document.createElement("input");
    isAdmin.type = "checkbox";
    isAdmin.id = "chkAdmin";
    adminLabel.appendChild(isAdmin);

    const errorText = document.createElement("span");
    errorText.id = "errorText";
    tab.appendChild(errorText);

    const signUpBtn = document.createElement("button");
    signUpBtn.className = "button button-primary";
    signUpBtn.innerText = "Register";
    signUpBtn.type = "button";
    tab.appendChild(signUpBtn);

    signUpBtn.addEventListener("click", async (event) => {
        event.preventDefault();
        errorText.innerText = "";
        errorText.style.color = "red";

        if(!userName.value || !userEmail.value || !userPassword.value) {
            errorText.innerText = "Please enter all fields";
            return;
        }

        try {
            const response = await fetch("http://localhost:6060/api/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: Date.now(),
                    username: userName.value,
                    email: userEmail.value,
                    password: userPassword.value,
                    isAdmin: isAdmin.checked
                })
            });

            const data = await response.json();

            if (data.success) {
                errorText.innerText = "Signup Successful! Redirecting to login page...";
                errorText.style.color = "green";
                
                setTimeout(() => {
                    loginTab.checked = true;
                    showLoginForm();
                }, 2000);
            } else {
                errorText.innerText = data.error || "Registration failed. Please try again.";
            }
        } catch (error) {
            console.error("Signup error:", error);
            errorText.innerText = "An error occurred during registration. Please try again.";
        }
    });
}

loginTab.addEventListener("change", ()=> {
    if(loginTab.checked) showLoginForm();
});

signUpTab.addEventListener("change", () => {
    if(signUpTab.checked) showSignUpForm();
});

window.addEventListener('DOMContentLoaded', () => {
    if (loginTab.checked) {
        showLoginForm();
    }
});