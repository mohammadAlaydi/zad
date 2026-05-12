import { useState } from "react";
import {
  View, Text, Pressable, ScrollView, StyleSheet, StatusBar, Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { Colors } from "@/theme/colors";

type ModuleStatus = "locked" | "available" | "in_progress" | "completed";

type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
};

type LearningModule = {
  id: string;
  title: string;
  category: "savings" | "debt" | "investing" | "budgeting";
  description: string;
  duration: string;
  xp: number;
  status: ModuleStatus;
  progress: number;
  lessons: string[];
  quiz: QuizQuestion[];
};

type Badge = {
  id: string;
  name: string;
  icon: string;
  earned: boolean;
  description: string;
};

const modules: LearningModule[] = [
  {
    id: "m1", title: "Budgeting Basics", category: "budgeting", description: "Learn how to create and stick to a personal budget.",
    duration: "15 min", xp: 100, status: "completed", progress: 100,
    lessons: ["What is a budget?", "The 50/30/20 rule", "Tracking expenses", "Adjusting your budget"],
    quiz: [
      { id: "q1", question: "What does the 50/30/20 rule suggest for needs?", options: ["20%", "30%", "50%", "70%"], correctIndex: 2 },
      { id: "q2", question: "Which is NOT a fixed expense?", options: ["Rent", "Insurance", "Dining out", "Car payment"], correctIndex: 2 },
    ],
  },
  {
    id: "m2", title: "Building an Emergency Fund", category: "savings", description: "Why you need an emergency fund and how to build one.",
    duration: "12 min", xp: 80, status: "in_progress", progress: 60,
    lessons: ["Why emergency funds matter", "How much to save", "Where to keep it", "Automating savings"],
    quiz: [
      { id: "q3", question: "How many months of expenses should an emergency fund cover?", options: ["1 month", "3-6 months", "12 months", "24 months"], correctIndex: 1 },
      { id: "q4", question: "Where is the best place for an emergency fund?", options: ["Stocks", "Savings account", "Under the mattress", "Cryptocurrency"], correctIndex: 1 },
    ],
  },
  {
    id: "m3", title: "Understanding Debt", category: "debt", description: "Learn about good debt vs bad debt and debt management strategies.",
    duration: "20 min", xp: 120, status: "available", progress: 0,
    lessons: ["Good debt vs bad debt", "Interest rates explained", "Debt snowball method", "Debt avalanche method", "When to consolidate"],
    quiz: [
      { id: "q5", question: "Which is generally considered 'good debt'?", options: ["Credit card debt", "Payday loan", "Student loan", "Gambling debt"], correctIndex: 2 },
      { id: "q6", question: "What does the debt snowball method focus on?", options: ["Highest interest first", "Smallest balance first", "Newest debt first", "Random order"], correctIndex: 1 },
    ],
  },
  {
    id: "m4", title: "Investing for Beginners", category: "investing", description: "Introduction to stocks, bonds, and building a portfolio.",
    duration: "25 min", xp: 150, status: "available", progress: 0,
    lessons: ["What is investing?", "Stocks vs bonds", "Risk and return", "Diversification", "Getting started", "Common mistakes"],
    quiz: [
      { id: "q7", question: "What does diversification help with?", options: ["Increasing returns", "Reducing risk", "Avoiding taxes", "Timing the market"], correctIndex: 1 },
      { id: "q8", question: "Which investment type generally has the highest long-term returns?", options: ["Savings accounts", "Bonds", "Stocks", "Gold"], correctIndex: 2 },
    ],
  },
  {
    id: "m5", title: "Smart Savings Goals", category: "savings", description: "Set and achieve financial goals using proven strategies.",
    duration: "10 min", xp: 70, status: "locked", progress: 0,
    lessons: ["SMART goals framework", "Prioritizing goals", "Automating contributions"],
    quiz: [
      { id: "q9", question: "What does the 'S' in SMART goals stand for?", options: ["Simple", "Specific", "Strategic", "Sustainable"], correctIndex: 1 },
    ],
  },
  {
    id: "m6", title: "Managing Credit Cards", category: "debt", description: "Use credit cards wisely without falling into debt traps.",
    duration: "18 min", xp: 110, status: "locked", progress: 0,
    lessons: ["How credit cards work", "Interest and fees", "Building credit score", "Avoiding common traps", "Rewards optimization"],
    quiz: [
      { id: "q10", question: "What is a good practice for credit card use?", options: ["Pay minimum only", "Max out your limit", "Pay full balance monthly", "Open many cards"], correctIndex: 2 },
    ],
  },
];

