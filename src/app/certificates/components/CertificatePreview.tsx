'use client';

import React from 'react';
import { X, Download, Printer } from 'lucide-react';
import { FrontendCertificate, formatCertificateType, getCertificateTemplate } from '@/lib/certificate-adapter';

interface CertificatePreviewProps {
  certificate: FrontendCertificate;
  onClose: () => void;
}

export default function CertificatePreview({ certificate, onClose }: CertificatePreviewProps) {
  const template = getCertificateTemplate(certificate.type);
  // Professional navy blue color theme
  const borderColor = '#1e3a5f'; // Deep professional navy blue

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #certificate-print-area,
          #certificate-print-area * {
            visibility: visible;
          }
          #certificate-print-area {
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            display: block !important;
          }
          @page {
            size: A4 landscape;
            margin: 0.5cm;
          }
          /* Ensure backgrounds and colors print */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
        }
      `}</style>
      
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
        {/* Modal Container - Hidden in print */}
        <div className="bg-white rounded-xl shadow-modal w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Certificate Preview</h2>
            <p className="text-sm text-muted-foreground">{certificate.certificateNumber}</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#1B4F8A] rounded-lg hover:bg-[#163f6f] transition-colors"
            >
              <Printer size={16} /> Print / Download
            </button>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="flex-1 overflow-auto p-6 bg-muted/30">
          <div className="max-w-3xl mx-auto bg-white shadow-lg">
            <CertificateDesign certificate={certificate} borderColor={borderColor} />
          </div>
        </div>
      </div>
      
      {/* Print-only certificate - Hidden on screen, visible only when printing */}
      <div id="certificate-print-area" style={{ display: 'none' }}>
        <CertificateDesign certificate={certificate} borderColor={borderColor} />
      </div>
    </div>
    </>
  );
}

function CertificateDesign({ certificate, borderColor }: { certificate: FrontendCertificate; borderColor: string }) {
  const issueDate = new Date(certificate.issuedDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div 
      className="relative p-8 bg-white print:p-8"
      style={{ 
        minHeight: '600px',
        maxHeight: '100%',
        background: `
          linear-gradient(135deg, 
            #ffffff 0%, 
            ${borderColor}08 25%, 
            #ffffff 50%, 
            ${borderColor}05 75%, 
            #ffffff 100%
          ),
          radial-gradient(circle at 10% 10%, ${borderColor}08 0%, transparent 40%),
          radial-gradient(circle at 90% 90%, ${borderColor}08 0%, transparent 40%),
          radial-gradient(circle at 50% 50%, ${borderColor}04 0%, transparent 60%)
        `,
        printColorAdjust: 'exact',
        WebkitPrintColorAdjust: 'exact',
      }}
    >
      {/* Elegant Multi-Layer Border */}
      <div 
        className="absolute inset-3 md:inset-5 border-[3px] pointer-events-none"
        style={{ 
          borderColor: `${borderColor}`,
          borderImage: `linear-gradient(135deg, ${borderColor}, ${borderColor}80, ${borderColor}) 1`,
        }}
      />
      <div 
        className="absolute inset-4 md:inset-6 border-[1px] pointer-events-none"
        style={{ borderColor: `${borderColor}40` }}
      />
      <div 
        className="absolute inset-[22px] md:inset-[30px] border-[1px] pointer-events-none"
        style={{ borderColor: `${borderColor}20` }}
      />

      {/* Elegant Corner Ornaments */}
      <svg className="absolute top-4 left-4 w-20 h-20 md:w-24 md:h-24" viewBox="0 0 100 100">
        <path d="M 0 0 L 0 40 Q 0 0 40 0 Z" fill={borderColor} opacity="0.15" />
        <path d="M 0 0 L 0 30 Q 0 0 30 0 Z" fill={borderColor} opacity="0.25" />
        <circle cx="15" cy="15" r="3" fill={borderColor} opacity="0.4" />
      </svg>
      <svg className="absolute top-4 right-4 w-20 h-20 md:w-24 md:h-24" viewBox="0 0 100 100">
        <path d="M 100 0 L 100 40 Q 100 0 60 0 Z" fill={borderColor} opacity="0.15" />
        <path d="M 100 0 L 100 30 Q 100 0 70 0 Z" fill={borderColor} opacity="0.25" />
        <circle cx="85" cy="15" r="3" fill={borderColor} opacity="0.4" />
      </svg>
      <svg className="absolute bottom-4 left-4 w-20 h-20 md:w-24 md:h-24" viewBox="0 0 100 100">
        <path d="M 0 100 L 0 60 Q 0 100 40 100 Z" fill={borderColor} opacity="0.15" />
        <path d="M 0 100 L 0 70 Q 0 100 30 100 Z" fill={borderColor} opacity="0.25" />
        <circle cx="15" cy="85" r="3" fill={borderColor} opacity="0.4" />
      </svg>
      <svg className="absolute bottom-4 right-4 w-20 h-20 md:w-24 md:h-24" viewBox="0 0 100 100">
        <path d="M 100 100 L 100 60 Q 100 100 60 100 Z" fill={borderColor} opacity="0.15" />
        <path d="M 100 100 L 100 70 Q 100 100 70 100 Z" fill={borderColor} opacity="0.25" />
        <circle cx="85" cy="85" r="3" fill={borderColor} opacity="0.4" />
      </svg>

      {/* Decorative Top Accent */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 flex items-center gap-2">
        <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-current to-transparent" style={{ color: borderColor, opacity: 0.3 }} />
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: borderColor, opacity: 0.5 }} />
        <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-current to-transparent" style={{ color: borderColor, opacity: 0.3 }} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center py-4">
        {/* Church Logo */}
        <div className="mb-3">
          <div className="relative inline-block">
            <div 
              className="absolute inset-0 rounded-full blur-2xl opacity-20"
              style={{ backgroundColor: borderColor }}
            />
            <div 
              className="relative w-16 h-16 rounded-full p-1 bg-white shadow-lg"
              style={{ 
                boxShadow: `0 8px 24px ${borderColor}25, 0 0 0 3px ${borderColor}15`
              }}
            >
              <img 
                src="/assets/images/app_logo.png" 
                alt="Church Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>

        {/* Church Header with Enhanced Typography */}
        <div className="mb-4">
          <div className="mb-2">
            <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-current to-transparent mx-auto mb-2" style={{ color: borderColor, opacity: 0.4 }} />
          </div>
          <h1 
            className="text-2xl md:text-4xl font-bold tracking-wider mb-1"
            style={{ 
              color: borderColor,
              fontFamily: 'Georgia, serif',
              letterSpacing: '0.05em',
              textShadow: `0 2px 4px ${borderColor}15`
            }}
          >
            {certificate.churchName}
          </h1>
          <p className="text-xs md:text-sm text-gray-600 tracking-wide uppercase" style={{ letterSpacing: '0.15em' }}>
            {certificate.churchLocation}
          </p>
          <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-current to-transparent mx-auto mt-2" style={{ color: borderColor, opacity: 0.4 }} />
        </div>

        {/* Certificate Type Badge */}
        <div className="mb-4">
          <div 
            className="inline-flex items-center gap-2 px-6 py-1.5 rounded-full text-white text-xs font-semibold tracking-wider uppercase shadow-lg"
            style={{ 
              backgroundColor: borderColor,
              boxShadow: `0 4px 12px ${borderColor}40`
            }}
          >
            <div className="w-1 h-1 rounded-full bg-white/60" />
            {formatCertificateType(certificate.type)}
            <div className="w-1 h-1 rounded-full bg-white/60" />
          </div>
        </div>

        {/* Certificate Title with Elegant Typography */}
        <div className="mb-5">
          <h2 
            className="text-3xl md:text-5xl font-bold text-gray-800 leading-tight"
            style={{ 
              fontFamily: 'Georgia, serif',
              letterSpacing: '0.02em'
            }}
          >
            {certificate.title}
          </h2>
          <div className="flex items-center justify-center gap-2 mt-3">
            <div className="w-10 h-[1px]" style={{ background: `linear-gradient(to right, transparent, ${borderColor}60, transparent)` }} />
            <div className="w-1.5 h-1.5 rounded-full rotate-45 border-2" style={{ borderColor: `${borderColor}60` }} />
            <div className="w-10 h-[1px]" style={{ background: `linear-gradient(to right, transparent, ${borderColor}60, transparent)` }} />
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto space-y-4">
          <p className="text-sm md:text-base text-gray-600 italic tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>
            This is to certify that
          </p>

          {/* Recipient with Enhanced Photo */}
          <div className="py-3">
            <div className="flex items-center justify-center gap-6 max-w-xl mx-auto">
              {/* Square Photo Frame */}
              <div className="relative flex-shrink-0">
                <div 
                  className="absolute inset-0 blur-xl opacity-20"
                  style={{ backgroundColor: borderColor }}
                />
                <div 
                  className="relative w-24 h-[116px] p-1"
                  style={{ 
                    background: `linear-gradient(135deg, ${borderColor}, ${borderColor}80)`,
                    boxShadow: `0 8px 24px ${borderColor}30`
                  }}
                >
                  <img 
                    src={certificate.memberPhoto} 
                    alt={certificate.memberName}
                    className="w-full h-full object-cover bg-white"
                  />
                </div>
              </div>
              
              {/* Name aligned to the right of photo */}
              <div className="flex-1 text-left">
                <div className="relative">
                  <h3 
                    className="text-2xl md:text-4xl font-bold"
                    style={{ 
                      color: borderColor,
                      fontFamily: 'Georgia, serif',
                      letterSpacing: '0.02em'
                    }}
                  >
                    {certificate.memberName}
                  </h3>
                  <div 
                    className="absolute -bottom-1 left-0 w-full h-[2px]"
                    style={{ background: `linear-gradient(to right, ${borderColor}60, transparent)` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Description with Better Typography */}
          <div className="px-4 md:px-8">
            <p className="text-xs md:text-sm text-gray-700 leading-relaxed" style={{ fontFamily: 'Georgia, serif', lineHeight: '1.6' }}>
              {certificate.description}
            </p>
          </div>

          {/* Certificate Number with Elegant Styling */}
          <div className="pt-2">
            <div className="inline-block px-4 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-600 font-mono tracking-wider">
                Certificate No: <span className="font-semibold" style={{ color: borderColor }}>{certificate.certificateNumber}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Date & Signature with Enhanced Design */}
        <div className="mt-6 w-full max-w-3xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-around gap-6 md:gap-8">
            {/* Date */}
            <div className="text-center">
              <div className="mb-2">
                <div className="w-10 h-[1px] bg-gray-300 mx-auto mb-1" />
              </div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1" style={{ letterSpacing: '0.15em' }}>Date Issued</p>
              <p className="text-sm md:text-base font-semibold text-gray-800" style={{ fontFamily: 'Georgia, serif' }}>{issueDate}</p>
            </div>

            {/* Signature */}
            {certificate.signedBy && (
              <div className="text-center">
                <div className="mb-2">
                  <div 
                    className="w-48 h-[2px] mx-auto mb-1"
                    style={{ background: `linear-gradient(to right, transparent, ${borderColor}80, transparent)` }}
                  />
                </div>
                <p 
                  className="text-lg md:text-xl font-bold mb-0.5"
                  style={{ 
                    color: borderColor,
                    fontFamily: 'Brush Script MT, cursive'
                  }}
                >
                  {certificate.signedBy}
                </p>
                <p className="text-[10px] text-gray-600 uppercase tracking-widest" style={{ letterSpacing: '0.15em' }}>
                  {certificate.signatoryTitle}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer with Seal */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-6 h-[1px]" style={{ background: `linear-gradient(to right, transparent, ${borderColor}40)` }} />
            <div className="w-1 h-1 rounded-full" style={{ backgroundColor: `${borderColor}60` }} />
            <div className="w-6 h-[1px]" style={{ background: `linear-gradient(to left, transparent, ${borderColor}40)` }} />
          </div>
          <p className="text-[10px] text-gray-500 leading-relaxed max-w-md mx-auto">
            This certificate is issued under the authority of {certificate.churchName} and bears witness to the accomplishment herein stated.
          </p>
          {certificate.status !== 'active' && (
            <div className="mt-4 inline-block px-4 py-2 bg-red-50 border-2 border-red-200 rounded-lg">
              <p className="text-xs font-bold text-red-700 uppercase tracking-wide">Status: {certificate.status}</p>
              {certificate.revocationReason && (
                <p className="text-[10px] text-red-600 mt-1">Reason: {certificate.revocationReason}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Subtle Watermark */}
      <div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.02]"
        style={{ transform: 'rotate(-45deg)' }}
      >
        <span 
          className="text-[180px] font-bold uppercase whitespace-nowrap"
          style={{ 
            color: borderColor,
            fontFamily: 'Georgia, serif',
            letterSpacing: '0.1em'
          }}
        >
          {certificate.churchName}
        </span>
      </div>

      {/* Decorative Bottom Accent */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2">
        <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-current to-transparent" style={{ color: borderColor, opacity: 0.3 }} />
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: borderColor, opacity: 0.5 }} />
        <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-current to-transparent" style={{ color: borderColor, opacity: 0.3 }} />
      </div>
    </div>
  );
}
