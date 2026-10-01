import * as DocumentPicker from 'expo-document-picker';
import { supabase } from '../supabase/client';

export interface PickedMedia {
  uri: string;
  name: string;
  size?: number;
  mimeType?: string;
  type: 'image' | 'video';
}

/**
 * Pick image or video for community post
 */
export async function pickCommunityMedia(): Promise<PickedMedia | null> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['image/*', 'video/*'],
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    const isVideo = asset.mimeType?.startsWith('video/') || asset.name.endsWith('.mp4') || asset.name.endsWith('.mov');

    return {
      uri: asset.uri,
      name: asset.name,
      size: asset.size,
      mimeType: asset.mimeType,
      type: isVideo ? 'video' : 'image',
    };
  } catch (error) {
    console.warn('[mediaUpload] Media selection error:', error);
    return null;
  }
}

/**
 * Upload community media to Supabase Storage
 */
export async function uploadCommunityMedia(
  media: PickedMedia,
  userId: string
): Promise<string | null> {
  try {
    const fileExt = media.name.split('.').pop() || (media.type === 'video' ? 'mp4' : 'jpg');
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    const filePath = `posts/${fileName}`;

    // Read file as base64 or blob
    const response = await fetch(media.uri);
    const blob = await response.blob();

    const { data, error } = await supabase.storage
      .from('community-media')
      .upload(filePath, blob, {
        contentType: media.mimeType || (media.type === 'video' ? 'video/mp4' : 'image/jpeg'),
        upsert: false,
      });

    if (error) {
      console.warn('[mediaUpload] Storage upload warning:', error.message);
      // Fallback: return local uri if storage bucket not configured yet
      return media.uri;
    }

    const { data: publicUrlData } = supabase.storage
      .from('community-media')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl || media.uri;
  } catch (err) {
    console.warn('[mediaUpload] Upload failed, falling back to local uri:', err);
    return media.uri;
  }
}
