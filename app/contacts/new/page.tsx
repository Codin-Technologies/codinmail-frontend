'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { ArrowLeft, Building2, Mail, Phone, Save, UserRound, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { apiFetch } from '@/lib/api/api-client';

function ContactField({ label, name, placeholder, type = 'text', icon: Icon, defaultValue, required = false }: { label: string; name: string; placeholder: string; type?: string; icon: typeof Mail; defaultValue?: string; required?: boolean }) {
  return <label className="contact-field"><span>{label}{required && <b aria-hidden="true">*</b>}</span><div className="contact-input"><Icon size={16} aria-hidden="true" /><input name={name} type={type} placeholder={placeholder} defaultValue={defaultValue} required={required} /></div></label>;
}

export default function NewContactPage() {
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    jobTitle: '',
    phone: '',
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError('');

    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      await apiFetch('/contacts', {
        method: 'POST',
        body: formData,
      });

      window.location.href = '/contacts';
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to create the contact.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return <main className="contact-page"><div className="contact-page-inner"><Link href="/f/inbox" className="back-link"><ArrowLeft size={15} /> Back to workspace</Link><div className="contact-intro"><div className="contact-logo"><UserRound size={20} /></div><div><span className="eyebrow">Codin Mail · Contacts</span><h1>Create contact</h1><p>Add a person to your shared communication directory.</p></div></div>{error && <div className="contact-error"><Alert variant="destructive"><ExclamationTriangleIcon className="h-4 w-4" /><AlertTitle>Contact not created</AlertTitle><AlertDescription>{error}</AlertDescription></Alert></div>}<form onSubmit={handleSubmit} className="contact-form"><section className="contact-section"><div className="contact-section-heading"><div><h2>Profile</h2><p>The details your team will use to identify this person.</p></div></div><div className="contact-grid"><ContactField label="First name" name="firstName" placeholder="Alex" icon={UserRound} defaultValue={formData.firstName} required /><ContactField label="Last name" name="lastName" placeholder="Morgan" icon={UserRound} defaultValue={formData.lastName} required /><ContactField label="Email address" name="email" type="email" placeholder="alex@company.com" icon={Mail} defaultValue={formData.email} required /><ContactField label="Phone" name="phone" type="tel" placeholder="+1 555 000 0000" icon={Phone} defaultValue={formData.phone} /></div></section><section className="contact-section"><div className="contact-section-heading"><div><h2>Work details</h2><p>Optional context for future conversations and follow-ups.</p></div></div><div className="contact-grid"><ContactField label="Company" name="company" placeholder="Company name" icon={Building2} defaultValue={formData.company} /><ContactField label="Job title" name="jobTitle" placeholder="Product designer" icon={UserRound} defaultValue={formData.jobTitle} /></div><label className="contact-notes"><span>Notes</span><textarea name="notes" placeholder="Additional notes..." defaultValue={formData.notes} onChange={handleChange} /></label></section><footer className="contact-footer"><button type="submit" className="contact-save" disabled={isSubmitting}><Save size={15} /> {isSubmitting ? 'Saving...' : 'Save contact'}</button><Link href="/contacts" className="contact-cancel"><X size={15} /> Cancel</Link></footer></form></div></main>;
}