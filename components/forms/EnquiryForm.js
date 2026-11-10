import { useRef, useState } from 'react';
import Link from 'next/link';
import Icon from '../ui/Icon';
import { VENDOR_CATEGORIES, STALL_PREFERENCES, WINTER_CARNIVAL as E } from '@/lib/config/event';
import { CONTACT, whatsappLink } from '@/lib/config/site';
import { track, getSource } from '@/lib/analytics';
import { confetti } from '../ui/motion';
import f from './forms.module.css';

const EMPTY = {
  brandName: '', contactName: '', phone: '', email: '', instagram: '',
  category: '', description: '', stallPreference: '', requirements: '', consent: false, website: '',
};

// Mirrors the server rules in pages/api/enquiries.js for instant feedback.
function validate(v) {
  const e = {};
  if (v.brandName.trim().length < 2) e.brandName = 'Please enter your brand or business name.';
  if (v.contactName.trim().length < 2) e.contactName = 'Please enter the contact person’s name.';
  const digits = v.phone.replace(/\D/g, '').replace(/^(91|0)(?=\d{10}$)/, '');
  if (!/^[6-9]\d{9}$/.test(digits)) e.phone = 'Please enter a valid 10-digit Indian mobile number.';
  if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v.email.trim())) e.email = 'Please enter a valid email address.';
  if (v.instagram && !/^@?[A-Za-z0-9._]{1,30}$/.test(v.instagram.trim()) && !/instagram\.com\//i.test(v.instagram)) {
    e.instagram = 'That doesn’t look like an Instagram handle.';
  }
  if (!v.category) e.category = 'Please choose a category.';
  if (v.description.trim().length < 10) e.description = 'Tell us a little about what you sell (at least 10 characters).';
  if (!v.stallPreference) e.stallPreference = 'Please choose a stall preference.';
  if (!v.consent) e.consent = 'Please agree to be contacted about your enquiry.';
  return e;
}

function Field({ id, label, error, hint, required, children }) {
  return (
    <div className={`${f.field} ${error ? f.hasError : ''}`}>
      <label htmlFor={id} className={f.label}>
        {label} {required ? <span aria-hidden="true" className={f.req}>*</span> : <span className={f.optional}>(optional)</span>}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className={f.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className={f.errorText}>
          {error}
        </p>
      )}
    </div>
  );
}

