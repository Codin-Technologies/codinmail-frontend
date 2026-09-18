'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { createContactAction } from '@/lib/db/actions';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { ArrowLeft, Building2, Mail, Phone, Save, UserRound } from 'lucide-react';
import Link from 'next/link';
import { useActionState } from 'react';

const initialState = {
  error: '',
  previous: { firstName: '', lastName: '', email: '', company: '', jobTitle: '', phone: '', notes: '' },
};

function ContactField({ label, name, placeholder, type = 'text', icon: Icon, defaultValue, required = false }: { label: string; name: string; placeholder: string; type?: string; icon: typeof Mail; defaultValue?: string; required?: boolean }) {
  return <label className="contact-field"><span>{label}{required && <b aria-hidden="true">*</b>}</span><div className="contact-input"><Icon size={16} aria-hidden="true" /><input name={name} type={type} placeholder={placeholder} defaultValue={defaultValue} required={required} /></div></label>;
}

export default function NewContactPage() {
  const [state, formAction, pending] = useActionState(createContactAction, initialState);

  return <main className="contact-page"><div className="contact-page-inner"><Link href="/f/inbox" className="back-link"><ArrowLeft size={15} /> Back to workspace</Link><div className="contact-intro"><div className="contact-logo"><UserRound size={20} /></div><div><span className="eyebrow">Codin Mail · Contacts</span><h1>Create contact</h1><p>Add a person to your shared communication directory.</p></div></div>{state.error && <div className="contact-error"><Alert variant="destructive"><ExclamationTriangleIcon className="h-4 w-4" /><AlertTitle>Contact not created</AlertTitle><AlertDescription>{state.error}</AlertDescription></Alert></div>}<form action={formAction} className="contact-form"><section className="contact-section"><div className="contact-section-heading"><div><h2>Profile</h2><p>The details your team will use to identify this person.</p></div></div><div className="contact-grid"><ContactField label="First name" name="firstName" placeholder="Alex" icon={UserRound} defaultValue={state.previous.firstName} required /><ContactField label="Last name" name="lastName" placeholder="Morgan" icon={UserRound} defaultValue={state.previous.lastName} required /><ContactField label="Email address" name="email" type="email" placeholder="alex@company.com" icon={Mail} defaultValue={state.previous.email} required /><ContactField label="Phone" name="phone" type="tel" placeholder="+1 555 000 0000" icon={Phone} defaultValue={state.previous.phone} /></div></section><section className="contact-section"><div className="contact-section-heading"><div><h2>Work details</h2><p>Optional context for future conversations and follow-ups.</p></div></div><div className="contact-grid"><ContactField label="Company" name="company" placeholder="Company name" icon={Building2} defaultValue={state.previous.company} /><ContactField label="Job title" name="jobTitle" placeholder="Product designer" icon={UserRound} defaultValue={state.previous.jobTitle} /></div><label className="contact-notes"><span>Notes</span><textarea name="notes" placeholder="Add a note about this contact..." defaultValue={state.previous.notes} /></label></section><footer className="contact-actions"><Link href="/f/inbox" className="contact-cancel">Cancel</Link><button type="submit" className="primary-action" disabled={pending}><Save size={15} />{pending ? 'Saving...' : 'Save contact'}</button></footer></form></div></main>;
}