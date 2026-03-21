import React, { useEffect, useMemo, useState } from "react";
import Tesseract from "tesseract.js";

const STORAGE_KEY = "explore-planet-v13-multi";

const LANGS = {
  EN: { label: "English", tts: "en-US" },
  CN: { label: "中文", tts: "zh-CN" },
  BM: { label: "Bahasa", tts: "ms-MY" },
  MATH: { label: "数学", tts: "zh-CN" },
};

const SUBJECTS = ["EN", "CN", "BM", "MATH"];
const GRADES = ["一年级", "二年级", "三年级", "四年级", "五年级", "六年级"];

const PLANETS = [
  { id: 0, name: "地球", icon: "🌍", need: 0 },
  { id: 1, name: "月球", icon: "🌙", need: 10 },
  { id: 2, name: "火星", icon: "🪐", need: 20 },
  { id: 3, name: "木星", icon: "⭐", need: 35 },
  { id: 4, name: "银河", icon: "🌌", need: 50 },
];

const PET_ICONS = {
  太空狗: ["🐶", "🐕", "🐺"],
  外星猫: ["🐱", "🐈", "🦁"],
};

const SHOP_ITEMS = [
  { id: "food", name: "宠物粮食", icon: "🍖", price: 5, type: "food" },
  { id: "helmet", name: "太空头盔", icon: "🪖", price: 20, type: "item" },
  { id: "bag", name: "火箭背包", icon: "🎒", price: 30, type: "item" },
  { id: "cape", name: "银河披风", icon: "🧥", price: 50, type: "item" },
  { id: "dog", name: "太空狗", icon: "🐶", price: 40, type: "pet" },
  { id: "cat", name: "外星猫", icon: "🐱", price: 60, type: "pet" },
];

const DEFAULT_CLASSES = [{ id: "c1", name: "一年级A班" }];

const DEFAULT_WORDS = [
  { id: "w1", subject: "EN", text: "apple", answer: "apple", hint: "水果", grade: "一年级" },
  { id: "w2", subject: "EN", text: "banana", answer: "banana", hint: "水果", grade: "一年级" },
  { id: "w3", subject: "EN", text: "cat", answer: "cat", hint: "动物", grade: "一年级" },
  { id: "w4", subject: "EN", text: "dog", answer: "dog", hint: "动物", grade: "一年级" },
  { id: "w5", subject: "EN", text: "school", answer: "school", hint: "学习的地方", grade: "二年级" },
  { id: "w6", subject: "EN", text: "teacher", answer: "teacher", hint: "学校人物", grade: "二年级" },

  { id: "c1", subject: "CN", text: "苹果", answer: "苹果", hint: "水果", grade: "一年级" },
  { id: "c2", subject: "CN", text: "香蕉", answer: "香蕉", hint: "水果", grade: "一年级" },
  { id: "c3", subject: "CN", text: "学校", answer: "学校", hint: "学习的地方", grade: "二年级" },
  { id: "c4", subject: "CN", text: "老师", answer: "老师", hint: "学校人物", grade: "二年级" },

  { id: "b1", subject: "BM", text: "epal", answer: "epal", hint: "buah", grade: "一年级" },
  { id: "b2", subject: "BM", text: "pisang", answer: "pisang", hint: "buah", grade: "一年级" },
  { id: "b3", subject: "BM", text: "sekolah", answer: "sekolah", hint: "tempat belajar", grade: "二年级" },
  { id: "b4", subject: "BM", text: "guru", answer: "guru", hint: "orang di sekolah", grade: "二年级" },
  { id: "b5", subject: "BM", text: "buku", answer: "buku", hint: "untuk membaca", grade: "一年级" },
  { id: "b6", subject: "BM", text: "kucing", answer: "kucing", hint: "haiwan", grade: "一年级" },
];

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function getPetStageIndex(exp) {
  const safeExp = typeof exp === "number" ? exp : 0;
  if (safeExp >= 15) return 2;
  if (safeExp >= 5) return 1;
  return 0;
}

function speakText(text, langCode = "zh-CN") {
  if (!window.speechSynthesis) return;
  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = langCode;
  speech.rate = langCode === "ms-MY" ? 0.85 : 0.95;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(speech);
}

function repairStudent(student) {
  if (!student || typeof student !== "object") return null;

  const safeStats =
    student.stats && typeof student.stats === "object"
      ? {
          correct: typeof student.stats.correct === "number" ? student.stats.correct : 0,
          wrong: typeof student.stats.wrong === "number" ? student.stats.wrong : 0,
          learned: typeof student.stats.learned === "number" ? student.stats.learned : 0,
        }
      : { correct: 0, wrong: 0, learned: 0 };

  let safePet = null;
  if (student.pet && typeof student.pet === "object") {
    safePet = {
      name: typeof student.pet.name === "string" ? student.pet.name : "太空狗",
      exp: typeof student.pet.exp === "number" ? student.pet.exp : 0,
    };
  } else if (typeof student.pet === "string" && student.pet.trim()) {
    safePet = { name: student.pet.trim(), exp: 0 };
  }

  return {
    id: typeof student.id === "string" ? student.id : uid("stu"),
    name: typeof student.name === "string" && student.name.trim() ? student.name.trim() : "未命名学生",
    classId: typeof student.classId === "string" ? student.classId : "c1",
    grade: typeof student.grade === "string" ? student.grade : "一年级",
    subject: typeof student.subject === "string" ? student.subject : "EN",
    stars: typeof student.stars === "number" ? student.stars : 0,
    score: typeof student.score === "number" ? student.score : 0,
    level: typeof student.level === "number" ? student.level : 1,
    inventory: Array.isArray(student.inventory) ? student.inventory : [],
    petFood: typeof student.petFood === "number" ? student.petFood : 0,
    pet: safePet,
    stats: safeStats,
    wrongWords: Array.isArray(student.wrongWords) ? student.wrongWords : [],
  };
}

