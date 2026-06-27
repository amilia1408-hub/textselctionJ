/* ===== 설정 ===== */
// Google Apps Script 배포 후 발급받은 웹앱 URL을 여기에 넣으세요.
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyp4F6wzyLBK-vzonZs1sP81sIi23mCwZcjmJX7JlKeezwRLNcR5cAs5W_ZDUlXQgVAcw/exec";

const INTEREST_QUESTIONS = [
  "나는 평소 우주에 대해 관심이 있다.",
  "나는 평소 우주의 팽창에 대해 관심이 있다.",
  "나는 영상, 책, 글 등 매체를 통해 우주의 팽창을 많이 접해본 적이 있다.",
  "나는 우주의 팽창에 대해 잘 알고 있다.",
  "우주의 팽창이라는 주제는 나에게 호감을 불러일으킨다.",
  "우주의 팽창이라는 주제는 나에게 재미있는 주제이다."
];
const SCALE_LABELS = ["매우 그렇지 않다", "그렇지 않다", "보통이다", "그렇다", "매우 그렇다"];

const TEXT_LABELS = ["A", "B", "C", "D", "E"];
const DIFFICULTY_LABELS = ["매우 쉽다", "쉽다", "적당하다", "어렵다", "매우 어렵다"];
const DIFFICULTY_PHRASE = {
  1: "매우 쉽다고",
  2: "쉽다고",
  3: "적당하다고",
  4: "어렵다고",
  5: "매우 어렵다고"
};

/* ===== 상태 ===== */
const state = {
  studentId: "",
  studentName: "",
  gender: "",
  interest: [null, null, null, null, null, null],
  texts: {
    A: { answer: null, reason: "" },
    B: { answer: null, reason: "" },
    C: { answer: null, reason: "" },
    D: { answer: null, reason: "" },
    E: { answer: null, reason: "" }
  },
  choice: null,
  finalReason: ""
};

const SCREEN_ORDER = ["0", "1", "1.5", "2", "3", "4", "done"];
const SCREEN_WEIGHT = { "0": 1, "1": 2, "1.5": 3, "2": 4, "3": 5, "4": 6, "done": 6 };

function showScreen(name) {
  document.querySelectorAll(".screen").forEach(el => el.classList.add("hidden"));
  document.querySelector(`.screen[data-screen="${name}"]`).classList.remove("hidden");
  updateProgress(name);
  window.scrollTo(0, 0);
}

function updateProgress(name) {
  const total = 6;
  const cur = SCREEN_WEIGHT[name];
  document.getElementById("progressFill").style.width = (cur / total * 100) + "%";
  document.getElementById("progressText").textContent = name === "done" ? "" : `${cur}/${total} 화면`;
}

/* ===== 화면 0 ===== */
function initScreen0() {
  const idInput = document.getElementById("studentId");
  const nameInput = document.getElementById("studentName");
  const genderRadios = document.querySelectorAll('input[name="gender"]');
  const consent = document.getElementById("genderConsent");
  const nextBtn = document.getElementById("btnScreen0Next");
  const errorEl = document.getElementById("error0");

  function check() {
    const ok = idInput.value.trim() !== "" && nameInput.value.trim() !== "" &&
      Array.from(genderRadios).some(r => r.checked) && consent.checked;
    nextBtn.disabled = !ok;
  }
  idInput.addEventListener("input", check);
  nameInput.addEventListener("input", check);
  consent.addEventListener("change", check);
  genderRadios.forEach(r => r.addEventListener("change", () => {
    document.querySelectorAll("#screen0 .radio-box").forEach(b => b.classList.remove("checked"));
    r.closest(".radio-box").classList.add("checked");
    check();
  }));

  nextBtn.addEventListener("click", () => {
    const id = idInput.value.trim();
    const name = nameInput.value.trim();
    const gender = Array.from(genderRadios).find(r => r.checked);
    if (!id || !name || !gender || !consent.checked) {
      errorEl.textContent = "학번, 이름, 성별 입력과 동의가 모두 필요합니다.";
      return;
    }
    state.studentId = id;
    state.studentName = name;
    state.gender = gender.value;
    errorEl.textContent = "";
    showScreen("1");
  });
}

