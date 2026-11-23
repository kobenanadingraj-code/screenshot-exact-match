import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { workspaceSchema,validateWorkspace } from './workspace-schema';
import type { Json } from '@/integrations/supabase/types';
export const readWorkspace=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
 const {data,error}=await context.supabase.rpc('read_field_workspace');
 if(error) throw new Error(error.message);
 if(!data) throw new Error('Your profile could not be loaded. Please sign in again.');
 return workspaceSchema.parse(data);
});
export const saveWorkspace=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((data:unknown)=>validateWorkspace(workspaceSchema.parse(data))).handler(async({data,context})=>{
 const {data:revision,error}=await context.supabase.rpc('save_field_workspace',{snapshot:data as unknown as Json,expected_revision:data.revision});
 if(error) throw new Error(error.message);
 return {...data,revision};
});
