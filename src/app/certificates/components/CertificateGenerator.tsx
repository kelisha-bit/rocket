'use client';

import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  ChevronRight, 
  ChevronLeft, 
  Award,
  Users,
  Droplets,
  Heart,
  BookOpen,
  Crown,
  Star,
  Check,
  HandCoins
} from 'lucide-react';
import { Member } from '@/app/member-management/components/memberData';
import { 
  CertificateFormData, 
  CertificateType,
  CERTIFICATE_TEMPLATES,
  getCertificateTemplate,
  generateDefaultDescription,
} from '@/lib/certificate-adapter';

interface CertificateGeneratorProps {
  members: Member[];
  onClose: () => void;
  onGenerate: (data: CertificateFormData) => void;
}

type Step = 'type' | 'member' | 'details' | 'preview';

export default function CertificateGenerator({ members, onClose, onGenerate }: CertificateGeneratorProps) {
  const [step, setStep] = useState<Step>('type');
  const [selectedType, setSelectedType] = useState<CertificateType | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState<CertificateFormData>({
    memberId: '',
    type: 'membership',
    title: '',
    description: '',
    issuedDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    signedBy: '',
    signatoryTitle: '',
    churchName: 'GreaterWorks City Church',
    churchLocation: 'Accra, Ghana',
  });

  const filteredMembers = useMemo(() => {
    if (!searchQuery) return members;
    const q = searchQuery.toLowerCase();
    return members.filter(m => 
      m.name.toLowerCase().includes(q) || 
      m.memberId.toLowerCase().includes(q) ||
      m.phone.includes(q)
    );
  }, [members, searchQuery]);

  const handleTypeSelect = (type: CertificateType) => {
    setSelectedType(type);
    const template = getCertificateTemplate(type);
    setFormData(prev => ({
      ...prev,
      type,
      title: template?.defaultTitle || '',
      description: generateDefaultDescription(type, prev.churchName),
    }));
    setStep('member');
  };

  const handleMemberSelect = (member: Member) => {
    setSelectedMember(member);
    setFormData(prev => ({ ...prev, memberId: member.id }));
    setStep('details');
  };

  const handleSubmit = () => {
    if (selectedType && selectedMember) {
      onGenerate(formData);
    }
  };

  const steps = [
    { id: 'type' as Step, label: 'Certificate Type', icon: Award },
    { id: 'member' as Step, label: 'Select Member', icon: Users },
    { id: 'details' as Step, label: 'Certificate Details', icon: BookOpen },
    { id: 'preview' as Step, label: 'Preview & Generate', icon: Check },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === step);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-modal w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-gradient-to-r from-[#1B4F8A] to-[#2d6da8]">
          <div>
            <h2 className="text-lg font-semibold text-white">Generate Certificate</h2>
            <p className="text-sm text-white/70">Create a new certificate for a deserving member</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X size={20} className="text-white" />
          </button>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-1 sm:gap-2 px-4 sm:px-6 py-3 bg-muted/30 border-b border-border overflow-x-auto">
          {steps.map((s, i) => (
            <React.Fragment key={s.id}>
              <div 
                className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap ${
                  step === s.id 
                    ? 'bg-[#1B4F8A] text-white' 
                    : i < currentStepIndex 
                      ? 'bg-green-100 text-green-700' 
                      : 'text-muted-foreground'
                }`}
              >
                <s.icon size={12} className="sm:size-[14px]" />
                <span className="hidden xs:inline">{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <ChevronRight size={14} className="text-muted-foreground shrink-0 hidden sm:block" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Select Type */}
          {step === 'type' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Select Certificate Type</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {CERTIFICATE_TEMPLATES.map(template => {
                  const IconComponent = {
                    users: Users,
                    droplets: Droplets,
                    award: Award,
                    heart: Heart,
                    'book-open': BookOpen,
                    crown: Crown,
                    star: Star,
                    'hand-coins': HandCoins,
                  }[template.icon] || Award;

                  return (
                    <button
                      key={template.id}
                      onClick={() => handleTypeSelect(template.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all hover:shadow-md ${
                        selectedType === template.id 
                          ? 'border-[#1B4F8A] bg-blue-50' 
                          : 'border-border hover:border-[#1B4F8A]/50'
                      }`}
                    >
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center mb-3"
                        style={{ backgroundColor: `${template.color}20` }}
                      >
                        <IconComponent size={24} style={{ color: template.color }} />
                      </div>
                      <h4 className="font-semibold text-foreground">{template.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Select Member */}
          {step === 'member' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Select Member</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  type="text"
                  placeholder="Search members by name, ID, or phone..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
                {filteredMembers.map(member => (
                  <button
                    key={member.id}
                    onClick={() => handleMemberSelect(member)}
                    className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                      selectedMember?.id === member.id 
                        ? 'border-[#1B4F8A] bg-blue-50' 
                        : 'border-border hover:border-[#1B4F8A]/50 hover:bg-muted/30'
                    }`}
                  >
                    <img 
                      src={member.photo} 
                      alt={member.name} 
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.memberId}</p>
                      <p className="text-xs text-muted-foreground">{member.phone}</p>
                    </div>
                    {selectedMember?.id === member.id && (
                      <div className="w-6 h-6 rounded-full bg-[#1B4F8A] text-white flex items-center justify-center">
                        <Check size={14} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Certificate Details */}
          {step === 'details' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Certificate Details</h3>
              
              <div className="bg-muted/30 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-3">
                  <img 
                    src={selectedMember?.photo} 
                    alt={selectedMember?.name} 
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-foreground">{selectedMember?.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedMember?.memberId}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Certificate Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Issued Date</label>
                  <input
                    type="date"
                    value={formData.issuedDate}
                    onChange={e => setFormData(prev => ({ ...prev, issuedDate: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Signed By</label>
                  <input
                    type="text"
                    placeholder="e.g., Pastor John Doe"
                    value={formData.signedBy}
                    onChange={e => setFormData(prev => ({ ...prev, signedBy: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Signatory Title</label>
                  <input
                    type="text"
                    placeholder="e.g., Senior Pastor"
                    value={formData.signatoryTitle}
                    onChange={e => setFormData(prev => ({ ...prev, signatoryTitle: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Church Name</label>
                  <input
                    type="text"
                    value={formData.churchName}
                    onChange={e => {
                      const newChurchName = e.target.value;
                      setFormData(prev => ({ 
                        ...prev, 
                        churchName: newChurchName,
                        description: generateDefaultDescription(prev.type, newChurchName)
                      }));
                    }}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Church Location</label>
                  <input
                    type="text"
                    value={formData.churchLocation}
                    onChange={e => setFormData(prev => ({ ...prev, churchLocation: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Expiry Date (Optional)</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={e => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/30">
          <button
            onClick={() => {
              if (step === 'member') setStep('type');
              else if (step === 'details') setStep('member');
            }}
            disabled={step === 'type'}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} /> Back
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            {step === 'details' ? (
              <button
                onClick={handleSubmit}
                disabled={!formData.title || !formData.signedBy}
                className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-[#1B4F8A] rounded-lg hover:bg-[#163f6f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Check size={16} /> Generate Certificate
              </button>
            ) : (
              <button
                onClick={() => {
                  if (step === 'type' && selectedType) setStep('member');
                  else if (step === 'member' && selectedMember) setStep('details');
                }}
                disabled={(step === 'type' && !selectedType) || (step === 'member' && !selectedMember)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#1B4F8A] rounded-lg hover:bg-[#163f6f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
