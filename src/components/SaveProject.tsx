import { useState } from 'react';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
export function SaveProject({kind,content}:{kind:string;content:Json}) {
 const [busy,setBusy]=useState(false);
 async function save(){setBusy(true);try {const {data:{user}}=await supabase.auth.getUser(); if(!user){toast.error('Sign in from the menu to save projects.');return;} const title=window.prompt('Project name',`My ${kind} project`);if(!title?.trim())return;const {error}=await supabase.from('projects').insert({user_id:user.id,title:title.trim(),kind,content});if(error)throw error;toast.success('Project saved');}catch{toast.error('Could not save your project. Please try again.');}finally{setBusy(false);}}
 return <Button variant="outline" onClick={save} disabled={busy}><Save/>{busy?'Saving…':'Save project'}</Button>;
}
