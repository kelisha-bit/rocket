import {
  Certificate,
  CertificateWithMember,
  CertificateType,
  CertificateTemplate,
  CERTIFICATE_TEMPLATES,
  fetchCertificates,
  fetchCertificatesByMember,
  fetchCertificateById,
  createCertificate,
  updateCertificate,
  revokeCertificate,
  deleteCertificate,
  fetchCertificateStatistics,
  searchCertificates,
  getCertificateTemplate,
} from './supabase/certificates';

export type { Certificate, CertificateWithMember, CertificateType, CertificateTemplate };
export { CERTIFICATE_TEMPLATES, getCertificateTemplate };

export interface FrontendCertificate {
  id: string;
  certificateNumber: string;
  memberId: string;
  memberName: string;
  memberPhoto: string;
  type: CertificateType;
  title: string;
  description: string;
  issuedDate: string;
  expiryDate: string | null;
  signedBy: string;
  signatoryTitle: string;
  churchName: string;
  churchLocation: string;
  status: 'active' | 'revoked' | 'expired';
  revocationReason: string | null;
  revokedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CertificateFormData {
  memberId: string;
  type: CertificateType;
  title: string;
  description: string;
  issuedDate: string;
  expiryDate?: string;
  signedBy: string;
  signatoryTitle: string;
  churchName: string;
  churchLocation: string;
}

function transformToFrontend(cert: CertificateWithMember): FrontendCertificate {
  return {
    id: cert.id,
    certificateNumber: cert.certificate_number,
    memberId: cert.member_id,
    memberName: cert.member_name,
    memberPhoto: cert.member_photo,
    type: cert.type,
    title: cert.title,
    description: cert.description || '',
    issuedDate: cert.issued_date,
    expiryDate: cert.expiry_date,
    signedBy: cert.signed_by || '',
    signatoryTitle: cert.signatory_title || '',
    churchName: cert.church_name || 'GreaterWorks City Church',
    churchLocation: cert.church_location || 'Accra, Ghana',
    status: cert.status,
    revocationReason: cert.revocation_reason,
    revokedAt: cert.revoked_at,
    createdAt: cert.created_at,
    updatedAt: cert.updated_at,
  };
}

function transformFormToBackend(formData: CertificateFormData, createdBy?: string): Partial<Certificate> {
  const template = getCertificateTemplate(formData.type);
  
  return {
    member_id: formData.memberId,
    type: formData.type,
    title: formData.title || template?.defaultTitle || 'Certificate',
    description: formData.description?.replace('{churchName}', formData.churchName) || template?.defaultDescription || '',
    issued_date: formData.issuedDate,
    expiry_date: formData.expiryDate || null,
    signed_by: formData.signedBy,
    signatory_title: formData.signatoryTitle,
    church_name: formData.churchName || 'GreaterWorks City Church',
    church_location: formData.churchLocation || 'Accra, Ghana',
    status: 'active',
    created_by: createdBy || null,
  };
}

// Fetch all certificates for the frontend
export async function fetchFrontendCertificates(): Promise<FrontendCertificate[]> {
  try {
    const certificates = await fetchCertificates();
    return certificates.map(transformToFrontend);
  } catch (error) {
    console.error('Error fetching frontend certificates:', error);
    throw error;
  }
}

// Fetch certificates by member ID
export async function fetchFrontendCertificatesByMember(memberId: string): Promise<FrontendCertificate[]> {
  try {
    const certificates = await fetchCertificatesByMember(memberId);
    return certificates.map(cert => ({
      id: cert.id,
      certificateNumber: cert.certificate_number,
      memberId: cert.member_id,
      memberName: '',
      memberPhoto: '',
      type: cert.type,
      title: cert.title,
      description: cert.description || '',
      issuedDate: cert.issued_date,
      expiryDate: cert.expiry_date,
      signedBy: cert.signed_by || '',
      signatoryTitle: cert.signatory_title || '',
      churchName: cert.church_name || 'GreaterWorks City Church',
      churchLocation: cert.church_location || 'Accra, Ghana',
      status: cert.status,
      revocationReason: cert.revocation_reason,
      revokedAt: cert.revoked_at,
      createdAt: cert.created_at,
      updatedAt: cert.updated_at,
    }));
  } catch (error) {
    console.error('Error fetching member certificates:', error);
    throw error;
  }
}

// Fetch a single certificate by ID
export async function fetchFrontendCertificateById(id: string): Promise<FrontendCertificate | null> {
  try {
    const certificate = await fetchCertificateById(id);
    if (!certificate) return null;
    return transformToFrontend(certificate);
  } catch (error) {
    console.error('Error fetching certificate by ID:', error);
    throw error;
  }
}

// Create a new certificate
export async function createFrontendCertificate(
  formData: CertificateFormData, 
  createdBy?: string
): Promise<FrontendCertificate> {
  try {
    const backendData = transformFormToBackend(formData, createdBy);
    const created = await createCertificate(backendData);
    
    // Fetch the full certificate with member details
    const fullCert = await fetchCertificateById(created.id);
    if (!fullCert) throw new Error('Failed to fetch created certificate');
    
    return transformToFrontend(fullCert);
  } catch (error) {
    console.error('Error creating certificate:', error);
    throw error;
  }
}

// Update an existing certificate
export async function updateFrontendCertificate(
  id: string, 
  formData: Partial<CertificateFormData>
): Promise<FrontendCertificate> {
  try {
    const backendData: Partial<Certificate> = {};
    
    if (formData.title !== undefined) backendData.title = formData.title;
    if (formData.description !== undefined) backendData.description = formData.description;
    if (formData.issuedDate !== undefined) backendData.issued_date = formData.issuedDate;
    if (formData.expiryDate !== undefined) backendData.expiry_date = formData.expiryDate || null;
    if (formData.signedBy !== undefined) backendData.signed_by = formData.signedBy;
    if (formData.signatoryTitle !== undefined) backendData.signatory_title = formData.signatoryTitle;
    if (formData.churchName !== undefined) backendData.church_name = formData.churchName;
    if (formData.churchLocation !== undefined) backendData.church_location = formData.churchLocation;
    
    const updated = await updateCertificate(id, backendData);
    
    // Fetch the full certificate with member details
    const fullCert = await fetchCertificateById(updated.id);
    if (!fullCert) throw new Error('Failed to fetch updated certificate');
    
    return transformToFrontend(fullCert);
  } catch (error) {
    console.error('Error updating certificate:', error);
    throw error;
  }
}

// Revoke a certificate
export async function revokeFrontendCertificate(
  id: string, 
  reason: string, 
  revokedBy: string
): Promise<void> {
  try {
    await revokeCertificate(id, reason, revokedBy);
  } catch (error) {
    console.error('Error revoking certificate:', error);
    throw error;
  }
}

// Delete a certificate
export async function deleteFrontendCertificate(id: string): Promise<void> {
  try {
    await deleteCertificate(id);
  } catch (error) {
    console.error('Error deleting certificate:', error);
    throw error;
  }
}

// Search certificates
export async function searchFrontendCertificates(query: string): Promise<FrontendCertificate[]> {
  try {
    const certificates = await searchCertificates(query);
    return certificates.map(transformToFrontend);
  } catch (error) {
    console.error('Error searching certificates:', error);
    throw error;
  }
}

// Fetch certificate statistics
export async function fetchFrontendCertificateStatistics() {
  try {
    return await fetchCertificateStatistics();
  } catch (error) {
    console.error('Error fetching certificate statistics:', error);
    throw error;
  }
}

// Format certificate type for display
export function formatCertificateType(type: CertificateType): string {
  const typeMap: Record<CertificateType, string> = {
    baptism: 'Baptism',
    membership: 'Membership',
    achievement: 'Achievement',
    appreciation: 'Appreciation',
    completion: 'Completion',
    ordination: 'Ordination',
    leadership: 'Leadership',
    giving: 'Faithful Giving',
  };
  return typeMap[type] || type;
}

// Format certificate status for display
export function formatCertificateStatus(status: string): string {
  const statusMap: Record<string, string> = {
    active: 'Active',
    revoked: 'Revoked',
    expired: 'Expired',
  };
  return statusMap[status] || status;
}

// Get status color
export function getCertificateStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    revoked: 'bg-red-100 text-red-800',
    expired: 'bg-yellow-100 text-yellow-800',
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800';
}

// Generate default description for certificate type
export function generateDefaultDescription(type: CertificateType, churchName: string): string {
  const template = getCertificateTemplate(type);
  if (!template) return '';
  return template.defaultDescription.replace('{churchName}', churchName);
}