function repairLoadedState(data) {
  const safe = data && typeof data === "object" ? data : {};
  return {
    students: Array.isArray(safe.students) ? safe.students.map(repairStudent).filter(Boolean) : [],
    classes: Array.isArray(safe.classes) ? safe.classes : DEFAULT_CLASSES,
    words: Array.isArray(safe.words) ? safe.words : DEFAULT_WORDS,
    mathBank: Array.isArray(safe.mathBank) ? safe.mathBank : [],
    assignments: Array.isArray(safe.assignments) ? safe.assignments : [],
    teacherNotes: Array.isArray(safe.teacherNotes) ? safe.teacherNotes : [],
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        students: [],
        classes: DEFAULT_CLASSES,
        words: DEFAULT_WORDS,
        mathBank: [],
        assignments: [],
        teacherNotes: [],
      };
    }
    return repairLoadedState(JSON.parse(raw));
  } catch {
    return {
      students: [],
      classes: DEFAULT_CLASSES,
      words: DEFAULT_WORDS,
      mathBank: [],
      assignments: [],
      teacherNotes: [],
    };
  }
}

function saveState(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function generateAstronautSeed(name) {
  const sum = (name || "A").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return {
    suit: ["#60a5fa", "#a78bfa", "#f472b6", "#34d399", "#fbbf24"][sum % 5],
    visor: ["#38bdf8", "#60a5fa", "#22d3ee"][sum % 3],
    accent: ["#facc15", "#fb7185", "#4ade80", "#f97316"][sum % 4],
  };
}

function Astronaut2D({ name, level, inventory = [] }) {
  const seed = generateAstronautSeed(name);
  const hasHelmet = inventory.some((i) => i.id === "helmet");
  const hasBag = inventory.some((i) => i.id === "bag");
  const hasCape = inventory.some((i) => i.id === "cape");

  return (
    <div style={{ textAlign: "center", minWidth: 180 }}>
      <div
        style={{
          width: 130,
          height: 170,
          margin: "0 auto",
          position: "relative",
          animation: "float 2.4s ease-in-out infinite",
        }}
      >
        {hasCape && (
          <div
            style={{
              position: "absolute",
              top: 54,
              left: 18,
              width: 92,
              height: 84,
              background: "linear-gradient(180deg,#7c3aed,#4f46e5)",
              borderRadius: "40px 40px 16px 16px",
              zIndex: 0,
              opacity: 0.9,
            }}
          />
        )}

        {hasBag && (
          <>
            <div style={{ position: "absolute", top: 68, left: 8, width: 24, height: 42, background: "#475569", borderRadius: 10 }} />
            <div style={{ position: "absolute", top: 68, right: 8, width: 24, height: 42, background: "#475569", borderRadius: 10 }} />
          </>
        )}

        <div
          style={{
            position: "absolute",
            top: 0,
            left: 27,
            width: 76,
            height: 76,
            background: hasHelmet ? "#e5e7eb" : seed.suit,
            borderRadius: "50%",
            border: "4px solid #cbd5e1",
            zIndex: 2,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 16,
            left: 39,
            width: 52,
            height: 28,
            background: seed.visor,
            borderRadius: "18px",
            border: "3px solid #ffffffaa",
            zIndex: 3,
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 62,
            left: 33,
            width: 64,
            height: 74,
            background: seed.suit,
            borderRadius: 22,
            border: "4px solid #e5e7eb",
            zIndex: 2,
          }}
        />

        <div style={{ position: "absolute", top: 82, left: 12, width: 22, height: 48, background: seed.suit, borderRadius: 14, transform: "rotate(18deg)" }} />
        <div style={{ position: "absolute", top: 82, right: 12, width: 22, height: 48, background: seed.suit, borderRadius: 14, transform: "rotate(-18deg)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 42, width: 18, height: 46, background: seed.suit, borderRadius: 14 }} />
        <div style={{ position: "absolute", bottom: 0, right: 42, width: 18, height: 46, background: seed.suit, borderRadius: 14 }} />
        <div style={{ position: "absolute", top: 92, left: 54, width: 22, height: 22, background: seed.accent, borderRadius: "50%", zIndex: 4 }} />

        {level >= 3 && <div style={{ position: "absolute", top: -8, right: 8, fontSize: 26 }}>⭐</div>}
        {level >= 5 && <div style={{ position: "absolute", top: -10, left: -10, fontSize: 28 }}>🚀</div>}
        {level >= 8 && <div style={{ position: "absolute", bottom: -5, right: -5, fontSize: 28 }}>🌟</div>}
      </div>
      <div style={{ marginTop: 8, fontWeight: 700 }}>{name || "宇航员"}</div>
      <div style={{ color: "#cbd5e1", fontSize: 14 }}>Lv.{level}</div>
    </div>
  );
}

function Pet2D({ pet }) {
  if (!pet || typeof pet !== "object") {
    return (
      <div style={petWrapStyle}>
        <div style={{ fontSize: 44 }}>🥚</div>
        <div>还没有宠物</div>
      </div>
    );
  }

  const safeExp = typeof pet.exp === "number" ? pet.exp : 0;
  const safeName = pet.name || "未知宠物";
  const stage = getPetStageIndex(safeExp);
  const stageName = ["幼仔", "成长", "终极形态"][stage];
  const icon = PET_ICONS[safeName]?.[stage] || "🐾";

  let glow = "";
  if (stage === 2) glow = "0 0 20px #60a5fa";

  return (
    <div style={petWrapStyle}>
      <div
        style={{
          fontSize: 60,
          animation: "float 1.9s ease-in-out infinite",
          boxShadow: glow,
          borderRadius: "50%",
          display: "inline-block",
          padding: 8,
        }}
      >
        {icon}
      </div>
      <div style={{ fontWeight: 700 }}>{safeName}</div>
      <div style={{ color: "#cbd5e1", fontSize: 14 }}>{stageName}</div>
      <div style={{ color: "#cbd5e1", fontSize: 14 }}>经验 {safeExp} / 15</div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.08)",
        borderRadius: 18,
        padding: 14,
        minWidth: 110,
        textAlign: "center",
      }}
    >
      <div style={{ color: "#cbd5e1", fontSize: 13 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800 }}>{value}</div>
    </div>
  );
}

