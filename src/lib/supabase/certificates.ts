import { createClient } from './client';

export type CertificateType = 'baptism' | 'membership' | 'achievement' | 'appreciation' | 'completion' | 'ordination' | 'leadership' | 'giving';
export type CertificateStatus = 'active' | 'revoked' | 'expired';

export interface Certificate {
  id: string;
  certificate_number: string;
  member_id: string;
  type: CertificateType;
  title: string;
  description: string;
  issued_date: string;
  expiry_date: string | null;
  signed_by: string;
  signatory_title: string;
  church_name: string;
  church_location: string;
  status: CertificateStatus;
  revocation_reason: string | null;
  revoked_at: string | null;
  revoked_by: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CertificateWithMember extends Certificate {
  member_name: string;
  member_photo: string;
  member_phone: string;
  member_email: string;
  member_gender: string;
}

export interface CertificateTemplate {
  id: CertificateType;
  name: string;
  description: string;
  defaultTitle: string;
  defaultDescription: string;
  icon: string;
  color: string;
}

// Certificate templates configuration
export const CERTIFICATE_TEMPLATES: CertificateTemplate[] = [
  {
    id: 'membership',
    name: 'Membership Certificate',
    description: 'Certificate for official church membership',
    defaultTitle: 'Certificate of Membership',
    defaultDescription: 'This certifies that the bearer is a recognized member of {churchName} in good standing, having fulfilled all requirements for membership and committed to supporting the vision and mission of the church.',
    icon: 'users',
    color: '#1B4F8A'
  },
  {
    id: 'baptism',
    name: 'Baptism Certificate',
    description: 'Certificate for water baptism',
    defaultTitle: 'Certificate of Baptism',
    defaultDescription: 'This certifies that the bearer has been baptized in water according to the command of our Lord Jesus Christ and the testimony of Scripture.',
    icon: 'droplets',
    color: '#3B82F6'
  },
  {
    id: 'achievement',
    name: 'Achievement Certificate',
    description: 'Certificate for notable achievements',
    defaultTitle: 'Certificate of Achievement',
    defaultDescription: 'This certificate is awarded in recognition of outstanding dedication, service, and commitment to the work of the ministry.',
    icon: 'award',
    color: '#F59E0B'
  },
  {
    id: 'appreciation',
    name: 'Appreciation Certificate',
    description: 'Certificate of appreciation for service',
    defaultTitle: 'Certificate of Appreciation',
    defaultDescription: 'In grateful appreciation for devoted service, faithful commitment, and valuable contributions to the ministry.',
    icon: 'heart',
    color: '#EC4899'
  },
  {
    id: 'completion',
    name: 'Completion Certificate',
    description: 'Certificate for course/training completion',
    defaultTitle: 'Certificate of Completion',
    defaultDescription: 'This certifies that the bearer has successfully completed all requirements and is hereby recognized for their dedication to learning and growth.',
    icon: 'book-open',
    color: '#10B981'
  },
  {
    id: 'ordination',
    name: 'Ordination Certificate',
    description: 'Certificate for ministerial ordination',
    defaultTitle: 'Certificate of Ordination',
    defaultDescription: 'This certifies that the bearer has been duly ordained as a minister of the Gospel, authorized to perform all ministerial duties.',
    icon: 'crown',
    color: '#8B5CF6'
  },
  {
    id: 'leadership',
    name: 'Leadership Certificate',
    description: 'Certificate for leadership roles',
    defaultTitle: 'Certificate of Leadership',
    defaultDescription: 'This certifies that the bearer has been appointed to a position of leadership and is recognized for their commitment to guiding others.',
    icon: 'star',
    color: '#6366F1'
  },
  {
    id: 'giving',
    name: 'Faithful Giving Certificate',
    description: 'Certificate for top tithers and donors',
    defaultTitle: 'Certificate of Faithful Giving',
    defaultDescription: 'In recognition of exceptional faithfulness in tithes and offerings, demonstrating a generous heart and unwavering commitment to advancing the Kingdom of God through {churchName}.',
    icon: 'hand-coins',
    color: '#D4AF37'
  }
];

// Transform database record to frontend format
export function transformCertificate(dbCert: any): Certificate {
  return {
    id: dbCert.id,
    certificate_number: dbCert.certificate_number,
    member_id: dbCert.member_id,
    type: dbCert.type as CertificateType,
    title: dbCert.title,
    description: dbCert.description || '',
    issued_date: dbCert.issued_date,
    expiry_date: dbCert.expiry_date,
    signed_by: dbCert.signed_by || '',
    signatory_title: dbCert.signatory_title || '',
    church_name: dbCert.church_name || 'GreaterWorks City Church',
    church_location: dbCert.church_location || 'Accra, Ghana',
    status: dbCert.status as CertificateStatus,
    revocation_reason: dbCert.revocation_reason,
    revoked_at: dbCert.revoked_at,
    revoked_by: dbCert.revoked_by,
    created_by: dbCert.created_by,
    created_at: dbCert.created_at,
    updated_at: dbCert.updated_at,
  };
}

// Fetch all certificates with member details
export async function fetchCertificates(): Promise<CertificateWithMember[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('member_certificates_view')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching certificates:', error);
    throw error;
  }

