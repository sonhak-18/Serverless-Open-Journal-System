export const prerender = false;

import type { APIRoute } from 'astro';
import {
  updateDbEditorInChief,
  addDbEditorialMember,
  deleteDbEditorialMember,
  getDbEditorial,
} from '../../lib/db';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'update_eic') {
      await updateDbEditorInChief({
        name: body.name,
        affiliation: body.affiliation,
        email: body.email,
      });
    } else if (action === 'add_member') {
      await addDbEditorialMember({
        type: body.type,
        name: body.name,
        role: body.role,
        affiliation: body.affiliation,
      });
    } else if (action === 'delete_member') {
      await deleteDbEditorialMember(body.id);
    } else {
      return new Response(JSON.stringify({ success: false, error: 'Aksi tidak valid' }), { status: 400 });
    }

    const updated = await getDbEditorial();
    return new Response(JSON.stringify({ success: true, editorial: updated }), {
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
