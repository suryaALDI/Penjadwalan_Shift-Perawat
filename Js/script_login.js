function loginWithPIN() {
    const pinInput = document.querySelector('.form-wrapper.login input[type="password"]');
    const pin = pinInput.value;

    // Validasi PIN, misalnya PIN harus "123456"
    if (pin === "123456") {
        alert("Login successful!");
        
        // Mengalihkan ke halaman lain, misalnya "dashboard.html"
        console.log("Redirecting to dashboard...");  // Debug untuk memastikan bahwa fungsi bekerja
        window.location.href = "splash.html";  // Ganti dengan URL halaman yang sesuai
    } else {
        alert("Invalid PIN. Please try again.");
        pinInput.value = ''; // Kosongkan input PIN
    }
}

// Menambahkan event listener ke tombol login
const loginButton = document.querySelector('.form-wrapper.login button');
loginButton.addEventListener('click', function(event) {
    event.preventDefault();  // Mencegah form untuk submit secara default
    loginWithPIN();  // Menjalankan login dengan PIN
});
