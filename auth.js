document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');
  const loginError = document.getElementById('loginError');
  const regError = document.getElementById('regError');

  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      const email = document.getElementById('email').value.trim();
      const pass = document.getElementById('password').value;
      if (!email || !pass) {
        loginError.style.display = 'block';
        loginError.textContent = 'Vui lòng nhập email và mật khẩu';
        return;
      }
      // mock login: accept any
      localStorage.setItem('fittrack_user', JSON.stringify({email}));
      window.location.href = 'admin.html';
    });
  }

  if (registerBtn) {
    registerBtn.addEventListener('click', () => {
      const name = document.getElementById('fullname').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      const p1 = document.getElementById('regPass').value;
      const p2 = document.getElementById('regPass2').value;
      if (!name || !email || !p1) {
        regError.style.display = 'block';
        regError.textContent = 'Vui lòng điền đủ thông tin';
        return;
      }
      if (p1 !== p2) {
        regError.style.display = 'block';
        regError.textContent = 'Mật khẩu không khớp';
        return;
      }
      // mock register: save to localStorage
      const users = JSON.parse(localStorage.getItem('fittrack_users') || '[]');
      users.push({name,email});
      localStorage.setItem('fittrack_users', JSON.stringify(users));
      localStorage.setItem('fittrack_user', JSON.stringify({email,name}));
      window.location.href = 'admin.html';
    });
  }

});