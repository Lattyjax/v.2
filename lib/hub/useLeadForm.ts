'use client';
import { useState } from 'react';
import { ensureLeadSessionId, getEventContext } from '@/lib/lead';

export type LeadFormData = {
  firstName?: string; lastName?: string; email?: string;
  phone?: string; county?: string; productInterest?: string; notes?: string;
};

export type LeadFormState =
  | { status: 'idle' } | { status: 'submitting' }
  | { status: 'success'; contactId: string; inquiryId: string }
  | { status: 'error'; message: string };

export function useLeadForm() {
  const [state, setState] = useState<LeadFormState>({ status: 'idle' });

  const submit = async (data: LeadFormData) => {
    setState({ status: 'submitting' });
    const context = getEventContext({ county: data.county, productInterest: data.productInterest });
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, ...context, leadSessionId: ensureLeadSessionId() }),
      });
      const result = await res.json();
      if (!res.ok || !result.ok) throw new Error(result.error ?? 'Submission failed');
      setState({ status: 'success', contactId: result.contactId, inquiryId: result.inquiryId });
      return result;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setState({ status: 'error', message });
      throw err;
    }
  };

  return { state, submit, reset: () => setState({ status: 'idle' }) };
}
