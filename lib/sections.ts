import { supabase, Document, FileRecord } from './supabase';

export const getOrCreateDocument = async (userId: string) => {
  // First, try to get existing document
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (data) {
    return { data, error: null };
  }
  
  // If doesn't exist, create new document
  const { data: newDoc, error: createError } = await supabase
    .from('documents')
    .insert({
      user_id: userId,
      content: '',
    })
    .select()
    .single();
  
  return { data: newDoc, error: createError };
};

export const updateDocument = async (userId: string, content: string) => {
  const { data, error } = await supabase
    .from('documents')
    .update({ content })
    .eq('user_id', userId)
    .select()
    .single();
  
  return { data, error };
};

export const subscribeToDocument = (
  userId: string,
  callback: (payload: any) => void
) => {
  const channel = supabase
    .channel('document-changes')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'documents',
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
    .subscribe();
  
  return channel;
};

// File operations
export const uploadFile = async (userId: string, file: File) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}-${file.name}`;
  
  // Upload to storage
  const { error: uploadError } = await supabase.storage
    .from('files')
    .upload(fileName, file);
  
  if (uploadError) return { data: null, error: uploadError };
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('files')
    .getPublicUrl(fileName);
  
  console.log('publicUrl', publicUrl);
  
  // Save metadata to database
  const { data, error } = await supabase
    .from('files')
    .insert({
      user_id: userId,
      name: file.name,
      size: file.size,
      file_url: publicUrl,
    })
    .select()
    .single();
  
  return { data, error };
};

export const getFiles = async (userId: string) => {
  const { data, error } = await supabase
    .from('files')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  return { data, error };
};

export const deleteFile = async (fileId: string, fileUrl: string, userId: string) => {
  // Extract file path from URL
  const urlParts = fileUrl.split('/files/');
  const filePath = urlParts[urlParts.length - 1];
  
  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from('files')
    .remove([filePath]);
  
  if (storageError) return { error: storageError };
  
  // Delete metadata from database
  const { error } = await supabase
    .from('files')
    .delete()
    .eq('id', fileId);
  
  return { error };
};

export const subscribeToFiles = (
  userId: string,
  callback: (payload: any) => void
) => {
  const channel = supabase
    .channel('files-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'files',
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
    .subscribe();
  
  return channel;
};

