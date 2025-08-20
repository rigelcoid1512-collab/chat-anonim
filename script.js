// DOM Elements
const authPage = document.getElementById("authPage");
const chatPage = document.getElementById("chatPage");
const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("email");
const errorText = document.getElementById("error");
const welcomeUser = document.getElementById("welcomeUser");
const chatBox = document.getElementById("chatBox");
const messageInput = document.getElementById("messageInput");

// Daftar chat
function loadMessages() {
  const q = query(collection(db, "messages"), orderBy("timestamp"));
  onSnapshot(q, (snapshot) => {
    chatBox.innerHTML = "";
    snapshot.forEach((doc) => {
      const data = doc.data();
      const messageElement = document.createElement("div");
      messageElement.classList.add("message");
      messageElement.innerHTML = `<strong>${data.username}</strong>: ${data.text}`;
      chatBox.appendChild(messageElement);
    });
    // Scroll ke bawah
    chatBox.scrollTop = chatBox.scrollHeight;
  });
}

// Kirim pesan
function sendMessage() {
  const text = messageInput.value.trim();
  if (!text) return;

  const username = localStorage.getItem("username");
  addDoc(collection(db, "messages"), {
    username: username,
    text: text,
    timestamp: new Date()
  });
  messageInput.value = "";
}

// Register / Login
function register() {
  const email = emailInput.value;
  const username = usernameInput.value.trim();

  if (!email || !username) {
    showError("Email dan nama samaran wajib diisi!");
    return;
  }

  // Simpan username di localStorage
  localStorage.setItem("username", username);

  // Coba login dulu (jika sudah pernah daftar)
  signInWithEmailAndPassword(auth, email, "defaultpassword123")
    .catch(() => {
      // Jika gagal login, daftar baru
      createUserWithEmailAndPassword(auth, email, "defaultpassword123")
        .then(() => {
          welcomeUser.textContent = username;
          authPage.style.display = "none";
          chatPage.style.display = "block";
          loadMessages();
        })
        .catch((err) => {
          showError("Gagal membuat akun: " + err.message);
        });
    })
    .then(() => {
      welcomeUser.textContent = username;
      authPage.style.display = "none";
      chatPage.style.display = "block";
      loadMessages();
    });
}

// Logout
function logout() {
  signOut(auth).then(() => {
    localStorage.removeItem("username");
    chatPage.style.display = "none";
    authPage.style.display = "block";
    emailInput.value = "";
    messageInput.value = "";
  });
}

// Tampilkan error
function showError(msg) {
  errorText.textContent = msg;
  errorText.style.display = "block";
  setTimeout(() => {
    errorText.style.display = "none";
  }, 3000);
}

// Cek status login
onAuthStateChanged(auth, (user) => {
  const savedUsername = localStorage.getItem("username");
  if (user && savedUsername) {
    welcomeUser.textContent = savedUsername;
    authPage.style.display = "none";
    chatPage.style.display = "block";
    loadMessages();
  }
});
