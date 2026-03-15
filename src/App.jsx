import React, { useEffect, useMemo, useState } from "react";

const LANGS = {
  EN: { label: "English", key: "en", voice: "en-US", recognition: "en-US" },
  CN: { label: "中文", key: "cn", voice: "zh-CN", recognition: "zh-CN" },
  BM: { label: "Bahasa", key: "bm", voice: "ms-MY", recognition: "ms-MY" },
};

const PLANETS = [
  { id: 0, name: "地球", icon: "🌍", needStars: 0 },
  { id: 1, name: "月球", icon: "🌙", needStars: 8 },
  { id: 2, name: "火星", icon: "🪐", needStars: 16 },
  { id: 3, name: "木星", icon: "⭐", needStars: 24 },
  { id: 4, name: "银河", icon: "🌌", needStars: 32 },
];

const LIBRARY = {
  "一年级": [
    { en: "apple", cn: "苹果", bm: "epal", hint: "水果", sentence: "I eat an apple." },
    { en: "cat", cn: "猫", bm: "kucing", hint: "动物", sentence: "The cat is small." },
    { en: "dog", cn: "狗", bm: "anjing", hint: "动物", sentence: "The dog can run." },
    { en: "sun", cn: "太阳", bm: "matahari", hint: "天空", sentence: "The sun is hot." },
    { en: "milk", cn: "牛奶", bm: "susu", hint: "饮料", sentence: "Milk is white." },
    { en: "book", cn: "书", bm: "buku", hint: "阅读", sentence: "This is my book." },
    { en: "ball", cn: "球", bm: "bola", hint: "玩具", sentence: "Kick the ball." },
    { en: "cake", cn: "蛋糕", bm: "kek", hint: "甜点", sentence: "The cake is sweet." },
    { en: "star", cn: "星星", bm: "bintang", hint: "夜空", sentence: "I see a star." },
    { en: "fish", cn: "鱼", bm: "ikan", hint: "水里游", sentence: "The fish can swim." },
  ],
  "二年级": [
    { en: "banana", cn: "香蕉", bm: "pisang", hint: "黄色水果", sentence: "Bananas are yellow." },
    { en: "teacher", cn: "老师", bm: "guru", hint: "学校", sentence: "My teacher is kind." },
    { en: "school", cn: "学校", bm: "sekolah", hint: "学习的地方", sentence: "I go to school." },
    { en: "friend", cn: "朋友", bm: "kawan", hint: "伙伴", sentence: "My friend is here." },
    { en: "window", cn: "窗户", bm: "tingkap", hint: "房子里", sentence: "Open the window." },
    { en: "garden", cn: "花园", bm: "taman", hint: "种花的地方", sentence: "The garden is pretty." },
    { en: "happy", cn: "快乐", bm: "gembira", hint: "开心", sentence: "I feel happy." },
    { en: "yellow", cn: "黄色", bm: "kuning", hint: "颜色", sentence: "This flower is yellow." },
    { en: "mother", cn: "妈妈", bm: "ibu", hint: "家人", sentence: "My mother cooks well." },
    { en: "father", cn: "爸爸", bm: "bapa", hint: "家人", sentence: "My father is tall." },
  ],
  "三年级": [
    { en: "because", cn: "因为", bm: "kerana", hint: "表示原因", sentence: "I smile because I am happy." },
    { en: "library", cn: "图书馆", bm: "perpustakaan", hint: "借书的地方", sentence: "We read in the library." },
    { en: "picture", cn: "图画", bm: "gambar", hint: "照片或图", sentence: "Draw a picture here." },
    { en: "family", cn: "家庭", bm: "keluarga", hint: "爸爸妈妈孩子", sentence: "My family eats together." },
    { en: "flower", cn: "花", bm: "bunga", hint: "植物", sentence: "The flower smells nice." },
    { en: "people", cn: "人们", bm: "orang", hint: "很多人", sentence: "Many people are waiting." },
    { en: "outside", cn: "外面", bm: "luar", hint: "不是里面", sentence: "Let's play outside." },
    { en: "morning", cn: "早晨", bm: "pagi", hint: "一天开始", sentence: "Good morning, teacher." },
    { en: "animal", cn: "动物", bm: "haiwan", hint: "生物", sentence: "The zoo has many animals." },
    { en: "answer", cn: "答案", bm: "jawapan", hint: "问题后面", sentence: "Write your answer clearly." },
  ],
  "四年级": [
    { en: "beautiful", cn: "美丽", bm: "cantik", hint: "很漂亮", sentence: "The sky is beautiful." },
    { en: "important", cn: "重要", bm: "penting", hint: "很关键", sentence: "Sleep is important." },
    { en: "different", cn: "不同", bm: "berbeza", hint: "不一样", sentence: "These two books are different." },
    { en: "remember", cn: "记得", bm: "ingat", hint: "记住", sentence: "Remember your homework." },
    { en: "holiday", cn: "假期", bm: "cuti", hint: "放假", sentence: "We travel in the holiday." },
    { en: "science", cn: "科学", bm: "sains", hint: "学科", sentence: "Science is interesting." },
    { en: "country", cn: "国家", bm: "negara", hint: "nation", sentence: "Malaysia is my country." },
    { en: "weather", cn: "天气", bm: "cuaca", hint: "晴天雨天", sentence: "The weather is hot today." },
    { en: "planet", cn: "星球", bm: "planet", hint: "宇宙", sentence: "Earth is a planet." },
    { en: "rocket", cn: "火箭", bm: "roket", hint: "飞上天", sentence: "The rocket goes up fast." },
  ],
  "五年级": [
    { en: "adventure", cn: "冒险", bm: "pengembaraan", hint: "刺激旅程", sentence: "Our adventure begins now." },
    { en: "knowledge", cn: "知识", bm: "pengetahuan", hint: "学习得到", sentence: "Reading gives us knowledge." },
    { en: "question", cn: "问题", bm: "soalan", hint: "问句", sentence: "Ask one good question." },
    { en: "language", cn: "语言", bm: "bahasa", hint: "说话系统", sentence: "English is a language." },
    { en: "journey", cn: "旅程", bm: "perjalanan", hint: "出发过程", sentence: "The journey was long." },
    { en: "student", cn: "学生", bm: "murid", hint: "学校里", sentence: "Every student must listen." },
    { en: "practice", cn: "练习", bm: "latihan", hint: "重复做", sentence: "Practice makes you better." },
    { en: "correct", cn: "正确", bm: "betul", hint: "对的", sentence: "Your answer is correct." },
    { en: "challenge", cn: "挑战", bm: "cabaran", hint: "要克服", sentence: "This challenge is fun." },
    { en: "progress", cn: "进步", bm: "kemajuan", hint: "越来越好", sentence: "I can see your progress." },
  ],
  "六年级": [
    { en: "discover", cn: "发现", bm: "menemui", hint: "找到新的", sentence: "We discover new ideas." },
    { en: "creative", cn: "有创意", bm: "kreatif", hint: "想法特别", sentence: "She is very creative." },
    { en: "imagine", cn: "想象", bm: "bayangkan", hint: "脑海画面", sentence: "Imagine a better world." },
    { en: "explorer", cn: "探索者", bm: "peneroka", hint: "去发现的人", sentence: "The explorer is brave." },
    { en: "mission", cn: "任务", bm: "misi", hint: "要完成的事", sentence: "Finish the mission today." },
    { en: "victory", cn: "胜利", bm: "kemenangan", hint: "赢了", sentence: "Victory feels great." },
    { en: "future", cn: "未来", bm: "masa depan", hint: "将来", sentence: "The future is bright." },
    { en: "memory", cn: "记忆", bm: "ingatan", hint: "脑中留下", sentence: "This trip is a good memory." },
    { en: "strategy", cn: "策略", bm: "strategi", hint: "计划方法", sentence: "We need a new strategy." },
    { en: "improve", cn: "改善", bm: "meningkatkan", hint: "变更好", sentence: "Practice will improve your skill." },
  ],
};

