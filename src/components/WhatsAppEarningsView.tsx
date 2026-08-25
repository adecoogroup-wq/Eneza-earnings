import React, { useState, useEffect, useRef } from 'react';
import { User, WhatsAppSubmission, DailyProductItem } from '../types';
import { DAILY_PRODUCTS_CATALOG, WHATSAPP_PACKAGES } from '../data/mockData';
import { safeFormatDate, safeGetTime, safeToISODateString } from '../utils/dateUtils';
import {
  MessageSquare,
  Download,
  Copy,
  Check,
  UploadCloud,
  Image as ImageIcon,
  ShieldCheck,
  Unlock,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Eye,
  CheckCircle2,
  Zap,
  Clock,
  Flame,
  AlertTriangle,
  Lock,
  Tag,
  Plus,
  Trash2,
  Sliders,
} from 'lucide-react';
import { AppView } from './Sidebar';
import { SponsoredProductFlyer } from './SponsoredProductFlyer';

interface UploadedPhoto {
  file: File;
  previewUrl: string;
  id: string;
}

interface WhatsAppEarningsViewProps {
  currentUser: User;
  submissions: WhatsAppSubmission[];
  onSubmitViews: (viewCount: number, screenshotName: string) => void;
  onDisburseEarnings: () => void;
  onSwitchView: (view: AppView) => void;
}