function TaskRow({ done, text }) {
  return (
    <div style={{ marginBottom: 10, color: done ? "#86efac" : "#e2e8f0" }}>
      {done ? "✅" : "⬜"} {text}
    </div>
  );
}

function createMathQuestionByGrade(grade) {
  const lv =
    grade === "一年级" ? 1 :
    grade === "二年级" ? 2 :
    grade === "三年级" ? 3 :
    grade === "四年级" ? 4 :
    grade === "五年级" ? 5 : 6;

  let a = 0;
  let b = 0;
  let op = "+";
  let answer = 0;

  if (lv === 1) {
    op = Math.random() > 0.5 ? "+" : "-";
    a = Math.floor(Math.random() * 10) + 1;
    b = Math.floor(Math.random() * 10) + 1;
    if (op === "-" && b > a) [a, b] = [b, a];
  } else if (lv === 2) {
    op = ["+", "-", "×"][Math.floor(Math.random() * 3)];
    a = Math.floor(Math.random() * 20) + 1;
    b = Math.floor(Math.random() * 10) + 1;
    if (op === "-" && b > a) [a, b] = [b, a];
  } else if (lv === 3) {
    op = ["+", "-", "×", "÷"][Math.floor(Math.random() * 4)];
    a = Math.floor(Math.random() * 30) + 1;
    b = Math.floor(Math.random() * 12) + 1;
    if (op === "÷") {
      answer = Math.floor(Math.random() * 9) + 2;
      b = Math.floor(Math.random() * 9) + 2;
      a = answer * b;
    }
    if (op === "-" && b > a) [a, b] = [b, a];
  } else {
    op = ["+", "-", "×", "÷"][Math.floor(Math.random() * 4)];
    a = Math.floor(Math.random() * 80) + 10;
    b = Math.floor(Math.random() * 12) + 2;
    if (op === "÷") {
      answer = Math.floor(Math.random() * 12) + 2;
      b = Math.floor(Math.random() * 12) + 2;
      a = answer * b;
    }
    if (op === "-" && b > a) [a, b] = [b, a];
  }

  if (op === "+") answer = a + b;
  if (op === "-") answer = a - b;
  if (op === "×") answer = a * b;

  const question = `${a} ${op} ${b} = ?`;
  const wrongSet = new Set();
  while (wrongSet.size < 2) {
    const delta = Math.floor(Math.random() * 6) + 1;
    const candidate = answer + (Math.random() > 0.5 ? delta : -delta);
    if (candidate !== answer && candidate >= 0) wrongSet.add(candidate);
  }

  return {
    id: uid("m"),
    subject: "MATH",
    text: question,
    answer: String(answer),
    options: shuffle([String(answer), ...Array.from(wrongSet).map(String)]),
    hint: "数学题",
    grade,
    type: "generated",
  };
}

