import React, { useState, useEffect } from 'react';
import { EarningTask, User } from '../../types';
import { X, Play, CheckCircle, Clock, Award, AlertCircle, HelpCircle, Star, ThumbsUp, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TaskExecutionModalProps {
  task: EarningTask;
  user: User;
  onClose: () => void;
  onComplete: (taskId: string, reward: number) => void;
}

export const TaskExecutionModal: React.FC<TaskExecutionModalProps> = ({
  task,
  user,
  onClose,
  onComplete,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(task.durationSeconds);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isDone, setIsDone] = useState<boolean>(false);

  // Trivia state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [score, setScore] = useState<number>(0);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);

  // Survey state
  const [surveyAnswers, setSurveyAnswers] = useState<Record<number, string>>({});

  // Captcha state
  const [inputCaptcha, setInputCaptcha] = useState<string>('');

  // Review state
  const [rating, setRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState<string>('Great service, fast transactions and reliable mobile experience!');

  // Countdown timer for video & timed tasks
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && secondsRemaining > 0 && !isDone) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, secondsRemaining, isDone]);

  // Handle Quiz answer click
  const handleAnswerSelect = (optionIndex: number) => {
    if (!task.quizQuestions) return;
    const currentQ = task.quizQuestions[currentQuestionIndex];
    const isCorrect = optionIndex === currentQ.correctIndex;
    
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    const nextAnswers = [...selectedAnswers, optionIndex];
    setSelectedAnswers(nextAnswers);

    if (currentQuestionIndex + 1 < task.quizQuestions.length) {
      setTimeout(() => {
        setCurrentQuestionIndex((prev) => prev + 1);
      }, 400);
    } else {
      setTimeout(() => {
        setQuizFinished(true);
      }, 500);
    }
  };

  const handleFinishTask = () => {
    setIsDone(true);
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#f59e0b', '#ffffff']
      });
    } catch {
      // ignore
    }
    onComplete(task.id, task.reward);
  };

  const canSubmit = () => {
    if (task.category === 'video') {
      return secondsRemaining === 0;
    }
    if (task.category === 'trivia') {
      return quizFinished && score >= 2;
    }
    if (task.category === 'survey') {
      return task.surveyQuestions && Object.keys(surveyAnswers).length === task.surveyQuestions.length;
    }
    if (task.category === 'captcha') {
      return inputCaptcha.trim().toUpperCase() === (task.captchaCode || '').toUpperCase();
    }
    if (task.category === 'social') {
      return secondsRemaining === 0;
    }
    if (task.category === 'review') {
      return reviewText.trim().length >= 10;
    }
    return true;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl text-zinc-100 max-h-[90vh] overflow-y-auto">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-zinc-800/80 text-zinc-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Task Header */}
        <div className="flex items-start gap-3 mb-4 pb-4 border-b border-zinc-800">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                {task.category} Task
              </span>
              <span className="text-xs text-zinc-500 font-mono">+{task.reward} KES</span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">{task.title}</h3>
            <p className="text-xs text-zinc-400">{task.description}</p>
          </div>
        </div>

        {/* Task Interactive Content according to category */}

        {/* 1. TRIVIA QUIZ */}
        {task.category === 'trivia' && task.quizQuestions && (
          <div className="space-y-4">
            {!quizFinished ? (
              <div>
                <div className="flex justify-between items-center text-xs text-zinc-400 mb-2">
                  <span>Question {currentQuestionIndex + 1} of {task.quizQuestions.length}</span>
                  <span className="text-emerald-400 font-medium">Score: {score} Correct</span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex + 1) / task.quizQuestions.length) * 100}%` }}
                  />
                </div>

                <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 mb-4">
                  <h4 className="text-sm font-semibold text-zinc-100">
                    {task.quizQuestions[currentQuestionIndex].question}
                  </h4>
                </div>

                <div className="space-y-2">
                  {task.quizQuestions[currentQuestionIndex].options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswerSelect(idx)}
                      className="w-full text-left p-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-800/50 text-xs font-medium text-zinc-200 transition flex items-center justify-between"
                    >
                      <span>{option}</span>
                      <span className="w-5 h-5 rounded-full border border-zinc-700 flex items-center justify-center text-[10px] text-zinc-400">
                        {String.fromCharCode(65 + idx)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-4 space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                  <Award className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-white">
                  Quiz Completed! Score: {score} / {task.quizQuestions.length}
                </h4>
                <p className="text-xs text-zinc-400">
                  {score >= 2
                    ? 'Excellent job! You passed the verification test.'
                    : 'Passing score requires at least 2 correct answers. Please review and claim.'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* 2. VIDEO WATCH */}
        {task.category === 'video' && (
          <div className="space-y-4">
            <div className="relative aspect-video rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden flex items-center justify-center">
              <img
                src={task.videoUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80'}
                alt="Video thumbnail"
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
                <div className="flex items-center justify-between text-xs text-zinc-300">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
                    <span>Sponsored Streaming Promo</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-emerald-400 bg-black/60 px-2 py-1 rounded">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{secondsRemaining}s remaining</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Video progress indicator */}
            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-1000 ease-linear"
                style={{
                  width: `${((task.durationSeconds - secondsRemaining) / task.durationSeconds) * 100}%`,
                }}
              />
            </div>
            <p className="text-[11px] text-zinc-500 text-center">
              * Reward will unlock automatically as soon as the watch timer hits zero.
            </p>
          </div>
        )}

        {/* 3. CONSUMER SURVEY */}
        {task.category === 'survey' && task.surveyQuestions && (
          <div className="space-y-4">
            {task.surveyQuestions.map((q, qIndex) => (
              <div key={qIndex} className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <p className="text-xs font-semibold text-zinc-200">
                  {qIndex + 1}. {q.question}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((opt, optIndex) => (
                    <button
                      key={optIndex}
                      type="button"
                      onClick={() => setSurveyAnswers((prev) => ({ ...prev, [qIndex]: opt }))}
                      className={`p-2 rounded-lg text-xs text-left border transition ${
                        surveyAnswers[qIndex] === opt
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 4. HIGH SPEED CAPTCHA */}
        {task.category === 'captcha' && (
          <div className="space-y-4">
            <div className="p-6 bg-zinc-950 rounded-2xl border-2 border-dashed border-zinc-800 text-center select-none">
              <span className="text-xs text-zinc-500 block mb-2 font-mono">OPTICAL VERIFICATION CODE</span>
              <span className="text-2xl sm:text-3xl font-mono font-black tracking-widest text-emerald-400 italic bg-zinc-900 px-6 py-2 rounded-xl inline-block border border-zinc-700 shadow-inner">
                {task.captchaCode || 'ENZ-889-K'}
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Enter Code Above Exactly:</label>
              <input
                type="text"
                value={inputCaptcha}
                onChange={(e) => setInputCaptcha(e.target.value)}
                placeholder="Type code here..."
                className="w-full text-center tracking-widest text-lg font-mono uppercase rounded-lg bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-zinc-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* 5. SOCIAL CAMPAIGN */}
        {task.category === 'social' && (
          <div className="space-y-4 text-center py-3">
            <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-3">
              <p className="text-xs text-zinc-300">
                Click below to open the official Eneza Telegram Community, subscribe, and return to collect your KES reward.
              </p>
              <a
                href="https://t.me/eneza_earnings_official"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold hover:bg-emerald-600/30 transition"
              >
                <ThumbsUp className="w-4 h-4" />
                Open Official Telegram Channel
              </a>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-400 font-mono">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verifying link click in {secondsRemaining}s...</span>
            </div>
          </div>
        )}

        {/* 6. APP REVIEW */}
        {task.category === 'review' && (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 text-amber-400 hover:scale-110 transition"
                >
                  <Star className={`w-7 h-7 ${star <= rating ? 'fill-amber-400' : 'text-zinc-700'}`} />
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Feedback & Review Comment</label>
              <textarea
                rows={3}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Write your brief honest review of the mobile platform..."
                className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-zinc-100 text-xs focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white text-xs font-medium transition"
          >
            Cancel Task
          </button>

          <button
            type="button"
            disabled={!canSubmit() || isDone}
            onClick={handleFinishTask}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold shadow-lg shadow-emerald-900/30 transition flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            {isDone ? 'Reward Credited!' : `Claim +KES ${task.reward}`}
          </button>
        </div>
      </div>
    </div>
  );
};