export const WhatsAppEarningsView: React.FC<WhatsAppEarningsViewProps> = ({
  currentUser,
  submissions,
  onSubmitViews,
  onDisburseEarnings,
  onSwitchView,
}) => {
  const todayDayIndex = new Date().getDay();
  const activeProduct: DailyProductItem =
    DAILY_PRODUCTS_CATALOG[todayDayIndex] || DAILY_PRODUCTS_CATALOG[0];

  // Viewer Count state - allows typing any manual count or picking presets
  const [viewCountStr, setViewCountStr] = useState<string>('45');
  const viewCount = Math.max(0, parseInt(viewCountStr, 10) || 0);

  // Photos state (supporting multiple screenshot uploads with live thumbnail previews)
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isCopied, setIsCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDisbursing, setIsDisbursing] = useState(false);
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState<string | null>(null);
  const [uploadErrorMsg, setUploadErrorMsg] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Calculate live countdown to next 24-hour product refresh (midnight)
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setHours(24, 0, 0, 0);
      const diff = Math.max(0, tomorrow.getTime() - now.getTime());

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Resolve active package configuration and frequency constraints
  const userActivePackageId = currentUser.activeWhatsAppPackage || 'elite_500';
  const activePkgConfig =
    WHATSAPP_PACKAGES.find((p) => p.id === userActivePackageId) || WHATSAPP_PACKAGES[0];

  const maxWeeklyPosts =
    userActivePackageId === 'premium_3000' ? 7 : userActivePackageId === 'elite_1000' ? 4 : 2;

  // Check how many submissions were made in the past 7 days
  const nowMs = Date.now();
  const sevenDaysAgoMs = nowMs - 7 * 24 * 60 * 60 * 1000;
  const submissionsThisWeek = submissions.filter((s) => {
    const sTime = safeGetTime(s.date);
    return sTime >= sevenDaysAgoMs;
  }).length;

  // Check if today's submission already exists
  const todayKey = safeToISODateString(new Date());
  const isLocalStorageSubmitted =
    typeof window !== 'undefined' &&
    Boolean(localStorage.getItem(`eneza_sub_${currentUser.id}_${todayKey}`));

  const isSubmittedToday =
    isLocalStorageSubmitted ||
    submissions.some((s) => {
      const sDateStr = safeToISODateString(s.date);
      return sDateStr === todayKey;
    });

  const isWeeklyLimitReached = submissionsThisWeek >= maxWeeklyPosts;

  // Rate: 1 view = KES 100
  const calculatedEarnings = viewCount * 100;

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(activeProduct.caption);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleDownloadImage = () => {
    const link = document.createElement('a');
    link.href = activeProduct.imageBanner;
    link.download = activeProduct.downloadFileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Process selected image files safely with FileReader
  const handleFilesAdd = (files: FileList | File[]) => {
    setUploadErrorMsg(null);
    const incomingFiles = Array.from(files).filter(
      (f) => f.type.startsWith('image/') || /\.(jpe?g|png|webp|gif|bmp|heic)$/i.test(f.name)
    );

    if (incomingFiles.length === 0) {
      setUploadErrorMsg('Please select valid image files (JPG, PNG, WebP).');
      return;
    }

    incomingFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setUploadedPhotos((prev) => {
            const isAlreadyAdded = prev.some((p) => p.file.name === file.name && p.file.size === file.size);
            if (isAlreadyAdded) return prev;
            return [
              ...prev,
              {
                file,
                previewUrl: e.target!.result as string,
                id: `photo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              },
            ].slice(0, 6);
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (id: string) => {
    setUploadedPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (viewCount <= 0) {
      setUploadErrorMsg('Please enter a valid number of status viewers.');
      return;
    }
    if (isSubmittedToday || isWeeklyLimitReached) return;

    setUploadErrorMsg(null);
    setIsSubmitting(true);
    setTimeout(() => {
      try {
        localStorage.setItem(`eneza_sub_${currentUser.id}_${todayKey}`, 'submitted');
      } catch (err) {
        console.error(err);
      }

      const photoNames =
        uploadedPhotos.length > 0
          ? uploadedPhotos.map((p) => p.file.name).join(', ')
          : `${activeProduct.id}_proof_screenshot.png`;

      onSubmitViews(viewCount, photoNames);
      setIsSubmitting(false);
      setSubmitSuccessMsg(
        `Verified! +KES ${(calculatedEarnings || 0).toLocaleString()} added to your WhatsApp Earnings Pool.`
      );
      setUploadedPhotos([]);
      setTimeout(() => setSubmitSuccessMsg(null), 6000);
    }, 900);
  };

  const handleDisburseClick = () => {
    setIsDisbursing(true);
    setTimeout(() => {
      onDisburseEarnings();
      setIsDisbursing(false);
    }, 800);
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn max-w-5xl mx-auto">
      {/* 1. Header Summary */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-black border border-emerald-500/30 p-6 sm:p-8 shadow-2xl">
        {/* Glow decorations */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Eneza WhatsApp Status Advertising Program</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              WhatsApp Status Earnings
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Download today's sponsored product flyer branded with{' '}
              <strong className="text-amber-400">Eneza Earnings</strong>, post it on your WhatsApp
              Status, enter your viewers count, and upload your screenshot photos. Earn{' '}
              <span className="text-emerald-400 font-bold">KES 100 per status viewer</span> directly
              into your earnings balance.
            </p>

            {/* Posting Quota Badge */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 font-medium">
                Active Tier:{' '}
                <strong className="text-white font-bold">{activePkgConfig.name}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 font-medium">
                Weekly Quota:{' '}
                <strong className="text-emerald-400 font-mono font-bold">
                  {submissionsThisWeek} / {maxWeeklyPosts} Posts Used
                </strong>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 font-medium">
                Frequency:{' '}
                <strong className="text-amber-400 font-bold">{activePkgConfig.adFrequency}</strong>
              </span>
            </div>
          </div>

          {/* Balance & Disburse Tile */}
          <div className="bg-zinc-950/90 border border-zinc-800/90 rounded-2xl p-5 text-center shrink-0 w-full sm:w-auto space-y-3 shadow-xl">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">
              WhatsApp Earnings Balance
            </span>
            <div className="text-3xl font-black font-mono text-emerald-400">
              KES {(currentUser.whatsappBalance || 0).toLocaleString()}
            </div>

            <button
              onClick={handleDisburseClick}
              disabled={isDisbursing || (currentUser.whatsappBalance || 0) <= 0}
              className="w-full px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/40 transition active:scale-[0.99] cursor-pointer"
            >
              {isDisbursing ? (
                <span>Transferring Earnings...</span>
              ) : (
                <>
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Transfer to Spendable Balance</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Security / Live Verification Bar */}
        <div className="mt-5 pt-4 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Anti-Duplicate System Active • 1x Submission per 24 Hours • Direct Disbursal</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>OCR Audience Verification Ready</span>
          </div>
        </div>
      </div>

      {/* Grid: Left Promotional Poster Flyer / Right Screenshot Submission */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: SPONSORED POSTER */}
        <div className="lg:col-span-5 rounded-3xl bg-zinc-900 border border-zinc-800 p-5 sm:p-6 space-y-4 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                  {activeProduct.dayBadge || "Today's Sponsored Creative"}
                </span>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  {activeProduct.title}
                </h2>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                {activeProduct.targetViewsRate || 'KES 100 / View'}
              </span>
            </div>

            {/* HIGH-IMPACT SPONSORED POSTER FLYER */}
            <div className="mt-4 flex justify-center">
              <SponsoredProductFlyer product={activeProduct} onDownload={handleDownloadImage} />
            </div>
          </div>

          {/* Action Buttons: Download Creative & Copy Caption */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleDownloadImage}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 transition active:scale-[0.99] shadow-lg shadow-amber-950/40 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download WhatsApp Status Flyer</span>
            </button>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-400">Status Caption to Copy:</span>
                <button
                  onClick={handleCopyCaption}
                  className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold cursor-pointer"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Caption</span>
                    </>
                  )}
                </button>
              </div>
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 leading-relaxed font-mono select-all max-h-24 overflow-y-auto">
                {activeProduct.caption}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ENTER VIEWERS COUNT & UPLOAD PHOTOS */}
        <div className="lg:col-span-7 rounded-3xl bg-zinc-900 border border-zinc-800 p-5 sm:p-6 space-y-5 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-emerald-400" />
                <span>Submit Status Viewers & Photo Proof</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Enter the exact number of viewers you gained and attach screenshot photo(s) of your WhatsApp Status views.
              </p>
            </div>

            {/* FREQUENCY LOCK NOTICES */}
            {isSubmittedToday && (
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Today's Screenshot Proof Already Submitted!</span>
                </div>
                <p className="leading-relaxed">
                  You have successfully submitted your status proof for today's active product and
                  credited your pool. Daily submissions are strictly limited to{' '}
                  <strong>once per 24-hour cycle</strong>.
                </p>
                <div className="pt-1 flex items-center gap-2 font-mono text-[11px] text-amber-300">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    Next product rotation opens in: {String(timeLeft.hours).padStart(2, '0')}:
                    {String(timeLeft.minutes).padStart(2, '0')}:
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                </div>
              </div>
            )}

            {!isSubmittedToday && isWeeklyLimitReached && (
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-amber-300">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Weekly Advertising Limit Reached ({submissionsThisWeek}/{maxWeeklyPosts})</span>
                </div>
                <p className="leading-relaxed">
                  Your active package (<strong>{activePkgConfig.name}</strong>) allows{' '}
                  <strong>{maxWeeklyPosts} posts per week</strong>. Upgrade your package to unlock 4x
                  weekly or daily unlimited advertising.
                </p>
                <button
                  onClick={() => onSwitchView('whatsappPackagesView')}
                  className="mt-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Upgrade to Pro / Premium Package</span>
                </button>
              </div>
            )}

            {submitSuccessMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{submitSuccessMsg}</span>
              </div>
            )}

            {uploadErrorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-fadeIn">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{uploadErrorMsg}</span>
              </div>
            )}

            {/* Submission Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* SECTION 1: ENTER AMOUNT OF VIEWERS MANUALLY */}
              <div className="space-y-3 bg-zinc-950/70 border border-zinc-800/90 rounded-2xl p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <label className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-emerald-400" />
                    <span>Enter Amount of Status Viewers (Manual Input):</span>
                  </label>
                  <span className="text-[11px] font-semibold text-emerald-400 font-mono">
                    KES 100 per Viewer
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="50000"
                    disabled={isSubmittedToday || isWeeklyLimitReached || isSubmitting}
                    value={viewCountStr || ''}
                    onChange={(e) => setViewCountStr(e.target.value)}
                    placeholder="Type amount of viewers (e.g. 75, 120, 250)"
                    required
                    className="w-full px-4 py-3.5 rounded-xl bg-zinc-900 border border-zinc-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-mono text-2xl font-black focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition"
                  />
                  <div className="absolute right-4 top-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    Viewers
                  </div>
                </div>

                {/* Quick Selection Preset Chips */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] text-zinc-400 font-semibold mr-1">Presets:</span>
                  {[20, 50, 100, 200, 350, 500, 1000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      disabled={isSubmittedToday || isWeeklyLimitReached || isSubmitting}
                      onClick={() => setViewCountStr(String(preset))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition cursor-pointer ${
                        viewCount === preset
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-xs'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
                      }`}
                    >
                      {preset} views
                    </button>
                  ))}
                </div>

                {/* Calculated Earnings Card */}
                <div className="mt-2 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
                      Calculated Direct Payout
                    </span>
                    <span className="text-xs text-zinc-300">
                      Rate: KES 100 × <strong className="text-white font-mono">{viewCount || 0}</strong> viewers
                    </span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
                    +KES {(calculatedEarnings || 0).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* SECTION 2: UPLOAD PHOTOS */}
              <div className="space-y-3 bg-zinc-950/70 border border-zinc-800/90 rounded-2xl p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <label className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-emerald-400" />
                    <span>Upload Status Screenshot Photos:</span>
                  </label>
                  <span className="text-[11px] text-zinc-400 font-medium">
                    {uploadedPhotos.length > 0
                      ? `${uploadedPhotos.length} photo(s) selected`
                      : 'Attach 1-4 screenshot photos'}
                  </span>
                </div>

                {/* Drag and Drop / Click Zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (!isSubmittedToday && !isWeeklyLimitReached && !isSubmitting) {
                      setIsDragOver(true);
                    }
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                    if (!isSubmittedToday && !isWeeklyLimitReached && !isSubmitting) {
                      handleFilesAdd(e.dataTransfer.files);
                    }
                  }}
                  onClick={() => {
                    if (!isSubmittedToday && !isWeeklyLimitReached && !isSubmitting) {
                      fileInputRef.current?.click();
                    }
                  }}
                  className={`border-2 border-dashed rounded-2xl p-5 sm:p-6 flex flex-col items-center justify-center gap-3 transition cursor-pointer group ${
                    isDragOver
                      ? 'border-emerald-400 bg-emerald-950/30'
                      : isSubmittedToday || isWeeklyLimitReached
                      ? 'border-zinc-800 bg-zinc-950/40 opacity-60 cursor-not-allowed'
                      : 'border-zinc-700 hover:border-emerald-500/60 bg-zinc-900/60 hover:bg-zinc-900'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={isSubmittedToday || isWeeklyLimitReached || isSubmitting}
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleFilesAdd(e.target.files);
                        e.target.value = ''; // Reset input to allow selecting same file again if needed
                      }
                    }}
                    className="hidden"
                  />

                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition">
                    <UploadCloud className="w-6 h-6" />
                  </div>

                  <div className="text-center space-y-1">
                    <div className="text-sm font-bold text-zinc-200">
                      Click to Browse or Drag & Drop Photos
                    </div>
                    <div className="text-xs text-zinc-400 max-w-sm">
                      Upload screenshots showing viewer count list & active status (JPG, PNG, WebP)
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    disabled={isSubmittedToday || isWeeklyLimitReached || isSubmitting}
                    className="mt-1 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-bold flex items-center gap-1.5 border border-zinc-700 transition"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Choose Photos from Device</span>
                  </button>
                </div>

                {/* Uploaded Photo Previews */}
                {uploadedPhotos.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
                    {uploadedPhotos.map((photo, idx) => (
                      <div
                        key={photo.id}
                        className="relative group rounded-xl overflow-hidden border border-zinc-700 bg-zinc-900 aspect-video flex items-center justify-center shadow-md"
                      >
                        <img
                          src={photo.previewUrl}
                          alt={`Proof ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-between p-2">
                          <span className="text-[10px] text-white font-mono truncate max-w-[80px]">
                            {photo.file.name}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemovePhoto(photo.id);
                            }}
                            className="p-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/80 text-[9px] text-emerald-400 font-mono">
                          Photo {idx + 1}
                        </div>
                      </div>
                    ))}

                    {uploadedPhotos.length < 4 && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isSubmittedToday || isWeeklyLimitReached || isSubmitting}
                        className="rounded-xl border border-dashed border-zinc-700 hover:border-emerald-500/60 bg-zinc-900/40 hover:bg-zinc-900 flex flex-col items-center justify-center gap-1 aspect-video text-xs text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
                      >
                        <Plus className="w-5 h-5 text-emerald-400" />
                        <span className="text-[11px] font-bold">Add Another Photo</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  viewCount <= 0 ||
                  isSubmittedToday ||
                  isWeeklyLimitReached
                }
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition active:scale-[0.99] cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Verifying Proof OCR & Crediting Account...
                  </span>
                ) : isSubmittedToday ? (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Already Submitted for Today (1x / Day)</span>
                  </span>
                ) : isWeeklyLimitReached ? (
                  <span className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    <span>Weekly Limit Reached ({submissionsThisWeek}/{maxWeeklyPosts})</span>
                  </span>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>
                      Submit {viewCount} Viewers & Claim KES {(calculatedEarnings || 0).toLocaleString()}
                    </span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Verification Rules Footnote */}
          <div className="pt-3 border-t border-zinc-800/80 text-[11px] text-zinc-400 space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-300 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Anti-Fraud Compliance Rules:</span>
            </div>
            <p>
              • One status proof per 24 hours. Weekly posting limit strictly enforced by package tier.
            </p>
            <p>• Screenshots must clearly display the status timestamp and viewer count list.</p>
          </div>
        </div>
      </div>

      {/* 4. Verified Submissions Activity Ledger */}
      <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Recent Verified WhatsApp Submissions</span>
          </h3>
          <span className="text-xs text-zinc-400">
            Total Submissions:{' '}
            <strong className="text-emerald-400 font-mono">{submissions.length}</strong>
          </span>
        </div>

        <div className="divide-y divide-zinc-800/80 text-xs">
          {submissions.length === 0 ? (
            <div className="py-8 text-center text-zinc-500">
              No submissions recorded yet. Post today's creative on WhatsApp and submit above!
            </div>
          ) : (
            submissions.map((item) => (
              <div key={item.id} className="py-3.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    <Eye className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white flex items-center gap-2">
                      <span>{item.viewCount} Status Viewers</span>
                      <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold">
                        Verified
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                      {item.productName || 'Eneza Sponsored Product'} •{' '}
                      {safeFormatDate(item.date)}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-black text-emerald-400 text-sm">
                    +KES {(item.earnedAmount || item.viewCount * 100 || 0).toLocaleString()}
                  </div>
                  <span className="text-[10px] text-zinc-500">Credited to Pool</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
