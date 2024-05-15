"use strict";

const id = document.getElementById('id'),
    psword = document.getElementById('psword'),
    confirmPsword = document.getElementById('confirm-psword'),
    name = document.getElementById('name'),
    registerBtn = document.getElementById('registerBtn');

registerBtn.addEventListener("click", register);

function register() {
  if (!id.value) return alert('아이디를 형식에 맞춰 다시 입력해 주세요.');
  if (psword.value !== confirmPsword.value) {
    return alert('비밀번호가 일치하지 않습니다.');
  };

  const req = {
    id: id.value,
    name: name.value,
    psword: psword.value,
  };

  fetch("/register", {
    method: "POST",
    headers: {
      "Content-Type" : "application/json"
    },
    body: JSON.stringify(req),
  })
    .then((res) => res.json())
    .then((res) => {
      if (res.success) {
        location.href = "/login";
      } else {
        if (res.err) return alert(res.err);
        alert(res.msg);
      }
    })
    .catch((err) => {
      console.error("회원가입 중 에러 발생");
    });
}