function parseOCRTextToLanguageItems(text, subject, grade, hint) {
  const rawLines = text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const cleaned = rawLines
    .map((line) => {
      if (subject === "EN") {
        return line.replace(/[^a-zA-Z\s'-]/g, "").trim().toLowerCase();
      }
      if (subject === "BM") {
        return line.replace(/[^a-zA-Z\s'-]/g, "").trim().toLowerCase();
      }
      if (subject === "CN") {
        return line.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, "").trim();
      }
      return line.trim();
    })
    .filter((line) => line.length >= 1);

  const unique = [...new Set(cleaned)];

  return unique.slice(0, 100).map((line) => ({
    id: uid("ocr"),
    subject,
    text: line,
    answer: line,
    hint: hint || "OCR导入题目",
    grade,
  }));
}

function parseOCRTextToMathItems(text, grade) {
  const lines = text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const items = [];

  for (const line of lines) {
    const normalized = line
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/＝/g, "=")
      .replace(/\s+/g, "");

    const match = normalized.match(/^(\d+)([+\-*/])(\d+)=?(\d+)?$/);
    if (!match) continue;

    const a = Number(match[1]);
    const op = match[2];
    const b = Number(match[3]);

    let answer = 0;
    if (op === "+") answer = a + b;
    if (op === "-") answer = a - b;
    if (op === "*") answer = a * b;
    if (op === "/") {
      if (b === 0) continue;
      answer = a / b;
      if (!Number.isInteger(answer)) continue;
    }

    const displayOp = op === "*" ? "×" : op === "/" ? "÷" : op;
    const wrongSet = new Set();
    while (wrongSet.size < 2) {
      const delta = Math.floor(Math.random() * 6) + 1;
      const candidate = answer + (Math.random() > 0.5 ? delta : -delta);
      if (candidate !== answer && candidate >= 0) wrongSet.add(candidate);
    }

    items.push({
      id: uid("mathocr"),
      subject: "MATH",
      text: `${a} ${displayOp} ${b} = ?`,
      answer: String(answer),
      options: shuffle([String(answer), ...Array.from(wrongSet).map(String)]),
      hint: "OCR数学题",
      grade,
      type: "ocr",
    });
  }

  return items;
}

export default function App() {
  const initial = loadState();

  const [mode, setMode] = useState("role");
  const [screen, setScreen] = useState("home");

  const [students, setStudents] = useState(initial.students);
  const [classes, setClasses] = useState(initial.classes);
  const [words, setWords] = useState(initial.words);
  const [mathBank, setMathBank] = useState(initial.mathBank);
  const [assignments, setAssignments] = useState(initial.assignments);
  const [teacherNotes, setTeacherNotes] = useState(initial.teacherNotes);

  const [studentNameInput, setStudentNameInput] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  const [subject, setSubject] = useState("EN");
  const [question, setQuestion] = useState(null);
  const [options, setOptions] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [currentPlanet, setCurrentPlanet] = useState(0);

  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrText, setOcrText] = useState("");
  const [ocrHint, setOcrHint] = useState("");
  const [ocrGrade, setOcrGrade] = useState("一年级");
  const [ocrSubject, setOcrSubject] = useState("CN");
  const [ocrLang, setOcrLang] = useState("chi_sim+eng");

  useEffect(() => {
    saveState({ students, classes, words, mathBank, assignments, teacherNotes });
  }, [students, classes, words, mathBank, assignments, teacherNotes]);

  const currentStudent =
    students.find((s) => s.id === selectedStudentId) ||
    students.find((s) => s.name === studentNameInput.trim()) ||
    null;

  const leaderboard = useMemo(() => [...students].sort((a, b) => b.score - a.score).slice(0, 8), [students]);

  const unlockedPlanet = currentStudent
    ? PLANETS.reduce((acc, p) => (currentStudent.stars >= p.need ? p.id : acc), 0)
    : 0;

  function updateStudent(patch) {
    setStudents((prev) =>
      prev.map((s) => (s.id === selectedStudentId ? { ...s, ...patch } : s))
    );
  }

  function createOrSelectStudent() {
    const clean = studentNameInput.trim();
    if (!clean) {
      alert("请输入学生名字");
      return;
    }

    const existing = students.find((s) => s.name === clean);
    if (existing) {
      setSelectedStudentId(existing.id);
      setSubject(existing.subject || "EN");
      setMode("student");
      setScreen("home");
      return;
    }

    const newStudent = {
      id: uid("stu"),
      name: clean,
      classId: "c1",
      grade: "一年级",
      subject: "EN",
      stars: 0,
      score: 0,
      level: 1,
      inventory: [],
      petFood: 0,
      pet: null,
      stats: { correct: 0, wrong: 0, learned: 0 },
      wrongWords: [],
    };

    setStudents((prev) => [...prev, newStudent]);
    setSelectedStudentId(newStudent.id);
    setSubject("EN");
    setMode("student");
    setScreen("home");
  }

  function generateLanguageQuestion() {
    if (!currentStudent) return;

    const pool = words.filter((w) => w.subject === subject && w.grade === currentStudent.grade);
    const bank = pool.length ? pool : words.filter((w) => w.subject === subject);
    if (!bank.length) {
      alert("这个科目暂时没有题目");
      return;
    }

    const q = bank[Math.floor(Math.random() * bank.length)];
    const correct = q.answer;
    const wrongs = shuffle(
      bank.map((w) => w.answer).filter((a) => a !== correct)
    ).slice(0, 2);

    setQuestion(q);
    setOptions(shuffle([correct, ...wrongs]));
    setFeedback("");
  }

  function generateMathQuestion() {
    if (!currentStudent) return;

    const imported = mathBank.filter((m) => m.grade === currentStudent.grade);
    const useImported = imported.length > 0 && Math.random() > 0.4;

    const q = useImported
      ? imported[Math.floor(Math.random() * imported.length)]
      : createMathQuestionByGrade(currentStudent.grade);

    setQuestion(q);
    setOptions(q.options);
    setFeedback("");
  }

  function generateQuestion() {
    if (subject === "MATH") {
      generateMathQuestion();
    } else {
      generateLanguageQuestion();
    }
  }

  function answer(opt) {
    if (!question || !currentStudent) return;

    const correct = question.answer;

    if (String(opt) === String(correct)) {
      const newScore = currentStudent.score + 1;
      const newStars = currentStudent.stars + 2;
      const newLevel = Math.floor(newScore / 5) + 1;

      updateStudent({
        score: newScore,
        stars: newStars,
        level: newLevel,
        subject,
        stats: {
          ...currentStudent.stats,
          correct: currentStudent.stats.correct + 1,
          learned: currentStudent.stats.learned + 1,
        },
      });

      setFeedback("✅ 正确！");
      if (newScore % 5 === 0) {
        alert("🎁 恭喜获得太空宝箱！");
      }
    } else {
      updateStudent({
        subject,
        stats: {
          ...currentStudent.stats,
          wrong: currentStudent.stats.wrong + 1,
          learned: currentStudent.stats.learned + 1,
        },
        wrongWords: [...currentStudent.wrongWords, `${subject}: ${question.text} → ${correct}`],
      });
      setFeedback(`❌ 错误，正确答案是：${correct}`);
    }

    setTimeout(() => generateQuestion(), 850);
  }

  function playQuestion() {
    if (!question) return;
    const text = subject === "MATH" ? String(question.text) : String(question.text);
    speakText(text, LANGS[subject].tts);
  }

  function buy(item) {
    if (!currentStudent) return;
    if (currentStudent.stars < item.price) {
      alert("星星不足");
      return;
    }

    if (item.type === "pet" && currentStudent.pet) {
      alert("已经有宠物了");
      return;
    }

    if (item.type === "food") {
      updateStudent({
        stars: currentStudent.stars - item.price,
        petFood: currentStudent.petFood + 1,
      });
      return;
    }

    if (item.type === "pet") {
      updateStudent({
        stars: currentStudent.stars - item.price,
        pet: { name: item.name, exp: 0 },
      });
      return;
    }

    updateStudent({
      stars: currentStudent.stars - item.price,
      inventory: [...currentStudent.inventory, item],
    });
  }

  function feedPet() {
    if (!currentStudent?.pet) {
      alert("还没有宠物");
      return;
    }
    if (currentStudent.petFood <= 0) {
      alert("没有宠物粮食");
      return;
    }

    updateStudent({
      petFood: currentStudent.petFood - 1,
      pet: {
        ...currentStudent.pet,
        exp: currentStudent.pet.exp + 1,
      },
    });
  }

  async function scanImage(file) {
    if (!file) return;
    setOcrLoading(true);

    try {
      const result = await Tesseract.recognize(file, ocrLang, {
        logger: () => {},
      });
      setOcrText(result.data.text || "");
    } catch (error) {
      console.error(error);
      alert("OCR 识别失败");
    } finally {
      setOcrLoading(false);
    }
  }

  function addOCRItems() {
    if (!ocrText.trim()) {
      alert("没有可加入的内容");
      return;
    }

    if (ocrSubject === "MATH") {
      const mathItems = parseOCRTextToMathItems(ocrText, ocrGrade);
      if (!mathItems.length) {
        alert("没有识别到有效的数学题，例如：12+5=17");
        return;
      }
      setMathBank((prev) => [...prev, ...mathItems]);
      setOcrText("");
      alert(`已加入 ${mathItems.length} 题数学题`);
      return;
    }

    const items = parseOCRTextToLanguageItems(ocrText, ocrSubject, ocrGrade, ocrHint);
    if (!items.length) {
      alert("没有可加入的题目");
      return;
    }

    setWords((prev) => [...prev, ...items]);
    setOcrText("");
    setOcrHint("");
    alert(`已加入 ${items.length} 题`);
  }

  function addTeacherAssignment() {
    const targetWords = words.slice(0, 5).map((w) => w.id);
    setAssignments((prev) => [
      ...prev,
      {
        id: uid("a"),
        title: `老师作业 ${prev.length + 1}`,
        classId: "c1",
        grade: "一年级",
        wordIds: targetWords,
      },
    ]);
    setTeacherNotes((prev) => [...prev, "已发布新作业"]);
    alert("已发布新作业");
  }

  if (mode === "role") {
    return (
      <div style={pageStyle}>
        <style>{globalCss}</style>
        <div style={centerCardStyle}>
          <h1 style={{ marginTop: 0 }}>🚀 探索星球 v13</h1>
          <p style={{ color: "#cbd5e1" }}>英文 / 中文 / 马来文 / 数学 完整版</p>

          <input
            value={studentNameInput}
            onChange={(e) => setStudentNameInput(e.target.value)}
            placeholder="输入学生名字"
            style={inputStyle}
          />

          <div style={buttonWrapStyle}>
            <button style={btnStyle} onClick={createOrSelectStudent}>学生登录</button>
            <button style={btnStyle} onClick={() => setMode("parent")}>家长后台</button>
            <button style={btnStyle} onClick={() => setMode("teacher")}>老师后台</button>
            <button style={btnStyle} onClick={() => setMode("admin")}>管理员后台</button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === "student" && !currentStudent) {
    return (
      <div style={pageStyle}>
        <style>{globalCss}</style>
        <div style={centerCardStyle}>
          <h2>正在进入学生页面...</h2>
          <button style={btnStyle} onClick={() => setMode("role")}>返回入口</button>
        </div>
      </div>
    );
  }

  if (mode === "student" && currentStudent) {
    return (
      <div style={pageStyle}>
        <style>{globalCss}</style>

        <div style={headerStyle}>
          <div>
            <h1 style={{ margin: 0 }}>🚀 探索星球</h1>
            <div style={{ color: "#cbd5e1" }}>学生中心</div>
          </div>
          <div style={buttonWrapStyle}>
            <button style={smallBtnStyle} onClick={() => setMode("role")}>退出</button>
          </div>
        </div>

        <div style={mainGridStyle}>
          <div style={panelStyle}>
            {screen === "home" && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                  <Astronaut2D name={currentStudent.name} level={currentStudent.level} inventory={currentStudent.inventory} />
                  <Pet2D pet={currentStudent.pet} />
                </div>

                <div style={statsWrapStyle}>
                  <StatCard label="等级" value={`Lv.${currentStudent.level}`} />
                  <StatCard label="星星" value={`⭐ ${currentStudent.stars}`} />
                  <StatCard label="分数" value={`🎯 ${currentStudent.score}`} />
                  <StatCard
                    label="正确率"
                    value={`${Math.round((currentStudent.stats.correct / Math.max(1, currentStudent.stats.learned)) * 100)}%`}
                  />
                </div>

                <h3>📚 选择科目</h3>
                <div style={buttonWrapStyle}>
                  {SUBJECTS.map((sub) => (
                    <button
                      key={sub}
                      style={{ ...btnStyle, background: subject === sub ? "#16a34a" : "#4f46e5" }}
                      onClick={() => {
                        setSubject(sub);
                        updateStudent({ subject: sub });
                      }}
                    >
                      {LANGS[sub].label}
                    </button>
                  ))}
                </div>

                <h3>🌌 星球地图</h3>
                <div style={planetGridStyle}>
                  {PLANETS.map((p) => {
                    const unlocked = p.id <= unlockedPlanet;
                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          if (!unlocked) return;
                          setCurrentPlanet(p.id);
                          setScreen("quiz");
                          setTimeout(generateQuestion, 0);
                        }}
                        style={{
                          ...planetStyle,
                          opacity: unlocked ? 1 : 0.45,
                          cursor: unlocked ? "pointer" : "not-allowed",
                        }}
                      >
                        <div style={{ fontSize: 34 }}>{p.icon}</div>
                        <div>{p.name}</div>
                        <div style={{ fontSize: 12, color: "#cbd5e1" }}>
                          {unlocked ? "可进入" : `需要 ${p.need} ⭐`}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div style={buttonWrapStyle}>
                  <button style={btnStyle} onClick={() => { setScreen("quiz"); setTimeout(generateQuestion, 0); }}>开始学习</button>
                  <button style={btnStyle} onClick={() => setScreen("shop")}>太空商店</button>
                  <button style={btnStyle} onClick={() => setScreen("pet")}>我的宠物</button>
                  <button style={btnStyle} onClick={() => setScreen("bag")}>我的装备</button>
                </div>
              </>
            )}

            {screen === "quiz" && question && (
              <>
                <h2>📚 {LANGS[subject].label} 闯关</h2>
                <p style={{ color: "#cbd5e1" }}>
                  当前星球：{PLANETS[currentPlanet]?.icon} {PLANETS[currentPlanet]?.name}
                </p>
                <p>提示：{question.hint}</p>

                <div style={buttonWrapStyle}>
                  <button style={btnStyle} onClick={playQuestion}>🔊 读题</button>
                  <button style={btnStyle} onClick={() => setScreen("home")}>返回首页</button>
                </div>

                <div style={{ marginTop: 18, textAlign: "center", fontSize: 28, fontWeight: 800 }}>
                  {question.text}
                </div>

                <div style={{ marginTop: 18, ...buttonWrapStyle }}>
                  {options.map((opt) => (
                    <button key={opt} style={optionBtnStyle} onClick={() => answer(opt)}>
                      {opt}
                    </button>
                  ))}
                </div>

                <h3>{feedback}</h3>
              </>
            )}

            {screen === "shop" && (
              <>
                <h2>🛒 太空商店</h2>
                <p>你有 ⭐ {currentStudent.stars}</p>
                {SHOP_ITEMS.map((item) => (
                  <div key={item.id} style={listCardStyle}>
                    <span style={{ fontSize: 28 }}>{item.icon}</span>
                    <span>{item.name}</span>
                    <span>⭐ {item.price}</span>
                    <button onClick={() => buy(item)}>购买</button>
                  </div>
                ))}
                <button style={btnStyle} onClick={() => setScreen("home")}>返回首页</button>
              </>
            )}

            {screen === "pet" && (
              <>
                <h2>🐶 我的宠物</h2>
                <Pet2D pet={currentStudent.pet} />
                {currentStudent.pet ? (
                  <>
                    <p>🍖 粮食：{currentStudent.petFood}</p>
                    <button style={btnStyle} onClick={feedPet}>喂食</button>
                  </>
                ) : (
                  <p>还没有宠物，去商店购买吧。</p>
                )}
                <button style={btnStyle} onClick={() => setScreen("home")}>返回首页</button>
              </>
            )}

            {screen === "bag" && (
              <>
                <h2>🎒 我的装备</h2>
                {currentStudent.inventory.length === 0 && <p>暂无装备</p>}
                {currentStudent.inventory.map((item, idx) => (
                  <div key={`${item.id}_${idx}`} style={listCardStyle}>
                    <span style={{ fontSize: 28 }}>{item.icon}</span>
                    <span>{item.name}</span>
                  </div>
                ))}
                <button style={btnStyle} onClick={() => setScreen("home")}>返回首页</button>
              </>
            )}
          </div>

          <div style={sidePanelStyle}>
            <h3>📅 每日任务</h3>
            <TaskRow done={currentStudent.stats.learned >= 5} text="完成 5 题" />
            <TaskRow done={currentStudent.stats.learned >= 10} text="完成 10 题" />
            <TaskRow done={currentStudent.stars >= 10} text="获得 10 颗星星" />
            <TaskRow done={currentStudent.score >= 5} text="答对 5 题" />

            <h3 style={{ marginTop: 20 }}>🏆 排行榜</h3>
            {leaderboard.map((s, i) => (
              <div key={s.id} style={rankRowStyle}>
                <span>{i + 1}. {s.name}</span>
                <span>{s.score}</span>
              </div>
            ))}

            <h3 style={{ marginTop: 20 }}>❌ 错题本</h3>
            {currentStudent.wrongWords.length === 0 ? (
              <div style={{ color: "#cbd5e1" }}>目前没有错题</div>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {currentStudent.wrongWords.slice(-10).map((w, i) => (
                  <span key={`${w}_${i}`} style={chipStyle}>{w}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (mode === "parent") {
    return (
      <div style={pageStyle}>
        <style>{globalCss}</style>
        <div style={headerStyle}>
          <h1 style={{ margin: 0 }}>👨‍👩‍👧 家长后台</h1>
          <button style={smallBtnStyle} onClick={() => setMode("role")}>返回入口</button>
        </div>

        {students.length === 0 ? (
          <div style={panelStyle}>还没有学生记录</div>
        ) : (
          <div style={mainGridStyle}>
            {students.map((stu) => (
              <div key={stu.id} style={panelStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                  <Astronaut2D name={stu.name} level={stu.level} inventory={stu.inventory} />
                  <Pet2D pet={stu.pet} />
                </div>

                <div style={statsWrapStyle}>
                  <StatCard label="分数" value={stu.score} />
                  <StatCard label="星星" value={stu.stars} />
                  <StatCard label="科目" value={LANGS[stu.subject || "EN"].label} />
                  <StatCard
                    label="正确率"
                    value={`${Math.round((stu.stats.correct / Math.max(1, stu.stats.learned)) * 100)}%`}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (mode === "teacher") {
    return (
      <div style={pageStyle}>
        <style>{globalCss}</style>
        <div style={headerStyle}>
          <h1 style={{ margin: 0 }}>🧑‍🏫 老师后台</h1>
          <button style={smallBtnStyle} onClick={() => setMode("role")}>返回入口</button>
        </div>

        <div style={mainGridStyle}>
          <div style={panelStyle}>
            <h2>🏫 班级</h2>
            {classes.map((c) => (
              <div key={c.id} style={listCardStyle}>
                <span>{c.name}</span>
              </div>
            ))}

            <h2 style={{ marginTop: 20 }}>📝 作业管理</h2>
            <button style={btnStyle} onClick={addTeacherAssignment}>发布示范作业</button>
            {assignments.map((a) => (
              <div key={a.id} style={listCardStyle}>
                <span>{a.title}</span>
                <span>{a.grade}</span>
              </div>
            ))}
          </div>

          <div style={panelStyle}>
            <h2>👩‍🎓 学生列表</h2>
            {students.length === 0 ? (
              <div style={{ color: "#cbd5e1" }}>暂无学生</div>
            ) : (
              students.map((s) => (
                <div key={s.id} style={listCardStyle}>
                  <span>{s.name}</span>
                  <span>{LANGS[s.subject || "EN"].label}</span>
                  <span>⭐ {s.stars}</span>
                </div>
              ))
            )}

            <h2 style={{ marginTop: 20 }}>📌 老师通知</h2>
            {teacherNotes.length === 0 ? (
              <div style={{ color: "#cbd5e1" }}>暂无通知</div>
            ) : (
              teacherNotes.map((n, i) => <div key={i} style={miniCardStyle}>{n}</div>)
            )}
          </div>
        </div>
      </div>
    );
  }

  if (mode === "admin") {
    return (
      <div style={pageStyle}>
        <style>{globalCss}</style>
        <div style={headerStyle}>
          <h1 style={{ margin: 0 }}>🛠 管理员后台</h1>
          <button style={smallBtnStyle} onClick={() => setMode("role")}>返回入口</button>
        </div>

        <div style={mainGridStyle}>
          <div style={panelStyle}>
            <h2>📸 OCR 导入题库</h2>

            <select
              value={ocrSubject}
              onChange={(e) => setOcrSubject(e.target.value)}
              style={{ ...inputStyle, width: "100%", marginBottom: 12 }}
            >
              <option value="EN">英文题目</option>
              <option value="CN">中文题目</option>
              <option value="BM">马来文题目</option>
              <option value="MATH">数学题目</option>
            </select>

            <select
              value={ocrLang}
              onChange={(e) => setOcrLang(e.target.value)}
              style={{ ...inputStyle, width: "100%", marginBottom: 12 }}
            >
              <option value="eng">英文 OCR</option>
              <option value="chi_sim+eng">简体中文 + 英文 OCR</option>
              <option value="chi_tra+eng">繁体中文 + 英文 OCR</option>
              <option value="msa+eng">马来文 + 英文 OCR</option>
              <option value="eng+chi_sim">数学 / 英文混合 OCR</option>
            </select>

            <input type="file" accept="image/*" onChange={(e) => scanImage(e.target.files?.[0])} />
            {ocrLoading && <p>识别中...</p>}

            <textarea
              value={ocrText}
              onChange={(e) => setOcrText(e.target.value)}
              placeholder="OCR 识别结果"
              style={{ width: "100%", minHeight: 180, marginTop: 12, padding: 12, borderRadius: 12 }}
            />

            {ocrSubject !== "MATH" && (
              <input
                value={ocrHint}
                onChange={(e) => setOcrHint(e.target.value)}
                placeholder="题目提示，例如：水果 / 动物 / 学校"
                style={{ ...inputStyle, width: "100%", marginTop: 12 }}
              />
            )}

            <select
              value={ocrGrade}
              onChange={(e) => setOcrGrade(e.target.value)}
              style={{ ...inputStyle, width: "100%", marginTop: 12 }}
            >
              {GRADES.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>

            <button style={btnStyle} onClick={addOCRItems}>加入题库</button>
          </div>

          <div style={panelStyle}>
            <h2>📚 当前语言题库</h2>
            <div style={{ maxHeight: 220, overflow: "auto", marginBottom: 18 }}>
              {words.map((w) => (
                <div key={w.id} style={listCardStyle}>
                  <span>{w.text}</span>
                  <span>{w.subject}</span>
                  <span>{w.grade}</span>
                </div>
              ))}
            </div>

            <h2>🧮 当前数学题库</h2>
            <div style={{ maxHeight: 220, overflow: "auto" }}>
              {mathBank.map((m) => (
                <div key={m.id} style={listCardStyle}>
                  <span>{m.text}</span>
                  <span>{m.grade}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

const pageStyle = {
  minHeight: "100vh",
  background: "radial-gradient(circle at top, #1d4ed8 0%, #0f172a 50%, #020617 100%)",
  color: "white",
  padding: 16,
  boxSizing: "border-box",
  fontFamily: "Arial, sans-serif",
};

const centerCardStyle = {
  maxWidth: 560,
  margin: "8vh auto 0",
  background: "rgba(255,255,255,0.08)",
  borderRadius: 24,
  padding: 28,
  textAlign: "center",
  boxShadow: "0 10px 30px rgba(0,0,0,0.22)",
};

const mainGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: 18,
};

const panelStyle = {
  background: "rgba(255,255,255,0.08)",
  borderRadius: 24,
  padding: 20,
  boxShadow: "0 10px 30px rgba(0,0,0,0.22)",
};

const sidePanelStyle = {
  background: "rgba(255,255,255,0.08)",
  borderRadius: 24,
  padding: 20,
  boxShadow: "0 10px 30px rgba(0,0,0,0.22)",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
  marginBottom: 18,
};

const inputStyle = {
  padding: 12,
  fontSize: 16,
  borderRadius: 12,
  border: "none",
  outline: "none",
  boxSizing: "border-box",
};

const btnStyle = {
  padding: "12px 18px",
  fontSize: 16,
  borderRadius: 12,
  border: "none",
  background: "#4f46e5",
  color: "white",
  cursor: "pointer",
};

const smallBtnStyle = {
  padding: "10px 14px",
  fontSize: 14,
  borderRadius: 10,
  border: "none",
  background: "#334155",
  color: "white",
  cursor: "pointer",
};

const optionBtnStyle = {
  padding: "14px 18px",
  minWidth: 140,
  fontSize: 16,
  borderRadius: 14,
  border: "none",
  background: "#2563eb",
  color: "white",
  cursor: "pointer",
};

const buttonWrapStyle = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  justifyContent: "center",
  alignItems: "center",
};

const statsWrapStyle = {
  display: "flex",
  gap: 12,
  flexWrap: "wrap",
  justifyContent: "center",
  marginTop: 14,
  marginBottom: 14,
};

const planetGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
  gap: 12,
  marginTop: 12,
  marginBottom: 18,
};

const planetStyle = {
  border: "none",
  borderRadius: 18,
  padding: 14,
  background: "linear-gradient(135deg,#3b82f6,#7c3aed)",
  color: "white",
};

const listCardStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  padding: 12,
  borderRadius: 14,
  background: "rgba(255,255,255,0.06)",
  marginBottom: 10,
};

const miniCardStyle = {
  padding: 10,
  borderRadius: 12,
  background: "rgba(255,255,255,0.06)",
  marginBottom: 10,
};

const chipStyle = {
  padding: "6px 10px",
  borderRadius: 999,
  background: "rgba(239,68,68,0.2)",
  color: "#fecaca",
  fontSize: 13,
};

const rankRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: 10,
  padding: "8px 0",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
};

const petWrapStyle = {
  textAlign: "center",
  minWidth: 160,
  padding: 12,
  borderRadius: 18,
  background: "rgba(255,255,255,0.06)",
};

const globalCss = `
@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
  100% { transform: translateY(0px); }
}
body {
  margin: 0;
}
button:hover {
  opacity: 0.92;
}
`;