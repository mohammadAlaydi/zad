import { useState, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Modal,
  TextInput,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Screen } from "@/components/Screen";
import { Header } from "@/components/Header";
import { Button } from "@/components/Button";
import { Colors } from "@/theme/colors";

// ── Types ────────────────────────────────────────────────────────────────────

type Course = {
  id: string;
  emoji: string;
  title: string;
  lessons: Lesson[];
  completionPct: number;
  color: string;
};

type Lesson = {
  id: string;
  title: string;
  duration: string;
};

type QuizOption = { text: string; correct: boolean };
type Quiz = { question: string; options: QuizOption[] };

const LESSON_QUIZZES: Record<string, Quiz> = {
  "l1-1": {
    question: "What is the recommended % of income for needs in the 50/30/20 rule?",
    options: [
      { text: "30%", correct: false },
      { text: "20%", correct: false },
      { text: "50%", correct: true },
      { text: "70%", correct: false },
    ],
  },
  "l1-2": {
    question: "Which of the following is a fixed expense?",
    options: [
      { text: "Dining out", correct: false },
      { text: "Monthly rent", correct: true },
      { text: "Entertainment", correct: false },
      { text: "Clothing", correct: false },
    ],
  },
  "l1-3": {
    question: "Tracking expenses helps you:",
    options: [
      { text: "Earn more money", correct: false },
      { text: "Avoid paying taxes", correct: false },
      { text: "Identify overspending", correct: true },
      { text: "Get a bank loan", correct: false },
    ],
  },
  "l2-1": {
    question: "An emergency fund should cover how many months of expenses?",
    options: [
      { text: "1 month", correct: false },
      { text: "3–6 months", correct: true },
      { text: "12 months", correct: false },
      { text: "24 months", correct: false },
    ],
  },
  "l2-2": {
    question: "What is considered 'good debt'?",
    options: [
      { text: "Payday loan", correct: false },
      { text: "Credit card rollover", correct: false },
      { text: "Student loan", correct: true },
      { text: "Gambling debt", correct: false },
    ],
  },
  "l2-3": {
    question: "Diversification in investing means:",
    options: [
      { text: "Putting all money in one stock", correct: false },
      { text: "Only buying bonds", correct: false },
      { text: "Spreading investments across assets", correct: true },
      { text: "Timing the market", correct: false },
    ],
  },
  "l3-1": {
    question: "Bitcoin is an example of:",
    options: [
      { text: "A savings account", correct: false },
      { text: "A government bond", correct: false },
      { text: "A cryptocurrency", correct: true },
      { text: "A real estate fund", correct: false },
    ],
  },
  "l3-2": {
    question: "Blockchain technology is best described as:",
    options: [
      { text: "A bank database", correct: false },
      { text: "A decentralized ledger", correct: true },
      { text: "A credit card network", correct: false },
      { text: "A savings app", correct: false },
    ],
  },
  "l3-3": {
    question: "A goal-based savings strategy involves:",
    options: [
      { text: "Spending first, saving the rest", correct: false },
      { text: "Saving a fixed amount for a specific target", correct: true },
      { text: "Investing only in crypto", correct: false },
      { text: "Borrowing to save", correct: false },
    ],
  },
  "l4-1": {
    question: "The debt avalanche method prioritizes:",
    options: [
      { text: "Smallest balance first", correct: false },
      { text: "Newest debt first", correct: false },
      { text: "Highest interest rate first", correct: true },
      { text: "Random order", correct: false },
    ],
  },
  "l4-2": {
    question: "A stock represents:",
    options: [
      { text: "A loan to a company", correct: false },
      { text: "Ownership in a company", correct: true },
      { text: "A savings deposit", correct: false },
      { text: "A government obligation", correct: false },
    ],
  },
  "l4-3": {
    question: "DCA stands for:",
    options: [
      { text: "Daily Cash Advance", correct: false },
      { text: "Dollar Cost Averaging", correct: true },
      { text: "Direct Credit Allocation", correct: false },
      { text: "Debt Credit Analysis", correct: false },
    ],
  },
};

