import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export function useCommunityRealtime(user) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isRealtimeActive, setIsRealtimeActive] = useState(false);
  const channelRef = useRef(null);

  const mapRowToPost = (row) => {
    const isLiked = user?.id && Array.isArray(row.liked_by) ? row.liked_by.includes(user.id) : false;
    return {
      id: row.id,
      userId: row.user_id,
      authorName: row.author_name || 'Anonymous',
      content: row.content,
      category: row.category || 'General',
      likesCount: row.likes_count || 0,
      commentsCount: row.comments_count || 0,
      userLiked: isLiked,
      mediaUrl: row.media_url || null,
      mediaType: row.media_type || 'none',
      createdAt: row.created_at || new Date().toISOString(),
    };
  };

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(40);

      if (!error && data) {
        setPosts(data.map(mapRowToPost));
      }
    } catch (err) {
      console.warn('[useCommunityRealtime Web] Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchPosts();

    const channel = supabase
      .channel('public:community_posts_web')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'community_posts' },
        (payload) => {
          const newPost = mapRowToPost(payload.new);
          setPosts((prev) => {
            if (prev.some((p) => p.id === newPost.id)) return prev;
            return [newPost, ...prev];
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'community_posts' },
        (payload) => {
          const updated = mapRowToPost(payload.new);
          setPosts((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)));
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'community_posts' },
        (payload) => {
          setPosts((prev) => prev.filter((p) => p.id !== payload.old.id));
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

  const createPost = async (content, category = 'General', media = null) => {
    const tempId = `temp-${Date.now()}`;
    const authorName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Nura Explorer';

    const optimisticPost = {
      id: tempId,
      userId: user?.id,
      authorName,
      content,
      category,
      likesCount: 0,
      commentsCount: 0,
      userLiked: false,
      mediaUrl: media?.url || null,
      mediaType: media?.type || 'none',
      createdAt: new Date().toISOString(),
    };

    setPosts((prev) => [optimisticPost, ...prev]);

    try {
      if (user?.id && !String(user.id).startsWith('guest_')) {
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
          setPosts((prev) => prev.map((p) => (p.id === tempId ? mapRowToPost(data) : p)));
          return mapRowToPost(data);
        }
      }
    } catch (err) {
      console.warn('[useCommunityRealtime Web] Error inserting post:', err);
    }
    return optimisticPost;
  };

  const toggleLike = async (postId) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const nextLiked = !p.userLiked;
          return {
            ...p,
            userLiked: nextLiked,
            likesCount: nextLiked ? p.likesCount + 1 : Math.max(0, p.likesCount - 1),
          };
        }
        return p;
      })
    );

    try {
      if (user?.id && !String(user.id).startsWith('guest_') && !postId.startsWith('temp-')) {
        const current = posts.find((p) => p.id === postId);
        const newCount = current?.userLiked ? Math.max(0, current.likesCount - 1) : (current?.likesCount || 0) + 1;
        await supabase
          .from('community_posts')
          .update({ likes_count: newCount })
          .eq('id', postId);
      }
    } catch (err) {
      console.warn('[useCommunityRealtime Web] Error updating like:', err);
    }
  };

  return {
    posts,
    loading,
    isRealtimeActive,
    refreshPosts: fetchPosts,
    createPost,
    toggleLike,
  };
}