/* ===== 화면 1 ===== */
function buildScreen1() {
  const container = document.getElementById("interestQuestions");
  container.innerHTML = "";
  INTEREST_QUESTIONS.forEach((q, idx) => {
    const block = document.createElement("div");
    block.className = "question-block";
    const qText = document.createElement("div");
    qText.className = "question-text";
    qText.textContent = `${idx + 1}. ${q}`;
    block.appendChild(qText);

    const scale = document.createElement("div");
    scale.className = "scale5";
    for (let v = 1; v <= 5; v++) {
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = "radio";
      input.name = `interest${idx}`;
      input.value = v;
      input.addEventListener("change", () => {
        state.interest[idx] = v;
        checkScreen1();
      });
      const btn = document.createElement("div");
      btn.className = "scale-btn";
      btn.innerHTML = `<span class="num">${v}</span><span>${SCALE_LABELS[v - 1]}</span>`;
      label.appendChild(input);
      label.appendChild(btn);
      scale.appendChild(label);
    }
    block.appendChild(scale);
    container.appendChild(block);
  });
}

function checkScreen1() {
  const ok = state.interest.every(v => v !== null);
  document.getElementById("btnScreen1Next").disabled = !ok;
}

function initScreen1() {
  document.getElementById("btnScreen1Next").addEventListener("click", () => {
    if (!state.interest.every(v => v !== null)) {
      document.getElementById("error1").textContent = "모든 문항에 응답해주세요.";
      return;
    }
    document.getElementById("error1").textContent = "";
    showScreen("1.5");
  });
}

/* ===== 화면 1.5 ===== */
function initScreen15() {
  document.getElementById("btnScreen15Next").addEventListener("click", () => {
    showScreen("2");
  });
}

/* ===== 화면 2 ===== */
function buildScreen2() {
  const container = document.getElementById("textQuestions");
  container.innerHTML = "";
  TEXT_LABELS.forEach(letter => {
    const block = document.createElement("div");
    block.className = "text-block";

    const badge = document.createElement("div");
    badge.className = "label-badge";
    badge.textContent = `글 ${letter}`;
    block.appendChild(badge);

    const q1 = document.createElement("div");
    q1.className = "question-text";
    q1.textContent = `'글 ${letter}'는 내가 읽기에 어떠한가요?`;
    block.appendChild(q1);

    const scale = document.createElement("div");
    scale.className = "difficulty5";
    DIFFICULTY_LABELS.forEach((label, i) => {
      const v = i + 1;
      const lbl = document.createElement("label");
      const input = document.createElement("input");
      input.type = "radio";
      input.name = `text${letter}`;
      input.value = v;
      input.addEventListener("change", () => {
        state.texts[letter].answer = v;
        checkScreen2();
      });
      const btn = document.createElement("div");
      btn.className = "diff-btn";
      btn.innerHTML = `<span>${"①②③④⑤"[i]}</span><span>${label.replace(" ", "<br>")}</span>`;
      lbl.appendChild(input);
      lbl.appendChild(btn);
      scale.appendChild(lbl);
    });
    block.appendChild(scale);

    const q2 = document.createElement("div");
    q2.className = "question-text";
    q2.style.marginTop = "14px";
    q2.textContent = "그렇게 느낀 이유는 무엇인가요?";
    block.appendChild(q2);

    const textarea = document.createElement("textarea");
    textarea.rows = 3;
    textarea.placeholder = "이유를 적어주세요 (최소 5자 이상)";
    textarea.addEventListener("input", () => {
      state.texts[letter].reason = textarea.value;
      checkScreen2();
    });
    block.appendChild(textarea);

    container.appendChild(block);
  });
}

function checkScreen2() {
  const ok = TEXT_LABELS.every(letter => {
    const t = state.texts[letter];
    return t.answer !== null && t.reason.trim().length >= 5;
  });
  document.getElementById("btnScreen2Next").disabled = !ok;
}

function initScreen2() {
  document.getElementById("btnScreen2Next").addEventListener("click", () => {
    const ok = TEXT_LABELS.every(letter => {
      const t = state.texts[letter];
      return t.answer !== null && t.reason.trim().length >= 5;
    });
    if (!ok) {
      document.getElementById("error2").textContent = "모든 글에 대해 응답(선택 및 이유 5자 이상)을 입력해주세요.";
      return;
    }
    document.getElementById("error2").textContent = "";
    buildScreen3();
    showScreen("3");
  });
}

/* ===== 화면 3 ===== */
function buildScreen3() {
  const container = document.getElementById("choiceRadios");
  container.innerHTML = "";
  TEXT_LABELS.forEach(letter => {
    const lbl = document.createElement("label");
    lbl.className = "radio-box";
    const input = document.createElement("input");
    input.type = "radio";
    input.name = "choice";
    input.value = letter;
    input.addEventListener("change", () => {
      state.choice = letter;
      document.querySelectorAll("#choiceRadios .radio-box").forEach(b => b.classList.remove("checked"));
      lbl.classList.add("checked");
      buildScreen4();
      showScreen("4");
    });
    lbl.appendChild(input);
    lbl.appendChild(document.createTextNode(`글 ${letter}`));
    container.appendChild(lbl);
  });
}