const STORAGE_KEY = "explore-planet-v5";

function shuffle(list) {
  return [...list].sort(() => Math.random() - 0.5);
}

function getWordByLang(item, lang) {
  return item[LANGS[lang].key];
}

function normalizeBmText(text) {
  return text
    .replace(/\bsekolah\b/gi, "sekolah")
    .replace(/\bkucing\b/gi, "kucing")
    .replace(/\brumah\b/gi, "rumah")
    .replace(/\bguru\b/gi, "guru")
    .replace(/\bbuku\b/gi, "buku")
    .replace(/\bpisang\b/gi, "pisang")
    .replace(/\btingkap\b/gi, "tingkap")
    .replace(/\bgembira\b/gi, "gembira")
    .replace(/\bkeluarga\b/gi, "keluarga");
}

function speakText(text, voice = "en-US", rate = 0.9) {
  if (!window.speechSynthesis) return;

  const voices = window.speechSynthesis.getVoices();
  let selectedVoice = null;
  let finalText = text;

  if (voice === "ms-MY") {
    finalText = normalizeBmText(text);
    selectedVoice =
      voices.find((v) => v.lang === "ms-MY") ||
      voices.find((v) => v.lang.toLowerCase().includes("ms-my")) ||
      voices.find((v) => v.lang.toLowerCase().startsWith("ms")) ||
      null;
  } else if (voice === "zh-CN") {
    selectedVoice =
      voices.find((v) => v.lang === "zh-CN") ||
      voices.find((v) => v.lang.toLowerCase().startsWith("zh")) ||
      null;
  } else {
    selectedVoice =
      voices.find((v) => v.lang === "en-US") ||
      voices.find((v) => v.lang.toLowerCase().startsWith("en")) ||
      null;
  }

  const speech = new SpeechSynthesisUtterance(finalText);
  if (selectedVoice) speech.voice = selectedVoice;
  speech.lang = voice;
  speech.rate = rate;
  speech.pitch = 1;
  speech.volume = 1;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(speech);
}

function loadSavedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function App() {
  const saved = loadSavedState();

  const [screen, setScreen] = useState(saved?.screen || "map");
  const [grade, setGrade] = useState(saved?.grade || "一年级");
  const [lang, setLang] = useState(saved?.lang || "EN");
  const [planetId, setPlanetId] = useState(saved?.planetId || 0);
  const [questionIndex, setQuestionIndex] = useState(saved?.questionIndex || 0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(saved?.score || 0);
  const [stars, setStars] = useState(saved?.stars || 0);
  const [exp, setExp] = useState(saved?.exp || 0);
  const [wrongBook, setWrongBook] = useState(saved?.wrongBook || []);
  const [dailyCount, setDailyCount] = useState(saved?.dailyCount || 0);
  const [teacherMode, setTeacherMode] = useState(saved?.teacherMode || false);
  const [customWord, setCustomWord] = useState("");
  const [customList, setCustomList] = useState(saved?.customList || []);
  const [slowMode, setSlowMode] = useState(saved?.slowMode || false);
  const [leaderboard, setLeaderboard] = useState(saved?.leaderboard || [
    { name: "小宇航员A", score: 18 },
    { name: "小宇航员B", score: 15 },
    { name: "小宇航员C", score: 12 },
  ]);
  const [bmVoiceStatus, setBmVoiceStatus] = useState("检测中...");

  const lessonWords = useMemo(() => {
    const base = LIBRARY[grade] || [];
    const merged = [...base, ...customList];
    return shuffle(merged).slice(0, 5);
  }, [grade, customList, planetId]);

  const current = lessonWords[questionIndex];
  const level = Math.floor(exp / 25) + 1;
  const accuracy = dailyCount ? Math.round((score / dailyCount) * 100) : 0;
  const unlockedPlanet = Math.min(PLANETS.length - 1, Math.floor(stars / 8));
  const aiTip = current
    ? teacherMode
      ? `AI老师提示：这个单词和“${current.hint}”有关。${lang === "EN" ? "Listen to the first sound carefully." : "先听清楚开头发音。"}`
      : `提示：${current.hint}`
    : "";

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        screen,
        grade,
        lang,
        planetId,
        questionIndex,
        score,
        stars,
        exp,
        wrongBook,
        dailyCount,
        teacherMode,
        customList,
        slowMode,
        leaderboard,
      })
    );
  }, [screen, grade, lang, planetId, questionIndex, score, stars, exp, wrongBook, dailyCount, teacherMode, customList, slowMode, leaderboard]);

  useEffect(() => {
    const updateVoices = () => {
      const voices = window.speechSynthesis?.getVoices?.() || [];
      const hasBm = voices.some(
        (v) => v.lang === "ms-MY" || v.lang.toLowerCase().includes("ms-my") || v.lang.toLowerCase().startsWith("ms")
      );
      setBmVoiceStatus(hasBm ? "✅ 已检测到马来文语音" : "⚠️ 电脑未检测到 ms-MY 语音，可能会退回其他口音");
    };
    updateVoices();
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  const playWord = () => {
    if (!current) return;
    speakText(getWordByLang(current, lang), LANGS[lang].voice, slowMode ? 0.6 : 0.9);
  };

  const playSentence = () => {
    if (!current) return;
    if (lang === "EN") {
      speakText(current.sentence, "en-US", slowMode ? 0.65 : 0.95);
    } else if (lang === "CN") {
      speakText(current.cn, "zh-CN", slowMode ? 0.6 : 0.9);
    } else {
      speakText(current.bm, "ms-MY", slowMode ? 0.58 : 0.82);
    }
  };

  const playBmDemo = () => {
    speakText("sekolah kucing rumah guru buku", "ms-MY", 0.78);
  };

  const checkAnswer = () => {
    if (!current) return;
    const target = getWordByLang(current, lang).toLowerCase().trim();
    const typed = answer.toLowerCase().trim();
    const correct = typed === target;
    setDailyCount((v) => v + 1);

    if (correct) {
      setFeedback("✅ 正确！继续前进");
      setScore((v) => v + 1);
      setStars((v) => v + 2);
      setExp((v) => v + 5);
    } else {
      setFeedback(`❌ 错误，正确答案：${getWordByLang(current, lang)}`);
      setStars((v) => v + 1);
      setWrongBook((v) => [...v, getWordByLang(current, lang)]);
    }
  };

  const nextQuestion = () => {
    if (questionIndex < lessonWords.length - 1) {
      setQuestionIndex((v) => v + 1);
      setAnswer("");
      setFeedback("");
    } else {
      const newScore = score;
      setLeaderboard((prev) => [...prev, { name: "你", score: newScore }].sort((a, b) => b.score - a.score).slice(0, 5));
      setScreen("result");
    }
  };

  const startPlanet = (id) => {
    if (id > unlockedPlanet) return;
    setPlanetId(id);
    setQuestionIndex(0);
    setAnswer("");
    setFeedback("");
    setScreen("quiz");
  };

  const addCustomWord = () => {
    const clean = customWord.trim();
    if (!clean) return;
    setCustomList((v) => [...v, { en: clean, cn: clean, bm: clean, hint: "家长自定义单词", sentence: clean }]);
    setCustomWord("");
  };

  const backToMap = () => {
    setScreen("map");
    setQuestionIndex(0);
    setAnswer("");
    setFeedback("");
  };

  const resetAll = () => {
    localStorage.removeItem(STORAGE_KEY);
    setScreen("map");
    setGrade("一年级");
    setLang("EN");
    setPlanetId(0);
    setQuestionIndex(0);
    setAnswer("");
    setFeedback("");
    setScore(0);
    setStars(0);
    setExp(0);
    setWrongBook([]);
    setDailyCount(0);
    setTeacherMode(false);
    setCustomWord("");
    setCustomList([]);
    setSlowMode(false);
    setLeaderboard([
      { name: "小宇航员A", score: 18 },
      { name: "小宇航员B", score: 15 },
      { name: "小宇航员C", score: 12 },
    ]);
  };

  return (
    <div style={pageStyle}>
      <div style={{ maxWidth: 1180, margin: "0 auto", width: "100%" }}>
        <div style={headerRow}>
          <div>
            <div style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.2 }}>🚀 探索星球 v5</div>
            <div style={{ color: "#c7d2fe", marginTop: 6 }}>BM 发音增强版：星球地图 + 存档 + 排行榜 + AI老师 + 家长模式</div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <Pill>⭐ 星星 {stars}</Pill>
            <Pill>🎯 分数 {score}</Pill>
            <Pill>📈 Lv.{level}</Pill>
            <Pill>📘 正确率 {accuracy}%</Pill>
          </div>
        </div>

        <div style={mainGrid}>
          <div style={cardStyle}>
            {screen === "map" && (
              <>
                <div style={toolbarRow}>
                  <h2 style={titleStyle}>🌌 星球地图</h2>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {Object.keys(LANGS).map((key) => (
                      <button key={key} onClick={() => setLang(key)} style={{ ...smallBtn, background: lang === key ? "#22c55e" : "rgba(255,255,255,0.12)", color: "white" }}>
                        {LANGS[key].label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={toolbarRow}>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                    <div>年级：</div>
                    <select value={grade} onChange={(e) => setGrade(e.target.value)} style={selectStyle}>
                      {Object.keys(LIBRARY).map((g) => <option key={g}>{g}</option>)}
                    </select>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button onClick={() => setTeacherMode((v) => !v)} style={{ ...smallBtn, background: teacherMode ? "#8b5cf6" : "#334155", color: "white" }}>
                      🧠 AI老师：{teacherMode ? "开启" : "关闭"}
                    </button>
                    <button onClick={() => setSlowMode((v) => !v)} style={{ ...smallBtn, background: slowMode ? "#0ea5e9" : "#334155", color: "white" }}>
                      🐢 慢速：{slowMode ? "开启" : "关闭"}
                    </button>
                  </div>
                </div>

                <div style={planetGrid}>
                  {PLANETS.map((planet) => {
                    const unlocked = planet.id <= unlockedPlanet;
                    return (
                      <button key={planet.id} onClick={() => startPlanet(planet.id)} style={{ ...planetStyle, background: unlocked ? "linear-gradient(135deg,#3b82f6,#8b5cf6)" : "rgba(255,255,255,0.08)", opacity: unlocked ? 1 : 0.55, cursor: unlocked ? "pointer" : "not-allowed" }}>
                        <div style={{ fontSize: 34 }}>{planet.icon}</div>
                        <div style={{ marginTop: 8, fontWeight: 800 }}>{planet.name}</div>
                        <div style={{ marginTop: 6, fontSize: 13, color: "#e0e7ff" }}>{unlocked ? "可进入" : `需要 ${planet.needStars} 星星`}</div>
                      </button>
                    );
                  })}
                </div>

                <div style={{ ...bmStatusStyle, marginTop: 24 }}>{bmVoiceStatus}</div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
                  <button onClick={playBmDemo} style={{ ...smallBtn, background: "#10b981", color: "white" }}>🎧 测试 BM 发音</button>
                  <button onClick={() => setLang("BM")} style={{ ...smallBtn, background: "#f59e0b", color: "white" }}>切到 Bahasa 模式</button>
                </div>

                <div style={{ marginTop: 24, color: "#dbeafe", lineHeight: 1.8 }}>
                  <div>🌍 选择星球后开始闯关，每关 5 题。</div>
                  <div>🔊 支持英语 / 中文 / 马来西亚国语发音。</div>
                  <div>🇲🇾 v5 已强化 BM 语音优先选择 ms-MY，并加入常见词发音优化。</div>
                  <div>💾 学习记录会自动保存，刷新不会消失。</div>
                </div>
              </>
            )}

            {screen === "quiz" && current && (
              <>
                <div style={toolbarRow}>
                  <button onClick={backToMap} style={{ ...smallBtn, background: "#334155", color: "white" }}>← 返回地图</button>
                  <div style={{ color: "#c7d2fe" }}>{PLANETS[planetId].icon} {PLANETS[planetId].name} · 第 {questionIndex + 1}/{lessonWords.length} 题 · {LANGS[lang].label}</div>
                </div>

                <div style={{ textAlign: "center", marginTop: 28 }}>
                  <div style={{ fontSize: 24, fontWeight: 800 }}>提示：{current.hint}</div>
                  <div style={{ color: "#c7d2fe", marginTop: 8 }}>{aiTip}</div>

                  <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap", marginTop: 22, width: "100%" }}>
                    <button onClick={playWord} style={{ ...bigBtn, background: "#22c55e" }}>🔊 听单词</button>
                    <button onClick={playSentence} style={{ ...bigBtn, background: "#0ea5e9" }}>📖 听例句 / 释义</button>
                  </div>

                  <input value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="输入你听到的单词" style={inputStyle} />

                  <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap", marginTop: 18, width: "100%" }}>
                    <button onClick={checkAnswer} style={{ ...bigBtn, background: "#3b82f6" }}>提交答案</button>
                    <button onClick={nextQuestion} style={{ ...bigBtn, background: "#f59e0b" }}>下一题</button>
                  </div>

                  <div style={{ minHeight: 36, marginTop: 20, fontSize: 22, fontWeight: 700 }}>{feedback}</div>
                </div>
              </>
            )}

            {screen === "result" && (
              <div style={{ textAlign: "center" }}>
                <h2 style={titleStyle}>🎉 闯关完成</h2>
                <div style={resultText}>当前等级：Lv.{level}</div>
                <div style={resultText}>当前星星：{stars}</div>
                <div style={resultText}>累计分数：{score}</div>
                <div style={resultText}>正确率：{accuracy}%</div>
                <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap", marginTop: 22, width: "100%" }}>
                  <button onClick={backToMap} style={{ ...bigBtn, background: "#22c55e" }}>继续闯关</button>
                  <button onClick={resetAll} style={{ ...bigBtn, background: "#ef4444" }}>清空记录重新开始</button>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={cardStyle}>
              <h3 style={sideTitle}>📅 每日任务</h3>
              <Task done={dailyCount >= 5} text="完成 5 题" />
              <Task done={dailyCount >= 10} text="完成 10 题" />
              <Task done={stars >= 10} text="获得 10 颗星星" />
              <Task done={score >= 5} text="答对 5 题" />
            </div>

            <div style={cardStyle}>
              <h3 style={sideTitle}>📊 学习报告</h3>
              <ReportLine label="当前年级" value={grade} />
              <ReportLine label="当前语言" value={LANGS[lang].label} />
              <ReportLine label="今日完成" value={`${dailyCount} 题`} />
              <ReportLine label="累计答对" value={`${score} 题`} />
              <ReportLine label="错误数量" value={`${wrongBook.length} 个`} />
            </div>

            <div style={cardStyle}>
              <h3 style={sideTitle}>🏆 排行榜</h3>
              {leaderboard.map((row, idx) => (
                <div key={`${row.name}-${idx}`} style={rankRowStyle}>
                  <span>{idx + 1}. {row.name}</span>
                  <span>{row.score}</span>
                </div>
              ))}
            </div>

            <div style={cardStyle}>
              <h3 style={sideTitle}>📝 错题本</h3>
              {wrongBook.length === 0 ? (
                <div style={{ color: "#c7d2fe" }}>目前没有错题，继续加油！</div>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {wrongBook.slice(-10).map((word, i) => <span key={`${word}-${i}`} style={chipStyle}>{word}</span>)}
                </div>
              )}
            </div>

            <div style={cardStyle}>
              <h3 style={sideTitle}>👨‍👩‍👧 家长自定义听写</h3>
              <input value={customWord} onChange={(e) => setCustomWord(e.target.value)} placeholder="输入学校本周听写单词" style={{ width: "100%", padding: 12, borderRadius: 12, border: "none", marginBottom: 12 }} />
              <button onClick={addCustomWord} style={{ ...smallBtn, background: "#10b981", color: "white", width: "100%" }}>加入自定义词库</button>
              <div style={{ color: "#c7d2fe", marginTop: 10, fontSize: 14 }}>已加入：{customList.length} 个</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Pill({ children }) {
  return <div style={pillStyle}>{children}</div>;
}

function Task({ done, text }) {
  return <div style={{ marginBottom: 10, color: done ? "#86efac" : "#e2e8f0" }}>{done ? "✅" : "⬜"} {text}</div>;
}

function ReportLine({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, margin: "8px 0", color: "#dbeafe" }}>
      <span>{label}</span>
      <span style={{ fontWeight: 700 }}>{value}</span>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "radial-gradient(circle at top, #2246a8 0%, #12245a 45%, #091126 100%)",
  fontFamily: "Arial, sans-serif",
  color: "white",
  padding: 16,
  boxSizing: "border-box",
};

const headerRow = {
  display: "flex",
  justifyContent: "space-between",
  gap: 14,
  flexWrap: "wrap",
  marginBottom: 24,
  alignItems: "flex-start",
};

const mainGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: 20,
};

const cardStyle = {
  background: "rgba(255,255,255,0.1)",
  borderRadius: 24,
  padding: 24,
  boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
  backdropFilter: "blur(8px)",
};

const pillStyle = {
  background: "rgba(255,255,255,0.12)",
  borderRadius: 999,
  padding: "10px 14px",
  fontWeight: 700,
};

const titleStyle = {
  margin: 0,
  fontSize: 30,
};

const sideTitle = {
  marginTop: 0,
  marginBottom: 14,
  fontSize: 22,
};

const toolbarRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
};

const smallBtn = {
  border: "none",
  borderRadius: 12,
  padding: "10px 14px",
  cursor: "pointer",
  fontWeight: 700,
};

const bigBtn = {
  border: "none",
  borderRadius: 14,
  padding: "12px 18px",
  color: "white",
  cursor: "pointer",
  fontWeight: 800,
  fontSize: 16,
  width: "100%",
  maxWidth: 220,
};

const inputStyle = {
  width: "100%",
  maxWidth: 560,
  marginTop: 26,
  fontSize: 20,
  padding: "14px 16px",
  borderRadius: 16,
  border: "none",
  outline: "none",
  boxSizing: "border-box",
};

const selectStyle = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "none",
  fontSize: 16,
};

const planetGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))",
  gap: 16,
  marginTop: 24,
};

const planetStyle = {
  border: "none",
  borderRadius: 22,
  padding: 20,
  color: "white",
  minHeight: 120,
  boxShadow: "0 10px 24px rgba(0,0,0,0.18)",
};

const chipStyle = {
  background: "rgba(239,68,68,0.18)",
  color: "#fecaca",
  padding: "8px 10px",
  borderRadius: 999,
  fontWeight: 700,
  fontSize: 14,
};

const resultText = {
  fontSize: 22,
  margin: "10px 0",
};

const rankRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  padding: "8px 0",
  borderBottom: "1px solid rgba(255,255,255,0.1)",
  color: "#dbeafe",
};

const bmStatusStyle = {
  padding: "12px 14px",
  borderRadius: 14,
  background: "rgba(255,255,255,0.08)",
  color: "#dbeafe",
};