const badges: Badge[] = [
  { id: "b1", name: "Budget Master", icon: "calculator", earned: true, description: "Complete the Budgeting Basics module" },
  { id: "b2", name: "Savings Star", icon: "star", earned: false, description: "Complete all savings modules" },
  { id: "b3", name: "Debt Slayer", icon: "flash", earned: false, description: "Complete all debt management modules" },
  { id: "b4", name: "Investor", icon: "trending-up", earned: false, description: "Complete the investing module" },
  { id: "b5", name: "Quiz Champ", icon: "trophy", earned: false, description: "Score 100% on 3 quizzes" },
  { id: "b6", name: "Streak", icon: "flame", earned: true, description: "Learn 5 days in a row" },
];

const categoryColors: Record<string, string> = {
  savings: Colors.accent.green,
  debt: Colors.accent.red,
  investing: Colors.brand.primary,
  budgeting: Colors.accent.amber,
};

export default function LearnScreen() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<"modules" | "quiz" | "badges">("modules");
  const [activeModule, setActiveModule] = useState<LearningModule | null>(null);
  const [quizModule, setQuizModule] = useState<LearningModule | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [quizDone, setQuizDone] = useState(false);

  const totalXP = modules.filter((m) => m.status === "completed").reduce((s, m) => s + m.xp, 0);
  const level = Math.floor(totalXP / 200) + 1;
  const xpToNext = 200 - (totalXP % 200);

  const startQuiz = (mod: LearningModule) => {
    setQuizModule(mod);
    setCurrentQ(0);
    setSelectedAnswer(null);
    setScore(0);
    setQuizDone(false);
  };

  const answerQuestion = (index: number) => {
    if (selectedAnswer !== null || !quizModule) return;
    setSelectedAnswer(index);
    if (index === quizModule.quiz[currentQ].correctIndex) {
      setScore(score + 1);
    }
    setTimeout(() => {
      if (currentQ + 1 < quizModule.quiz.length) {
        setCurrentQ(currentQ + 1);
        setSelectedAnswer(null);
      } else {
        setQuizDone(true);
      }
    }, 1200);
  };

  return (
    <Screen bg={Colors.surface.background}>
      <StatusBar barStyle="dark-content" />
      <Header title="Financial Literacy" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        {/* Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.levelCircle}>
            <Text style={styles.levelNum}>{level}</Text>
            <Text style={styles.levelLabel}>Level</Text>
          </View>
          <View style={styles.progressInfo}>
            <Text style={styles.progressTitle}>{totalXP} XP Earned</Text>
            <Text style={styles.progressSub}>{xpToNext} XP to Level {level + 1}</Text>
            <View style={styles.xpBar}>
              <View style={[styles.xpFill, { width: `${((totalXP % 200) / 200) * 100}%` }]} />
            </View>
            <View style={styles.progressStats}>
              <Text style={styles.progressStatText}>{modules.filter((m) => m.status === "completed").length}/{modules.length} Completed</Text>
              <Text style={styles.progressStatText}>{badges.filter((b) => b.earned).length} Badges</Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          {(["modules", "quiz", "badges"] as const).map((t) => (
            <Pressable key={t} onPress={() => setTab(t)} style={[styles.tabChip, tab === t && styles.tabActive]}>
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t === "quiz" ? "Quizzes" : t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Modules */}
        {tab === "modules" && (
          <View style={styles.section}>
            {modules.map((mod) => (
              <Pressable
                key={mod.id}
                onPress={() => mod.status !== "locked" && setActiveModule(mod)}
                style={[styles.moduleCard, mod.status === "locked" && { opacity: 0.5 }]}
              >
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                  <View style={[styles.modIcon, { backgroundColor: categoryColors[mod.category] + "18" }]}>
                    <Ionicons
                      name={mod.status === "completed" ? "checkmark" : mod.status === "locked" ? "lock-closed" : "book"}
                      size={18}
                      color={mod.status === "completed" ? Colors.accent.green : categoryColors[mod.category]}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modTitle}>{mod.title}</Text>
                    <Text style={styles.modMeta}>{mod.duration} · {mod.xp} XP · {mod.lessons.length} lessons</Text>
                  </View>
                  <View style={[styles.catBadge, { backgroundColor: categoryColors[mod.category] + "18" }]}>
                    <Text style={[styles.catText, { color: categoryColors[mod.category] }]}>{mod.category}</Text>
                  </View>
                </View>
                <Text style={styles.modDesc}>{mod.description}</Text>
                {mod.status === "in_progress" && (
                  <View style={styles.modProgressBar}>
                    <View style={[styles.modProgressFill, { width: `${mod.progress}%` }]} />
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        )}

        {/* Quizzes */}
        {tab === "quiz" && !quizModule && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Quizzes</Text>
            {modules.filter((m) => m.status !== "locked").map((mod) => (
              <Pressable key={mod.id} onPress={() => startQuiz(mod)} style={styles.quizCard}>
                <Ionicons name="help-circle" size={24} color={categoryColors[mod.category]} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.quizTitle}>{mod.title}</Text>
                  <Text style={styles.quizMeta}>{mod.quiz.length} questions · {mod.xp / 2} XP</Text>
                </View>
                <Ionicons name="play-circle" size={24} color={Colors.brand.primary} />
              </Pressable>
            ))}
          </View>
        )}

        {/* Active Quiz */}
        {tab === "quiz" && quizModule && !quizDone && (
          <View style={styles.quizContainer}>
            <View style={styles.quizHeader}>
              <Text style={styles.quizProgress}>Question {currentQ + 1} of {quizModule.quiz.length}</Text>
              <View style={styles.quizProgressBar}>
                <View style={[styles.quizProgressFill, { width: `${((currentQ + 1) / quizModule.quiz.length) * 100}%` }]} />
              </View>
            </View>
            <Text style={styles.questionText}>{quizModule.quiz[currentQ].question}</Text>
            {quizModule.quiz[currentQ].options.map((opt, i) => {
              const isSelected = selectedAnswer === i;
              const isCorrect = i === quizModule.quiz[currentQ].correctIndex;
              const showResult = selectedAnswer !== null;
              return (
                <Pressable
                  key={i}
                  onPress={() => answerQuestion(i)}
                  style={[
                    styles.optionBtn,
                    showResult && isCorrect && styles.optionCorrect,
                    showResult && isSelected && !isCorrect && styles.optionWrong,
                  ]}
                >
                  <Text style={[styles.optionText, showResult && isCorrect && { color: Colors.accent.green }, showResult && isSelected && !isCorrect && { color: Colors.accent.red }]}>
                    {opt}
                  </Text>
                  {showResult && isCorrect && <Ionicons name="checkmark-circle" size={20} color={Colors.accent.green} />}
                  {showResult && isSelected && !isCorrect && <Ionicons name="close-circle" size={20} color={Colors.accent.red} />}
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Quiz Done */}
        {tab === "quiz" && quizModule && quizDone && (
          <View style={styles.quizDone}>
            <View style={[styles.doneCircle, { backgroundColor: score === quizModule.quiz.length ? Colors.accent.green : Colors.accent.amber }]}>
              <Ionicons name={score === quizModule.quiz.length ? "trophy" : "ribbon"} size={40} color={Colors.white} />
            </View>
            <Text style={styles.doneTitle}>Quiz Complete!</Text>
            <Text style={styles.doneScore}>{score}/{quizModule.quiz.length} Correct</Text>
            <Text style={styles.doneXP}>+{Math.floor((score / quizModule.quiz.length) * (quizModule.xp / 2))} XP Earned</Text>
            {score === quizModule.quiz.length && (
              <View style={styles.perfectBadge}>
                <Ionicons name="star" size={16} color={Colors.accent.amber} />
                <Text style={styles.perfectText}>Perfect Score!</Text>
              </View>
            )}
            <Button title="Back to Quizzes" onPress={() => { setQuizModule(null); setQuizDone(false); }} style={{ marginTop: 20, paddingHorizontal: 20 }} />
          </View>
        )}

        {/* Badges */}
        {tab === "badges" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Badges</Text>
            <View style={styles.badgeGrid}>
              {badges.map((badge) => (
                <View key={badge.id} style={[styles.badgeCard, !badge.earned && { opacity: 0.4 }]}>
                  <View style={[styles.badgeIcon, badge.earned && { backgroundColor: Colors.accent.amber + "20" }]}>
                    <Ionicons name={badge.icon as any} size={24} color={badge.earned ? Colors.accent.amber : Colors.ink[400]} />
                  </View>
                  <Text style={styles.badgeName}>{badge.name}</Text>
                  <Text style={styles.badgeDesc}>{badge.description}</Text>
                  {badge.earned && <Ionicons name="checkmark-circle" size={16} color={Colors.accent.green} style={{ marginTop: 4 }} />}
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Module Detail Modal */}
      <Modal visible={!!activeModule} transparent animationType="slide" onRequestClose={() => setActiveModule(null)}>
        <Pressable style={styles.modalBg} onPress={() => setActiveModule(null)}>
          <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
            {activeModule && (
              <>
                <Text style={styles.modalTitle}>{activeModule.title}</Text>
                <Text style={styles.modalSub}>{activeModule.description}</Text>
                <View style={{ marginTop: 16 }}>
                  {activeModule.lessons.map((lesson, i) => (
                    <View key={i} style={styles.lessonRow}>
                      <View style={[styles.lessonNum, activeModule.progress >= ((i + 1) / activeModule.lessons.length) * 100 && { backgroundColor: Colors.accent.green }]}>
                        {activeModule.progress >= ((i + 1) / activeModule.lessons.length) * 100 ? (
                          <Ionicons name="checkmark" size={12} color={Colors.white} />
                        ) : (
                          <Text style={styles.lessonNumText}>{i + 1}</Text>
                        )}
                      </View>
                      <Text style={styles.lessonText}>{lesson}</Text>
                    </View>
                  ))}
                </View>
                <Button
                  title={activeModule.status === "completed" ? "Review Module" : "Continue Learning"}
                  onPress={() => setActiveModule(null)}
                  style={{ marginTop: 16 }}
                />
                {activeModule.quiz.length > 0 && (
                  <Button
                    title="Take Quiz"
                    variant="secondary"
                    onPress={() => { startQuiz(activeModule); setActiveModule(null); setTab("quiz"); }}
                    style={{ marginTop: 8 }}
                  />
                )}
              </>
            )}
          </View>
        </Pressable>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  progressCard: { marginHorizontal: 18, backgroundColor: Colors.white, borderRadius: 18, padding: 18, flexDirection: "row", alignItems: "center", gap: 16, shadowColor: "#101225", shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  levelCircle: { width: 64, height: 64, borderRadius: 32, borderWidth: 3, borderColor: Colors.accent.amber, alignItems: "center", justifyContent: "center" },
  levelNum: { fontFamily: "Inter_700Bold", fontSize: 22, color: Colors.ink[900] },
  levelLabel: { fontFamily: "Inter_400Regular", fontSize: 9, color: Colors.ink[500] },
  progressInfo: { flex: 1 },
  progressTitle: { fontFamily: "Inter_700Bold", fontSize: 16, color: Colors.ink[900] },
  progressSub: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.ink[500], marginTop: 2 },
  xpBar: { height: 6, borderRadius: 3, backgroundColor: Colors.ink[100], marginTop: 8 },
  xpFill: { height: 6, borderRadius: 3, backgroundColor: Colors.accent.amber },
  progressStats: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  progressStatText: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.ink[500] },
  tabRow: { flexDirection: "row", paddingHorizontal: 18, gap: 8, marginTop: 16 },
  tabChip: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: Colors.white, alignItems: "center", borderWidth: 1, borderColor: Colors.ink[200] },
  tabActive: { backgroundColor: Colors.brand.primary, borderColor: Colors.brand.primary },
  tabText: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.ink[600] },
  tabTextActive: { color: Colors.white },
  section: { paddingHorizontal: 18, marginTop: 16 },
  sectionTitle: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.ink[900], marginBottom: 12 },
  moduleCard: { backgroundColor: Colors.white, borderRadius: 14, padding: 14, marginBottom: 10, shadowColor: "#101225", shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  modIcon: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center", marginRight: 12 },
  modTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.ink[900] },
  modMeta: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.ink[500], marginTop: 2 },
  catBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  catText: { fontFamily: "Inter_600SemiBold", fontSize: 10, textTransform: "capitalize" },
  modDesc: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.ink[600], lineHeight: 17 },
  modProgressBar: { height: 6, borderRadius: 3, backgroundColor: Colors.ink[100], marginTop: 8 },
  modProgressFill: { height: 6, borderRadius: 3, backgroundColor: Colors.brand.primary },
  quizCard: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.white, borderRadius: 14, padding: 14, marginBottom: 8 },
  quizTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.ink[900] },
  quizMeta: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.ink[500], marginTop: 2 },
  quizContainer: { paddingHorizontal: 18, marginTop: 16 },
  quizHeader: { marginBottom: 20 },
  quizProgress: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.ink[600], marginBottom: 6 },
  quizProgressBar: { height: 6, borderRadius: 3, backgroundColor: Colors.ink[100] },
  quizProgressFill: { height: 6, borderRadius: 3, backgroundColor: Colors.brand.primary },
  questionText: { fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.ink[900], lineHeight: 26, marginBottom: 20 },
  optionBtn: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: Colors.white, borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1.5, borderColor: Colors.ink[200] },
  optionCorrect: { borderColor: Colors.accent.green, backgroundColor: Colors.accent.greenSoft },
  optionWrong: { borderColor: Colors.accent.red, backgroundColor: Colors.accent.redSoft },
  optionText: { fontFamily: "Inter_500Medium", fontSize: 14, color: Colors.ink[800], flex: 1 },
  quizDone: { alignItems: "center", paddingHorizontal: 30, paddingTop: 40 },
  doneCircle: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  doneTitle: { fontFamily: "Inter_700Bold", fontSize: 22, color: Colors.ink[900] },
  doneScore: { fontFamily: "Inter_600SemiBold", fontSize: 18, color: Colors.ink[700], marginTop: 6 },
  doneXP: { fontFamily: "Inter_500Medium", fontSize: 14, color: Colors.brand.primary, marginTop: 4 },
  perfectBadge: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#FFF3E0", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, marginTop: 12 },
  perfectText: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.accent.amber },
  badgeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  badgeCard: { width: "47%", backgroundColor: Colors.white, borderRadius: 16, padding: 16, alignItems: "center" },
  badgeIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: Colors.ink[100], alignItems: "center", justifyContent: "center", marginBottom: 8 },
  badgeName: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.ink[900], textAlign: "center" },
  badgeDesc: { fontFamily: "Inter_400Regular", fontSize: 10, color: Colors.ink[500], textAlign: "center", marginTop: 4 },
  modalBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalCard: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.ink[900] },
  modalSub: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.ink[500], marginTop: 4 },
  lessonRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
  lessonNum: { width: 26, height: 26, borderRadius: 13, backgroundColor: Colors.ink[200], alignItems: "center", justifyContent: "center" },
  lessonNumText: { fontFamily: "Inter_600SemiBold", fontSize: 12, color: Colors.ink[600] },
  lessonText: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.ink[700], flex: 1 },
});
