import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../services/supabase/client';
import { CommunityDiscussion, DiscussionReply } from '../types/communityTypes';
import { INITIAL_COMMUNITY_DISCUSSIONS } from '../data/communityData';

export function useCommunityRealtime(user: any) {
  const [discussions, setDiscussions] = useState<CommunityDiscussion[]>(INITIAL_COMMUNITY_DISCUSSIONS);
  const [loading, setLoading] = useState(false);
  const [isRealtimeActive, setIsRealtimeActive] = useState(false);
  const channelRef = useRef<any>(null);

  // Map database row to CommunityDiscussion
  const mapRowToDiscussion = (row: any): CommunityDiscussion => {
    const isLiked = user?.id && Array.isArray(row.liked_by) ? row.liked_by.includes(user.id) : false;
    let mediaItems = [];
    if (row.media_url) {
      mediaItems.push({
        type: (row.media_type === 'video' ? 'video' : 'image') as 'image' | 'video',
        url: row.media_url,
      });
    }

    return {
      id: row.id,
      groupId: row.category,
      groupName: row.category || 'General',
      author: row.author_name || 'Anonymous',
      authorBadge: 'Member',
      avatarColor: '#16a34a',
      timeAgo: 'Just now',
      title: row.category ? `${row.category} Update` : 'Community Post',
      content: row.content,
      supportCount: row.likes_count || 0,
      userSupported: isLiked,
      commentCount: row.comments_count || 0,
      replies: [],
      tags: row.tags || [],
      media: mediaItems.length > 0 ? mediaItems : undefined,
    };
  };

  // Fetch initial posts from Supabase
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);

      if (!error && data && data.length > 0) {
        const remoteDiscussions = data.map(mapRowToDiscussion);
        // Combine remote with initial mock to keep rich experience
        setDiscussions(remoteDiscussions);
      }
    } catch (err) {
      console.warn('[useCommunityRealtime] Fetch failed, using cached/initial:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchPosts();

    // Subscribe to Supabase Realtime channel
    const channel = supabase
      .channel('public:community_posts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'community_posts' },
        (payload) => {
          const newDiscussion = mapRowToDiscussion(payload.new);
          setDiscussions((prev) => {
            if (prev.some((p) => p.id === newDiscussion.id)) return prev;
            return [newDiscussion, ...prev];
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'community_posts' },
        (payload) => {
          const updated = mapRowToDiscussion(payload.new);
          setDiscussions((prev) =>
            prev.map((d) => (d.id === updated.id ? { ...d, supportCount: updated.supportCount, content: updated.content } : d))
          );
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'community_posts' },
        (payload) => {
          setDiscussions((prev) => prev.filter((d) => d.id !== payload.old.id));
        }
      )
      .subscribe((status) => {
        setIsRealtimeActive(status === 'SUBSCRIBED');
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [fetchPosts]);

  // Create post with optimistic local update
  const createPost = async (content: string, category = 'General', media?: { url: string; type: 'image' | 'video' }) => {
    const tempId = `temp-${Date.now()}`;
    const authorName = user?.name || user?.email?.split('@')[0] || 'Nura Member';
    
    // Optimistic UI insert
    const optimisticDiscussion: CommunityDiscussion = {
      id: tempId,
      groupId: category,
      groupName: category,
      author: authorName,
      authorBadge: 'Member',
      avatarColor: '#16a34a',
      timeAgo: 'Just now',
      title: `${category} Update`,
      content,
      supportCount: 0,
      userSupported: false,
      commentCount: 0,
      replies: [],
      media: media ? [{ type: media.type, url: media.url }] : undefined,
    };

    setDiscussions((prev) => [optimisticDiscussion, ...prev]);

    try {
      if (user?.id && !user.id.startsWith('guest_')) {
        const { data, error } = await supabase
          .from('community_posts')
          .insert({
            user_id: user.id,
            author_name: authorName,
            content,
            category,
            media_url: media?.url || null,
            media_type: media?.type || 'none',
          })
          .select()
          .single();

        if (!error && data) {
          // Replace temp post with real post
          setDiscussions((prev) =>
            prev.map((d) => (d.id === tempId ? mapRowToDiscussion(data) : d))
          );
          return mapRowToDiscussion(data);
        }
      }
    } catch (err) {
      console.warn('[useCommunityRealtime] Error persisting post:', err);
    }

    return optimisticDiscussion;
  };

  // Toggle support/like
  const toggleSupport = async (discussionId: string) => {
    setDiscussions((prev) =>
      prev.map((d) => {
        if (d.id === discussionId) {
          const nextSupported = !d.userSupported;
          return {
            ...d,
            userSupported: nextSupported,
            supportCount: nextSupported ? d.supportCount + 1 : Math.max(0, d.supportCount - 1),
          };
        }
        return d;
      })
    );

    try {
      if (user?.id && !user.id.startsWith('guest_') && !discussionId.startsWith('temp-') && !discussionId.startsWith('disc-')) {
        // Increment or decrement on remote
        const current = discussions.find((d) => d.id === discussionId);
        const newCount = current?.userSupported ? Math.max(0, current.supportCount - 1) : (current?.supportCount || 0) + 1;
        await supabase
          .from('community_posts')
          .update({ likes_count: newCount })
          .eq('id', discussionId);
      }
    } catch (err) {
      console.warn('[useCommunityRealtime] Error updating like:', err);
    }
  };

  return {
    discussions,
    loading,
    isRealtimeActive,
    refreshPosts: fetchPosts,
    createPost,
    toggleSupport,
  };
}
