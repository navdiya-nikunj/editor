import { supabase, Section } from './supabase';

export const createSection = async (
  userId: string,
  type: 'text' | 'link' | 'file',
  title: string,
  content: string,
  fileUrl?: string
) => {
  const { data, error } = await supabase
    .from('sections')
    .insert({
      user_id: userId,
      type,
      title,
      content,
      file_url: fileUrl,
    })
    .select()
    .single();
  
  return { data, error };
};

export const getSections = async (userId: string) => {
  const { data, error } = await supabase
    .from('sections')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  return { data, error };
};

export const deleteSection = async (sectionId: string) => {
  const { error } = await supabase
    .from('sections')
    .delete()
    .eq('id', sectionId);
  
  return { error };
};

export const updateSection = async (
  sectionId: string,
  title: string,
  content: string
) => {
  const { data, error } = await supabase
    .from('sections')
    .update({ title, content, updated_at: new Date().toISOString() })
    .eq('id', sectionId)
    .select()
    .single();
  
  return { data, error };
};

export const uploadFile = async (userId: string, file: File) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('files')
    .upload(fileName, file);
  
  if (error) return { data: null, error };
  
  const { data: { publicUrl } } = supabase.storage
    .from('files')
    .getPublicUrl(fileName);
  
  return { data: publicUrl, error: null };
};

