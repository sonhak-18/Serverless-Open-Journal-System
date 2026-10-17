export const prerender = false;

import type { APIRoute } from 'astro';
import {
  getDbIssues,
  addDbIssue,
  deleteDbIssue,
  setCurrentDbIssue,
  updateDbSettings,
  getDbSettings,
} from '../../lib/db';
import { invalidateJournalCache } from '../../lib/kv';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const d1 = (locals as any)?.runtime?.env?.DB;
    const kv = (locals as any)?.runtime?.env?.KV;

    const body = await request.json();
    const { action } = body;

    if (action === 'add') {
      const newIssue = {
        id: body.id || `issue-${Date.now()}`,
        volume: Number(body.volume),
        issue: Number(body.issue),
        year: Number(body.year),
        period: body.period || '',
        theme: body.theme || '',
        coverUrl: body.coverUrl || '',
        description: body.description || '',
        publishDate: body.publishDate || new Date().toISOString().split('T')[0],
        isCurrent: Boolean(body.isCurrent),
      };
      await addDbIssue(newIssue, d1);
      if (newIssue.isCurrent) {
        await updateDbSettings({ hasActiveIssue: true }, d1);
      }
    } else if (action === 'delete') {
      await deleteDbIssue(body.id, d1);
    } else if (action === 'set_current') {
      await setCurrentDbIssue(body.id, d1);
      await updateDbSettings({ hasActiveIssue: true }, d1);
    } else if (action === 'toggle_active') {
      await updateDbSettings({ hasActiveIssue: Boolean(body.hasActiveIssue) }, d1);
    } else {
      return new Response(JSON.stringify({ success: false, error: 'Aksi tidak valid' }), { status: 400 });
    }

    await invalidateJournalCache(kv);

    const issues = await getDbIssues(d1);
    const settings = await getDbSettings(d1);

    return new Response(JSON.stringify({ success: true, issues, settings }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