export default function EnquiryForm() {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [serverMsg, setServerMsg] = useState('');
  const [result, setResult] = useState(null);
  const started = useRef(false);
  const inFlight = useRef(false); // blocks double submits before React re-renders
  const formRef = useRef(null);
  const successRef = useRef(null);

  const set = (name, value) => {
    if (!started.current) {
      started.current = true;
      track('enquiry_form_started');
    }
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }));
  };
  const onChange = (e) => set(e.target.name, e.target.type === 'checkbox' ? e.target.checked : e.target.value);
  const onBlur = (e) => {
    const msg = validate({ ...values })[e.target.name];
    if (msg && values[e.target.name] !== '') setErrors((x) => ({ ...x, [e.target.name]: msg }));
  };

  const aria = (id) => ({
    'aria-invalid': errors[id] ? true : undefined,
    'aria-describedby': errors[id] ? `${id}-error` : undefined,
  });

  async function onSubmit(e) {
    e.preventDefault();
    if (inFlight.current) return;
    const v = validate(values);
    setErrors(v);
    if (Object.keys(v).length) {
      const first = formRef.current?.querySelector(`[name="${Object.keys(v)[0]}"]`);
      first?.focus();
      setServerMsg('');
      return;
    }
    inFlight.current = true;
    setStatus('loading');
    setServerMsg('');
    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, source: getSource() }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (json.errors) setErrors(json.errors);
        throw new Error(json.message || 'Something went wrong.');
      }
      track('enquiry_submitted', { category: values.category });
      setResult({ ref: json.ref, brand: values.brandName, emailSent: json.emailSent, email: values.email });
      setStatus('success');
      setValues(EMPTY);
      requestAnimationFrame(() => successRef.current?.focus());
      confetti();
    } catch (err) {
      track('enquiry_failed');
      setStatus('error');
      setServerMsg(err.message);
    } finally {
      inFlight.current = false;
    }
  }

  if (status === 'success' && result) {
    const msg = `Hi Poppin! I just submitted a stall enquiry for ${result.brand} (ref ${result.ref}) for ${E.fullName}.`;
    return (
      <div className={f.success} ref={successRef} tabIndex={-1} role="status" aria-live="polite">
        <span className={f.successIcon}>
          <Icon name="check" size={30} />
        </span>
        <h2>Enquiry received — thank you!</h2>
        <p>
          We’ve got the details for <strong>{result.brand}</strong>. The Poppin team will review your enquiry and contact you with availability
          and stall details.
        </p>
        <p className={f.refBox}>
          <span>Your enquiry reference</span>
          <strong className="tabular">{result.ref}</strong>
        </p>
        <p className="muted">
          {result.emailSent ? `A confirmation has been sent to ${result.email}.` : 'Please note your reference — quote it when you call or message us.'} This
          is an enquiry, not a confirmed booking. Your stall is confirmed only once the team confirms it with you.
        </p>
        <div className="btn-row">
          <a href={whatsappLink(msg)} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp" onClick={() => track('contact_click', { method: 'whatsapp', location: 'enquiry_success' })}>
            <Icon name="whatsapp" /> Follow up on WhatsApp
          </a>
          <Link href="/winter-carnival" className="btn btn-outline">
            Back to the carnival
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form ref={formRef} className={f.form} onSubmit={onSubmit} noValidate aria-describedby="form-note">
      <p id="form-note" className={f.formNote}>
        Fields marked <span className={f.req}>*</span> are required.
      </p>

      <fieldset className={f.fieldset}>
        <legend className={f.legend}>
          <span>01</span> About your brand
        </legend>
        <div className={f.grid2}>
          <Field id="brandName" label="Brand / business name" required error={errors.brandName}>
            <input id="brandName" name="brandName" className={f.input} value={values.brandName} onChange={onChange} onBlur={onBlur} autoComplete="organization" maxLength={80} {...aria('brandName')} />
          </Field>
          <Field id="instagram" label="Instagram handle" error={errors.instagram} hint="e.g. @yourbrand">
            <input id="instagram" name="instagram" className={f.input} value={values.instagram} onChange={onChange} onBlur={onBlur} placeholder="@yourbrand" autoCapitalize="none" maxLength={80} {...aria('instagram')} />
          </Field>
          <Field id="category" label="Business category" required error={errors.category}>
            <select id="category" name="category" className={f.input} value={values.category} onChange={onChange} {...aria('category')}>
              <option value="">Choose a category</option>
              {VENDOR_CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field id="stallPreference" label="Preferred stall type" required error={errors.stallPreference}>
            <select id="stallPreference" name="stallPreference" className={f.input} value={values.stallPreference} onChange={onChange} {...aria('stallPreference')}>
              <option value="">Choose a preference</option>
              {STALL_PREFERENCES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field id="description" label="What do you sell?" required error={errors.description} hint="Your products or services, price range and anything that makes you special.">
          <textarea id="description" name="description" rows={4} className={f.input} value={values.description} onChange={onChange} onBlur={onBlur} maxLength={1000} {...aria('description')} />
        </Field>
      </fieldset>

      <fieldset className={f.fieldset}>
        <legend className={f.legend}>
          <span>02</span> Contact details
        </legend>
        <div className={f.grid2}>
          <Field id="contactName" label="Owner / contact person" required error={errors.contactName}>
            <input id="contactName" name="contactName" className={f.input} value={values.contactName} onChange={onChange} onBlur={onBlur} autoComplete="name" maxLength={80} {...aria('contactName')} />
          </Field>
          <Field id="phone" label="Phone number" required error={errors.phone} hint="10-digit mobile, preferably on WhatsApp">
            <input id="phone" name="phone" type="tel" inputMode="tel" className={f.input} value={values.phone} onChange={onChange} onBlur={onBlur} autoComplete="tel" placeholder="98xxxxxxxx" maxLength={16} {...aria('phone')} />
          </Field>
          <Field id="email" label="Email address" required error={errors.email}>
            <input id="email" name="email" type="email" inputMode="email" className={f.input} value={values.email} onChange={onChange} onBlur={onBlur} autoComplete="email" maxLength={160} {...aria('email')} />
          </Field>
        </div>
      </fieldset>

      <fieldset className={f.fieldset}>
        <legend className={f.legend}>
          <span>03</span> Anything else?
        </legend>
        <Field id="requirements" label="Additional requirements" hint="Space, power, table needs, sharing a stall, questions…">
          <textarea id="requirements" name="requirements" rows={3} className={f.input} value={values.requirements} onChange={onChange} maxLength={1000} />
        </Field>
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className={f.honeypot} aria-hidden="true" value={values.website} onChange={onChange} />
        <div className={`${f.field} ${errors.consent ? f.hasError : ''}`}>
          <label className={f.check}>
            <input type="checkbox" name="consent" checked={values.consent} onChange={onChange} {...aria('consent')} />
            <span>
              I agree to be contacted by the Poppin team by phone, WhatsApp or email about this enquiry. <span aria-hidden="true" className={f.req}>*</span>{' '}
              <Link href="/privacy" className="link">
                Privacy policy
              </Link>
            </span>
          </label>
          {errors.consent && (
            <p id="consent-error" className={f.errorText}>
              {errors.consent}
            </p>
          )}
        </div>
      </fieldset>

      {status === 'error' && serverMsg && (
        <div className={f.alert} role="alert">
          <strong>{serverMsg}</strong> You can also call{' '}
          <a href={`tel:${CONTACT.phoneE164}`} className="link">
            {CONTACT.phone}
          </a>
          .
        </div>
      )}

      <div className={f.submitRow}>
        <button type="submit" className="btn btn-primary btn-lg" disabled={status === 'loading'} aria-busy={status === 'loading'}>
          {status === 'loading' ? (
            <>
              <span className={f.spinner} aria-hidden="true" /> Sending enquiry…
            </>
          ) : (
            <>
              Send stall enquiry <Icon name="arrowRight" />
            </>
          )}
        </button>
        <p className={f.hint}>Submitting is an enquiry, not a confirmed booking. The team will confirm stalls directly.</p>
      </div>
    </form>
  );
}