const COURSES: Course[] = [
  {
    id: "c1",
    emoji: "💰",
    title: "Savings & Goals",
    completionPct: 66,
    color: Colors.accent.green,
    lessons: [
      { id: "l1-1", title: "Why savings matter", duration: "4 min" },
      { id: "l1-2", title: "Setting SMART goals", duration: "5 min" },
      { id: "l1-3", title: "Automating your savings", duration: "6 min" },
    ],
  },
  {
    id: "c2",
    emoji: "📉",
    title: "Debt Management",
    completionPct: 33,
    color: Colors.accent.red,
    lessons: [
      { id: "l2-1", title: "Good debt vs bad debt", duration: "5 min" },
      { id: "l2-2", title: "Avalanche & snowball methods", duration: "7 min" },
      { id: "l2-3", title: "Debt consolidation explained", duration: "6 min" },
    ],
  },
  {
    id: "c3",
    emoji: "📈",
    title: "Investing Basics",
    completionPct: 0,
    color: Colors.brand.primary,
    lessons: [
      { id: "l3-1", title: "Stocks, bonds & ETFs", duration: "8 min" },
      { id: "l3-2", title: "Risk & return", duration: "5 min" },
      { id: "l3-3", title: "Diversification", duration: "6 min" },
    ],
  },
  {
    id: "c4",
    emoji: "₿",
    title: "Crypto 101",
    completionPct: 0,
    color: Colors.accent.amber,
    lessons: [
      { id: "l4-1", title: "What is blockchain?", duration: "6 min" },
      { id: "l4-2", title: "Bitcoin & altcoins", duration: "7 min" },
      { id: "l4-3", title: "Wallets & security", duration: "5 min" },
    ],
  },
];

type Badge = {
  id: string;
  label: string;
  emoji: string;
  unlocked: boolean;
  desc: string;
};

const BADGES: Badge[] = [
  { id: "b1", label: "First Lesson", emoji: "🎖️", unlocked: true, desc: "Completed your first lesson" },
  { id: "b2", label: "Quiz Master", emoji: "🧠", unlocked: false, desc: "Scored 100% on 3 quizzes" },
  { id: "b3", label: "Saver", emoji: "💰", unlocked: false, desc: "Completed Savings & Goals" },
  { id: "b4", label: "Investor", emoji: "📈", unlocked: false, desc: "Completed Investing Basics" },
];

// ── Progress Ring ─────────────────────────────────────────────────────────────

function ProgressRing({ pct, size = 64, stroke = 5, color }: { pct: number; size?: number; stroke?: number; color: string }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <View style={{ width: size, height: size }}>
      {/* SVG not available in RN without react-native-svg, so we do a CSS-border trick */}
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: stroke,
          borderColor: Colors.ink[100],
          alignItems: "center",
          justifyContent: "center",
          position: "absolute",
        }}
      />
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: stroke,
          borderColor: "transparent",
          borderTopColor: color,
          borderRightColor: pct >= 25 ? color : "transparent",
          borderBottomColor: pct >= 50 ? color : "transparent",
          borderLeftColor: pct >= 75 ? color : "transparent",
          transform: [{ rotate: "-90deg" }],
          position: "absolute",
        }}
      />
      <View style={{ alignItems: "center", justifyContent: "center", flex: 1 }}>
        <Text style={{ fontFamily: "Inter_700Bold", fontSize: size === 64 ? 14 : 11, color: Colors.ink[900] }}>
          {pct}%
        </Text>
      </View>
    </View>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────