  return data || [];
}

// Fetch certificates by member ID
export async function fetchCertificatesByMember(memberId: string): Promise<Certificate[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('certificates')
    .select('*')
    .eq('member_id', memberId)
    .order('issued_date', { ascending: false });

  if (error) {
    console.error('Error fetching member certificates:', error);
    throw error;
  }

  return (data || []).map(transformCertificate);
}

// Fetch a single certificate by ID
export async function fetchCertificateById(id: string): Promise<CertificateWithMember | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('member_certificates_view')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching certificate:', error);
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data;
}

// Create a new certificate
export async function createCertificate(certData: Partial<Certificate>): Promise<Certificate> {
  const supabase = createClient();

  const dbData = {
    certificate_number: certData.certificate_number,
    member_id: certData.member_id,
    type: certData.type,
    title: certData.title,
    description: certData.description,
    issued_date: certData.issued_date,
    expiry_date: certData.expiry_date,
    signed_by: certData.signed_by,
    signatory_title: certData.signatory_title,
    church_name: certData.church_name,
    church_location: certData.church_location,
    status: certData.status || 'active',
    created_by: certData.created_by,
  };

  const { data, error } = await supabase
    .from('certificates')
    .insert(dbData as any)
    .select()
    .single();

  if (error) {
    console.error('Error creating certificate:', error);
    throw error;
  }

  return transformCertificate(data);
}

// Update an existing certificate
export async function updateCertificate(id: string, certData: Partial<Certificate>): Promise<Certificate> {
  const supabase = createClient();

  const dbData = {
    title: certData.title,
    description: certData.description,
    issued_date: certData.issued_date,
    expiry_date: certData.expiry_date,
    signed_by: certData.signed_by,
    signatory_title: certData.signatory_title,
    church_name: certData.church_name,
    church_location: certData.church_location,
    status: certData.status,
  };

  const { data, error } = await supabase
    .from('certificates')
    .update(dbData as any)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating certificate:', error);
    throw error;
  }

  return transformCertificate(data);
}

// Revoke a certificate
export async function revokeCertificate(
  id: string, 
  reason: string, 
  revokedBy: string
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .rpc('revoke_certificate', {
      cert_id: id,
      reason: reason,
      revoked_by_id: revokedBy,
    } as any);

  if (error) {
    console.error('Error revoking certificate:', error);
    throw error;
  }
}

// Delete a certificate
export async function deleteCertificate(id: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('certificates')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting certificate:', error);
    throw error;
  }
}

// Fetch certificate statistics
export async function fetchCertificateStatistics(): Promise<{
  total_certificates: number;
  active_certificates: number;
  revoked_certificates: number;
  expired_certificates: number;
  baptism_certificates: number;
  membership_certificates: number;
  achievement_certificates: number;
  appreciation_certificates: number;
  completion_certificates: number;
  ordination_certificates: number;
  leadership_certificates: number;
  issued_last_30_days: number;
  issued_last_90_days: number;
}> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('certificate_statistics')
    .select('*')
    .single();

  if (error) {
    console.error('Error fetching certificate statistics:', error);
    throw error;
  }

  return data || {
    total_certificates: 0,
    active_certificates: 0,
    revoked_certificates: 0,
    expired_certificates: 0,
    baptism_certificates: 0,
    membership_certificates: 0,
    achievement_certificates: 0,
    appreciation_certificates: 0,
    completion_certificates: 0,
    ordination_certificates: 0,
    leadership_certificates: 0,
    issued_last_30_days: 0,
    issued_last_90_days: 0,
  };
}

// Search certificates by certificate number or member name
export async function searchCertificates(query: string): Promise<CertificateWithMember[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('member_certificates_view')
    .select('*')
    .or(`certificate_number.ilike.%${query}%,member_name.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error searching certificates:', error);
    throw error;
  }

  return data || [];
}

// Get certificate template by type
export function getCertificateTemplate(type: CertificateType): CertificateTemplate | undefined {
  return CERTIFICATE_TEMPLATES.find(t => t.id === type);
}