/* ===== 화면 4 ===== */
function buildScreen4() {
  const letter = state.choice;
  const value = state.texts[letter].answer;
  const phrase = DIFFICULTY_PHRASE[value];
  const phraseHtml = `<strong class="phrase-red">${phrase}</strong>`;
  const reasonHtml = `<u><strong>'우주의 팽창'에 대해 공부하기 위해 이 글을 선택한 이유</strong></u>`;

  let template;
  if (value === 1) {
    template = `'글 ${letter}'는 당신이 읽기에 ${phraseHtml} 판단했습니다.\n'글 ${letter}'가 읽기에 <strong class="phrase-red">매우 쉬운데도</strong> ${reasonHtml}는 무엇인가요? 솔직하고 자세하게 작성해주세요.`;
  } else if (value === 2) {
    template = `'글 ${letter}'는 당신이 읽기에 ${phraseHtml} 판단했습니다.\n'글 ${letter}'가 읽기에 <strong class="phrase-red">쉬운데도</strong> ${reasonHtml}는 무엇인가요? 솔직하고 자세하게 작성해주세요.`;
  } else if (value === 3) {
    template = `'글 ${letter}'는 당신이 읽기에 ${phraseHtml} 판단했습니다.\n글이 읽기에 <strong class="phrase-red">적당하다는 점 외에,</strong> ${reasonHtml}는 무엇인가요? 솔직하고 자세하게 작성해주세요.`;
  } else if (value === 4) {
    template = `'글 ${letter}'는 당신이 읽기에 ${phraseHtml} 판단했습니다.\n'글 ${letter}'가 읽기에 <strong class="phrase-red">어려운데도</strong> ${reasonHtml}는 무엇인가요? 솔직하고 자세하게 작성해주세요.`;
  } else {
    template = `'글 ${letter}'는 당신이 읽기에 ${phraseHtml} 판단했습니다.\n'글 ${letter}'가 읽기에 <strong class="phrase-red">매우 어려운데도</strong> ${reasonHtml}는 무엇인가요? 솔직하고 자세하게 작성해주세요.`;
  }

  document.getElementById("screen4Notice").innerHTML = template.replace(/\n/g, "<br><br>");
  document.getElementById("finalReason").value = state.finalReason || "";
}

function initScreen4() {
  const textarea = document.getElementById("finalReason");
  textarea.addEventListener("input", () => {
    state.finalReason = textarea.value;
  });

  document.getElementById("btnSubmit").addEventListener("click", submitSurvey);
}

/* ===== 제출 ===== */
function buildPayload() {
  const t = state.texts;
  return {
    timestamp: new Date().toISOString(),
    studentId: state.studentId,
    studentName: state.studentName,
    gender: state.gender,
    interest1: state.interest[0],
    interest2: state.interest[1],
    interest3: state.interest[2],
    interest4: state.interest[3],
    interest5: state.interest[4],
    interest6: state.interest[5],
    answerA: t.A.answer, reasonA: t.A.reason,
    answerB: t.B.answer, reasonB: t.B.reason,
    answerC: t.C.answer, reasonC: t.C.reason,
    answerD: t.D.answer, reasonD: t.D.reason,
    answerE: t.E.answer, reasonE: t.E.reason,
    choice: state.choice,
    choiceAnswerValue: t[state.choice].answer,
    finalReason: state.finalReason
  };
}

function submitSurvey() {
  const reason = state.finalReason.trim();
  if (reason.length < 10) {
    document.getElementById("error4").textContent = "이유를 10자 이상 입력해주세요.";
    return;
  }
  document.getElementById("error4").textContent = "";

  const submitBtn = document.getElementById("btnSubmit");
  submitBtn.disabled = true;
  submitBtn.textContent = "전송 중...";

  const payload = buildPayload();

  fetch(SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload)
  })
    .then(res => {
      if (!res.ok) throw new Error("서버 응답 오류");
      document.getElementById("doneMessage").innerHTML = "응답이 제출되었습니다.<br>성실하게 응답해주셔서 감사합니다.";
      document.getElementById("btnRetry").classList.add("hidden");
      showScreen("done");
    })
    .catch(() => {
      document.getElementById("error4").textContent = "전송에 실패했습니다. 다시 시도해주세요.";
      submitBtn.disabled = false;
      submitBtn.textContent = "제출하기";
    });
}

document.getElementById("btnRetry").addEventListener("click", submitSurvey);

/* ===== 초기화 ===== */
initScreen0();
buildScreen1();
initScreen1();
initScreen15();
buildScreen2();
initScreen2();
initScreen4();
showScreen("0");