function XPToast({ visible, correct }: { visible: boolean; correct: boolean }) {
  return (
    <MotiView
      animate={{ opacity: visible ? 1 : 0, translateY: visible ? 0 : 20 }}
      transition={{ type: "timing", duration: 300 }}
      style={[
        styles.xpToast,
        { backgroundColor: correct ? Colors.accent.green : Colors.accent.red },
      ]}
      pointerEvents="none"
    >
      <Text style={styles.xpToastText}>
        {correct ? "+10 XP  🎉" : "Wrong answer  ❌"}
      </Text>
    </MotiView>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function LearnScreen() {
  const insets = useSafeAreaInsets();

  // XP state
  const [xp, setXp] = useState(340);
  const xpMax = 500;

  // Course modal
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  // Lesson quiz modal
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  // Quiz state
  const [chosenIdx, setChosenIdx] = useState<number | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastCorrect, setToastCorrect] = useState(false);

  const currentQuiz = selectedLesson ? LESSON_QUIZZES[selectedLesson.id] : null;

  const handleAnswer = (idx: number, correct: boolean) => {
    if (chosenIdx !== null) return;
    setChosenIdx(idx);
    setToastCorrect(correct);
    setToastVisible(true);
    if (correct) setXp((v) => Math.min(v + 10, xpMax));
    setTimeout(() => setToastVisible(false), 1800);
  };

  const closeQuiz = () => {
    setSelectedLesson(null);
    setChosenIdx(null);
    setToastVisible(false);
  };

  const closeCourse = () => {
    setSelectedCourse(null);
  };

  const level = Math.floor(xp / 170) + 1;

  return (
    <Screen bg={Colors.surface.background}>
      <Header title="Learn & Earn" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
      >
        {/* ── XP / Level Card ── */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 420 }}
        >
          <LinearGradient
            colors={[Colors.brand.gradientStart, Colors.brand.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.xpCard}
          >
            {/* decoration circles */}
            <View style={styles.deco1} pointerEvents="none" />
            <View style={styles.deco2} pointerEvents="none" />

            <View style={styles.xpTop}>
              <View>
                <Text style={styles.xpLevel}>Level {level} Learner 🎓</Text>
                <Text style={styles.xpSub}>{xp} / {xpMax} XP</Text>
              </View>
              <View style={styles.streakBadge}>
                <Text style={styles.streakText}>7 day streak 🔥</Text>
              </View>
            </View>

            {/* XP bar */}
            <View style={styles.xpBarBg}>
              <MotiView
                from={{ width: "0%" }}
                animate={{ width: `${(xp / xpMax) * 100}%` as any }}
                transition={{ type: "timing", duration: 700, delay: 300 }}
                style={styles.xpBarFill}
              />
            </View>
            <Text style={styles.xpHint}>{xpMax - xp} XP to next level</Text>
          </LinearGradient>
        </MotiView>

        {/* ── Featured Lesson ── */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 400, delay: 120 }}
        >
          <Text style={styles.sectionLabel}>Featured Lesson</Text>
          <Pressable
            style={({ pressed }) => [styles.featuredCard, { opacity: pressed ? 0.93 : 1 }]}
            onPress={() => setSelectedCourse(COURSES[0])}
          >
            <LinearGradient
              colors={["#7C3FC4", Colors.brand.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.featuredGrad}
            />
            <View style={styles.featuredContent}>
              <View style={{ flex: 1 }}>
                <View style={styles.featuredBadge}>
                  <Text style={styles.featuredBadgeText}>TOP PICK</Text>
                </View>
                <Text style={styles.featuredTitle}>Budgeting 101 📚</Text>
                <Text style={styles.featuredSub}>Master the 50/30/20 rule and take control of your money</Text>
                <View style={styles.featuredMeta}>
                  <Ionicons name="time-outline" size={13} color="rgba(255,255,255,0.7)" />
                  <Text style={styles.featuredMetaText}>15 min · 3 lessons</Text>
                </View>
              </View>
              <ProgressRing pct={60} size={72} stroke={6} color={Colors.accent.amber} />
            </View>
          </Pressable>
        </MotiView>

        {/* ── Courses Horizontal Scroll ── */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 400, delay: 200 }}
        >
          <Text style={styles.sectionLabel}>All Courses</Text>
        </MotiView>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.courseRow}
        >
          {COURSES.map((course, i) => (
            <MotiView
              key={course.id}
              from={{ opacity: 0, translateX: 20 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ type: "timing", duration: 380, delay: 240 + i * 60 }}
            >
              <Pressable
                style={({ pressed }) => [styles.courseCard, { opacity: pressed ? 0.9 : 1 }]}
                onPress={() => setSelectedCourse(course)}
              >
                <View style={[styles.courseEmojiWrap, { backgroundColor: course.color + "18" }]}>
                  <Text style={styles.courseEmoji}>{course.emoji}</Text>
                </View>
                <Text style={styles.courseTitle}>{course.title}</Text>
                <Text style={styles.courseMeta}>{course.lessons.length} lessons</Text>
                <View style={styles.courseProgBarBg}>
                  <View
                    style={[
                      styles.courseProgBarFill,
                      { width: `${course.completionPct}%`, backgroundColor: course.color },
                    ]}
                  />
                </View>
                <Text style={[styles.courseProgPct, { color: course.color }]}>
                  {course.completionPct}%
                </Text>
              </Pressable>
            </MotiView>
          ))}
        </ScrollView>

        {/* ── Badges Section ── */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 400, delay: 420 }}
        >
          <Text style={styles.sectionLabel}>Badges</Text>
          <View style={styles.badgeGrid}>
            {BADGES.map((b, i) => (
              <MotiView
                key={b.id}
                from={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", delay: 460 + i * 70 }}
              >
                <View style={[styles.badgeCard, !b.unlocked && styles.badgeLocked]}>
                  <View style={[styles.badgeIconCircle, b.unlocked && { backgroundColor: Colors.accent.amber + "22" }]}>
                    {b.unlocked ? (
                      <Text style={styles.badgeEmoji}>{b.emoji}</Text>
                    ) : (
                      <Ionicons name="lock-closed" size={22} color={Colors.ink[300]} />
                    )}
                  </View>
                  <Text style={[styles.badgeLabel, !b.unlocked && { color: Colors.ink[400] }]}>{b.label}</Text>
                  <Text style={styles.badgeDesc}>{b.desc}</Text>
                  {b.unlocked && (
                    <View style={styles.unlockedDot}>
                      <Ionicons name="checkmark" size={10} color={Colors.white} />
                    </View>
                  )}
                </View>
              </MotiView>
            ))}
          </View>
        </MotiView>
      </ScrollView>

      {/* ── Course Modal ── */}
      <Modal visible={!!selectedCourse} transparent animationType="slide" onRequestClose={closeCourse}>
        <Pressable style={styles.modalOverlay} onPress={closeCourse}>
          <MotiView
            from={{ translateY: 80, opacity: 0 }}
            animate={{ translateY: 0, opacity: 1 }}
            transition={{ type: "spring", damping: 22, stiffness: 200 }}
            style={styles.modalSheet}
          >
            <Pressable onPress={() => {}} style={{ flex: 1 }}>
              {selectedCourse && (
                <>
                  {/* Handle */}
                  <View style={styles.sheetHandle} />

                  <View style={styles.modalHeader}>
                    <Text style={styles.modalEmoji}>{selectedCourse.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.modalTitle}>{selectedCourse.title}</Text>
                      <Text style={styles.modalSub}>{selectedCourse.completionPct}% complete · {selectedCourse.lessons.length} lessons</Text>
                    </View>
                    <ProgressRing pct={selectedCourse.completionPct} size={52} stroke={4} color={selectedCourse.color} />
                  </View>

                  <Text style={styles.lessonsSectionLabel}>Lessons</Text>

                  {selectedCourse.lessons.map((lesson, i) => (
                    <MotiView
                      key={lesson.id}
                      from={{ opacity: 0, translateX: -12 }}
                      animate={{ opacity: 1, translateX: 0 }}
                      transition={{ type: "timing", duration: 280, delay: i * 70 }}
                    >
                      <Pressable
                        style={({ pressed }) => [styles.lessonRow, { opacity: pressed ? 0.8 : 1 }]}
                        onPress={() => {
                          setSelectedLesson(lesson);
                          setChosenIdx(null);
                        }}
                      >
                        <View style={[styles.lessonNumBadge, { backgroundColor: selectedCourse.color + "22" }]}>
                          <Text style={[styles.lessonNum, { color: selectedCourse.color }]}>{i + 1}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.lessonTitle}>{lesson.title}</Text>
                          <Text style={styles.lessonDuration}>{lesson.duration}</Text>
                        </View>
                        <Ionicons name="play-circle-outline" size={24} color={selectedCourse.color} />
                      </Pressable>
                    </MotiView>
                  ))}

                  <View style={styles.modalFooter}>
                    <Button title="Start Learning" onPress={closeCourse} />
                  </View>
                </>
              )}
            </Pressable>
          </MotiView>
        </Pressable>
      </Modal>

      {/* ── Quiz Modal ── */}
      <Modal
        visible={!!selectedLesson}
        transparent
        animationType="fade"
        onRequestClose={closeQuiz}
      >
        <View style={styles.quizOverlay}>
          <MotiView
            from={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 20, stiffness: 260 }}
            style={styles.quizCard}
          >
            <Pressable style={styles.quizClose} onPress={closeQuiz}>
              <Ionicons name="close" size={20} color={Colors.ink[400]} />
            </Pressable>
            {currentQuiz && (
              <>
                <View style={styles.quizIconWrap}>
                  <Ionicons name="bulb-outline" size={28} color={Colors.brand.primary} />
                </View>
                <Text style={styles.quizLesson}>{selectedLesson?.title}</Text>
                <Text style={styles.quizQuestion}>{currentQuiz.question}</Text>

                <View style={styles.quizOptions}>
                  {currentQuiz.options.map((opt, idx) => {
                    const isChosen = chosenIdx === idx;
                    const showResult = chosenIdx !== null;
                    const isCorrect = opt.correct;
                    const bg =
                      showResult && isCorrect
                        ? Colors.accent.greenSoft
                        : showResult && isChosen && !isCorrect
                        ? Colors.accent.redSoft
                        : Colors.ink[50];
                    const border =
                      showResult && isCorrect
                        ? Colors.accent.green
                        : showResult && isChosen && !isCorrect
                        ? Colors.accent.red
                        : Colors.ink[200];

                    return (
                      <MotiView
                        key={idx}
                        animate={{ backgroundColor: bg, borderColor: border }}
                        transition={{ type: "timing", duration: 220 }}
                        style={[styles.optionChip]}
                      >
                        <Pressable
                          style={styles.optionPressable}
                          onPress={() => handleAnswer(idx, opt.correct)}
                          disabled={chosenIdx !== null}
                        >
                          <Text
                            style={[
                              styles.optionText,
                              showResult && isCorrect && { color: Colors.accent.green },
                              showResult && isChosen && !isCorrect && { color: Colors.accent.red },
                            ]}
                          >
                            {opt.text}
                          </Text>
                          {showResult && isCorrect && (
                            <Ionicons name="checkmark-circle" size={18} color={Colors.accent.green} />
                          )}
                          {showResult && isChosen && !isCorrect && (
                            <Ionicons name="close-circle" size={18} color={Colors.accent.red} />
                          )}
                        </Pressable>
                      </MotiView>
                    );
                  })}
                </View>

                {chosenIdx !== null && (
                  <MotiView
                    from={{ opacity: 0, translateY: 8 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: "timing", duration: 300 }}
                    style={{ marginTop: 10 }}
                  >
                    <Button title="Next Lesson" size="md" onPress={closeQuiz} />
                  </MotiView>
                )}
              </>
            )}
          </MotiView>
        </View>

        {/* Toast overlay */}
        <XPToast visible={toastVisible} correct={toastCorrect} />
      </Modal>
    </Screen>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 18,
    paddingTop: 12,
  },
  // XP Card
  xpCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 22,
    overflow: "hidden",
  },
  deco1: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  deco2: {
    position: "absolute",
    bottom: -30,
    left: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  xpTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  xpLevel: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: Colors.white,
  },
  xpSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },
  streakBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  streakText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    color: Colors.white,
  },
  xpBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    overflow: "hidden",
  },
  xpBarFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent.amber,
  },
  xpHint: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    marginTop: 6,
    textAlign: "right",
  },
  // Section label
  sectionLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: Colors.ink[900],
    marginBottom: 12,
  },
  // Featured card
  featuredCard: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 24,
    height: 150,
  },
  featuredGrad: {
    ...StyleSheet.absoluteFillObject,
  },
  featuredContent: {
    flex: 1,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featuredBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  featuredBadgeText: {
    fontFamily: "Inter_700Bold",
    fontSize: 9,
    color: Colors.white,
    letterSpacing: 1,
  },
  featuredTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: Colors.white,
  },
  featuredSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "rgba(255,255,255,0.75)",
    lineHeight: 17,
    marginTop: 4,
  },
  featuredMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 8,
  },
  featuredMetaText: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
  },
  // Course cards
  courseRow: {
    paddingRight: 18,
    gap: 12,
    marginBottom: 26,
  },
  courseCard: {
    width: 140,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    shadowColor: "#101225",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  courseEmojiWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  courseEmoji: {
    fontSize: 22,
  },
  courseTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: Colors.ink[900],
  },
  courseMeta: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: Colors.ink[500],
    marginTop: 2,
    marginBottom: 8,
  },
  courseProgBarBg: {
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.ink[100],
    marginBottom: 4,
  },
  courseProgBarFill: {
    height: 4,
    borderRadius: 2,
  },
  courseProgPct: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    textAlign: "right",
  },
  // Badges
  badgeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 8,
  },
  badgeCard: {
    width: "47.5%",
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#101225",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  badgeLocked: {
    opacity: 0.5,
  },
  badgeIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.ink[100],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  badgeEmoji: {
    fontSize: 24,
  },
  badgeLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: Colors.ink[900],
    textAlign: "center",
  },
  badgeDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    color: Colors.ink[500],
    textAlign: "center",
    marginTop: 4,
    lineHeight: 14,
  },
  unlockedDot: {
    marginTop: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.accent.green,
    alignItems: "center",
    justifyContent: "center",
  },
  // Course Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(16,18,37,0.45)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 36,
    maxHeight: "85%",
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.ink[200],
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 18,
  },
  modalEmoji: {
    fontSize: 30,
  },
  modalTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: Colors.ink[900],
  },
  modalSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.ink[500],
    marginTop: 2,
  },
  lessonsSectionLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.ink[700],
    marginBottom: 10,
  },
  lessonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: Colors.ink[50],
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  lessonNumBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  lessonNum: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },
  lessonTitle: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: Colors.ink[900],
  },
  lessonDuration: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: Colors.ink[500],
    marginTop: 2,
  },
  modalFooter: {
    marginTop: 18,
  },
  // Quiz Modal
  quizOverlay: {
    flex: 1,
    backgroundColor: "rgba(16,18,37,0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  quizCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  quizClose: {
    alignSelf: "flex-end",
    padding: 4,
    marginBottom: 8,
  },
  quizIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.brand.primary50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  quizLesson: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: Colors.brand.primary,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  quizQuestion: {
    fontFamily: "Inter_700Bold",
    fontSize: 17,
    color: Colors.ink[900],
    lineHeight: 24,
    marginBottom: 18,
  },
  quizOptions: {
    gap: 8,
  },
  optionChip: {
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.ink[200],
    backgroundColor: Colors.ink[50],
    overflow: "hidden",
  },
  optionPressable: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  optionText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: Colors.ink[800],
    flex: 1,
  },
  // XP Toast
  xpToast: {
    position: "absolute",
    bottom: 60,
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  xpToastText: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
    color: Colors.white,
  },
});
