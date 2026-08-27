import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { DailyProductItem } from '../types';
import { Download } from 'lucide-react';

export interface SponsoredProductFlyerRef {
  exportFlyer: () => void;
}

interface SponsoredProductFlyerProps {
  product: DailyProductItem;
  onDownload?: () => void;
  showDownloadButton?: boolean;
}

export const SponsoredProductFlyer = forwardRef<
  SponsoredProductFlyerRef,
  SponsoredProductFlyerProps
>(({ product, onDownload, showDownloadButton = false }, ref) => {
  const flyerContainerRef = useRef<HTMLDivElement>(null);

  // Fallback values matching the exact uploaded reference style
  const headlineMain = product.headlineMain || 'ROYAL VELVET SOFA';
  const headlineSub = product.headlineSub || 'FOR SALE';
  const ribbonText = product.ribbonText || 'AQUIRE THIS LUXURY SUITE';
  const sealTop = product.sealTopText || 'BESPOKE';
  const sealBottom = product.sealBottomText || 'DESIGN';
  const features =
    product.featuresList && product.featuresList.length === 6
      ? product.featuresList
      : [
          '7-Seater Modular Set',
          'Water-Repellent Velvet',
          'Solid Hardwood Frame',
          'Gold Metal Accents',
          'Orthopedic Comfort',
          'Free White-Glove Setup',
        ];
  const managedBy = product.footerManagedBy || 'PROPERTY MANAGED BY ENEZA EARNINGS';

  // High-Res Canvas Exporter (1080x1080px crisp flyer)
  const handleExportFlyer = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderPoster = (imgLoaded: HTMLImageElement | null) => {
      // 1. Background (Image or dark studio atmosphere)
      if (imgLoaded) {
        try {
          ctx.drawImage(imgLoaded, 0, 0, 1080, 1080);
        } catch {
          drawFallbackStudioBg();
        }
      } else {
        drawFallbackStudioBg();
      }

      function drawFallbackStudioBg() {
        const bgGrad = ctx!.createRadialGradient(540, 540, 100, 540, 540, 650);
        bgGrad.addColorStop(0, '#273838');
        bgGrad.addColorStop(0.5, '#162222');
        bgGrad.addColorStop(1, '#090d0e');
        ctx!.fillStyle = bgGrad;
        ctx!.fillRect(0, 0, 1080, 1080);

        // Sofa illustration placeholder if image blocked
        ctx!.fillStyle = '#0f3d38';
        ctx!.beginPath();
        ctx!.roundRect(140, 420, 800, 360, 40);
        ctx!.fill();
      }

      // 2. Dark atmospheric vignettes (Top & Bottom smoke)
      const topGrad = ctx.createLinearGradient(0, 0, 0, 420);
      topGrad.addColorStop(0, 'rgba(5, 5, 5, 0.95)');
      topGrad.addColorStop(0.5, 'rgba(5, 5, 5, 0.7)');
      topGrad.addColorStop(1, 'rgba(5, 5, 5, 0.0)');
      ctx.fillStyle = topGrad;
      ctx.fillRect(0, 0, 1080, 420);

      const btmGrad = ctx.createLinearGradient(0, 600, 0, 1080);
      btmGrad.addColorStop(0, 'rgba(5, 5, 5, 0.0)');
      btmGrad.addColorStop(0.35, 'rgba(5, 5, 5, 0.75)');
      btmGrad.addColorStop(1, 'rgba(5, 5, 5, 0.98)');
      ctx.fillStyle = btmGrad;
      ctx.fillRect(0, 600, 1080, 480);

      // 3. Top-Right Golden Geometric Fold
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(880, 0);
      ctx.lineTo(1080, 0);
      ctx.lineTo(1080, 200);
      ctx.closePath();
      const goldFold = ctx.createLinearGradient(880, 0, 1080, 200);
      goldFold.addColorStop(0, '#fef08a');
      goldFold.addColorStop(0.4, '#eab308');
      goldFold.addColorStop(1, '#ca8a04');
      ctx.fillStyle = goldFold;
      ctx.fill();
      ctx.restore();

      // 4. Header: ENEZA / ◀ EARNINGS ▶
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 74px "Impact", "Arial Black", sans-serif';
      ctx.fillText('ENEZA', 540, 108);

      ctx.fillStyle = '#f59e0b';
      ctx.font = '800 28px sans-serif';
      ctx.fillText('◀  EARNINGS  ▶', 540, 155);

      // 5. Main Headline: Left Side
      ctx.textAlign = 'left';
      ctx.shadowColor = 'rgba(0,0,0,0.95)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;

      ctx.fillStyle = '#f59e0b';
      ctx.font = '900 64px "Impact", "Arial Black", sans-serif';
      ctx.fillText(headlineMain, 50, 430);
      ctx.fillText(headlineSub, 50, 498);
      ctx.shadowColor = 'transparent';

      // 6. Amber Ribbon Tag
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(50, 525, 460, 46);
      ctx.fillStyle = '#000000';
      ctx.font = '900 23px sans-serif';
      ctx.fillText(ribbonText, 66, 557);

      // 7. Right Circular Badge: BESPOKE DESIGN
      ctx.save();
      ctx.translate(850, 560);
      // Outer Gold Ring
      ctx.beginPath();
      ctx.arc(0, 0, 120, 0, Math.PI * 2);
      const ringGrad = ctx.createLinearGradient(-120, -120, 120, 120);
      ringGrad.addColorStop(0, '#fef08a');
      ringGrad.addColorStop(0.3, '#f59e0b');
      ringGrad.addColorStop(0.7, '#d97706');
      ringGrad.addColorStop(1, '#92400e');
      ctx.fillStyle = ringGrad;
      ctx.fill();

      // Inner Black Circle
      ctx.beginPath();
      ctx.arc(0, 0, 94, 0, Math.PI * 2);
      ctx.fillStyle = '#000000';
      ctx.fill();

      // Badge Text
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 36px sans-serif';
      ctx.fillText(sealTop, 0, -10);
      ctx.fillText(sealBottom, 0, 36);
      ctx.restore();

      // 8. Feature Box: Black container with Amber Border (2 columns x 3 items)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.92)';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 5;
      ctx.fillRect(50, 680, 680, 240);
      ctx.strokeRect(50, 680, 680, 240);

      ctx.fillStyle = '#ffffff';
      ctx.font = '700 24px sans-serif';
      ctx.textAlign = 'left';

      // Column 1 (items 0, 1, 2)
      ctx.fillText(`⦿  ${features[0]}`, 75, 735);
      ctx.fillText(`⦿  ${features[1]}`, 75, 800);
      ctx.fillText(`⦿  ${features[2]}`, 75, 865);

      // Column 2 (items 3, 4, 5)
      ctx.fillText(`⦿  ${features[3]}`, 410, 735);
      ctx.fillText(`⦿  ${features[4]}`, 410, 800);
      ctx.fillText(`⦿  ${features[5]}`, 410, 865);

      // 9. Bottom Pill: PROPERTY MANAGED BY ENEZA EARNINGS
      ctx.save();
      ctx.fillStyle = 'rgba(8, 8, 8, 0.95)';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;

      const px = 140;
      const py = 960;
      const pw = 800;
      const ph = 64;
      const pr = 32;

      ctx.beginPath();
      ctx.moveTo(px + pr, py);
      ctx.lineTo(px + pw - pr, py);
      ctx.quadraticCurveTo(px + pw, py, px + pw, py + pr);
      ctx.lineTo(px + pw, py + ph - pr);
      ctx.quadraticCurveTo(px + pw, py + ph, px + pw - pr, py + ph);
      ctx.lineTo(px + pr, py + ph);
      ctx.quadraticCurveTo(px, py + ph, px, py + ph - pr);
      ctx.lineTo(px, py + pr);
      ctx.quadraticCurveTo(px, py, px + pr, py);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 24px sans-serif';
      ctx.fillText(managedBy, 540, 1002);
      ctx.restore();

      // 10. Trigger direct download of the rendered image file
      const link = document.createElement('a');
      link.download = product.downloadFileName || 'eneza_royal_velvet_sofa_sale.jpg';
      link.href = canvas.toDataURL('image/jpeg', 0.95);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => renderPoster(img);
    img.onerror = () => renderPoster(null);
    img.src = product.imageBanner;
  };

  useImperativeHandle(ref, () => ({
    exportFlyer: handleExportFlyer,
  }));

  return (
    <div className="flex flex-col items-center w-full">
      {/* Visual Flyer Container (Identical to reference screenshot) */}
      <div
        ref={flyerContainerRef}
        className="relative w-full max-w-[480px] aspect-square rounded-2xl overflow-hidden border-2 border-amber-500/60 bg-black text-white shadow-2xl select-none group flex flex-col justify-between p-4 sm:p-5"
        style={{
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.95), 0 0 30px rgba(245, 158, 11, 0.2)',
        }}
      >
        {/* Background Image Banner */}
        <div className="absolute inset-0 z-0 bg-zinc-950">
          <img
            src={product.imageBanner}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {/* Top Dark Smoke Vignette */}
          <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-black via-black/80 to-transparent pointer-events-none" />
          {/* Bottom Dark Smoke Vignette */}
          <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-black via-black/85 to-transparent pointer-events-none" />
          {/* Atmospheric Dark Cloud Overlays */}
          <div className="absolute top-0 left-0 w-36 h-28 bg-radial from-zinc-800/60 to-transparent blur-xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-44 h-32 bg-radial from-zinc-800/70 to-transparent blur-xl pointer-events-none" />
        </div>

        {/* Top-Right Golden Folded Corner */}
        <div className="absolute top-0 right-0 z-30 pointer-events-none">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24">
            <div
              className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-yellow-200 via-amber-400 to-amber-600 shadow-xl"
              style={{
                clipPath: 'polygon(0 0, 100% 0, 100% 100%)',
              }}
            />
            <div
              className="absolute top-0 right-0 w-[95%] h-[95%] bg-gradient-to-bl from-yellow-100 via-yellow-400 to-yellow-600 opacity-90"
              style={{
                clipPath: 'polygon(5% 0, 100% 0, 100% 95%)',
              }}
            />
          </div>
        </div>

        {/* TOP BRAND HEADER: ENEZA EARNINGS */}
        <div className="relative z-10 text-center pt-0.5">
          <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase drop-shadow-[0_4px_6px_rgba(0,0,0,0.9)] font-sans">
            ENEZA
          </h3>
          <div className="inline-flex items-center justify-center gap-1 text-xs font-black text-amber-400 tracking-widest mt-0.5 drop-shadow-md">
            <span>◀</span>
            <span className="text-amber-400 font-extrabold uppercase text-[11px] sm:text-xs tracking-wider">
              EARNINGS
            </span>
            <span>▶</span>
          </div>
        </div>

        {/* MIDDLE SECTION: MAIN HEADLINE + RIBBON BANNER & CIRCULAR BADGE */}
        <div className="relative z-10 my-auto flex items-end justify-between gap-2 pt-6">
          {/* Left Column: Headlines + Ribbon */}
          <div className="space-y-1 max-w-[65%]">
            <div className="leading-tight drop-shadow-[0_4px_10px_rgba(0,0,0,0.95)]">
              <h4 className="text-2xl sm:text-3xl font-black text-amber-400 uppercase tracking-tighter drop-shadow-md leading-none">
                {headlineMain}
              </h4>
              <h4 className="text-2xl sm:text-3xl font-black text-amber-400 uppercase tracking-tighter drop-shadow-md leading-none mt-0.5">
                {headlineSub}
              </h4>
            </div>

            {/* Amber Ribbon Banner */}
            <div className="relative inline-flex items-center mt-1 shadow-lg">
              <div className="bg-amber-400 text-black px-2.5 py-0.5 font-black text-[10px] sm:text-[11px] uppercase tracking-wide rounded-xs shadow-md">
                {ribbonText}
              </div>
            </div>
          </div>

          {/* Right Column: BESPOKE DESIGN Gold Ring Badge */}
          <div className="relative shrink-0 flex items-center justify-center">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-yellow-200 via-amber-500 to-amber-700 p-1.5 sm:p-2 flex items-center justify-center shadow-2xl">
              <div className="w-full h-full rounded-full bg-black flex flex-col items-center justify-center text-center text-white px-1 shadow-inner">
                <span className="text-[10px] sm:text-[11px] font-black tracking-tight uppercase leading-none">
                  {sealTop}
                </span>
                <span className="text-[10px] sm:text-[11px] font-black tracking-tight uppercase leading-none mt-0.5">
                  {sealBottom}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: 2-COLUMN FEATURES BOX + MANAGED BY PILL */}
        <div className="relative z-10 space-y-2 mt-auto">
          {/* Orange-Bordered Feature Box */}
          <div className="rounded-xs border-2 border-amber-500 bg-black/90 backdrop-blur-xs p-2.5 sm:p-3 shadow-xl">
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] sm:text-[11px] font-bold text-zinc-100">
              {/* Column 1 */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="text-amber-400 font-black">⦿</span>
                  <span className="truncate">{features[0]}</span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <span className="text-amber-400 font-black">⦿</span>
                  <span className="truncate">{features[1]}</span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <span className="text-amber-400 font-black">⦿</span>
                  <span className="truncate">{features[2]}</span>
                </div>
              </div>

              {/* Column 2 */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="text-amber-400 font-black">⦿</span>
                  <span className="truncate">{features[3]}</span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <span className="text-amber-400 font-black">⦿</span>
                  <span className="truncate">{features[4]}</span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <span className="text-amber-400 font-black">⦿</span>
                  <span className="truncate">{features[5]}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Managed By Pill */}
          <div className="w-full py-1 px-3 rounded-full bg-black/95 border-2 border-white text-white text-center font-black text-[10px] sm:text-[11px] uppercase tracking-wider shadow-lg drop-shadow-md">
            {managedBy}
          </div>
        </div>
      </div>

      {/* Optional Download CTA Button */}
      {showDownloadButton && (
        <button
          onClick={handleExportFlyer}
          className="mt-4 w-full max-w-[480px] py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 transition active:scale-[0.99] shadow-lg shadow-amber-900/40 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Download High-Res WhatsApp Status Poster</span>
        </button>
      )}
    </div>
  );
});

SponsoredProductFlyer.displayName = 'SponsoredProductFlyer';

