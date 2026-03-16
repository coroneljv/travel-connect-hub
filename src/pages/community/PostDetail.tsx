import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Share2,
  MapPin,
  Send,
  Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function PostDetail() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  useEffect(() => {
    if (!postId) return;
    fetchPost();
    fetchComments();
    checkIfLiked();
  }, [postId]);

  const fetchPost = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("community_posts")
      .select("*, profiles!community_posts_author_id_fkey(full_name, avatar_url), post_likes(count)")
      .eq("id", postId!)
      .single();

    if (error) {
      toast.error("Publicação não encontrada.");
      navigate("/community");
      return;
    }
    setPost(data);
    setLikesCount(data.post_likes?.[0]?.count ?? data.likes_count ?? 0);
    setLoading(false);
  };

  const fetchComments = async () => {
    setLoadingComments(true);
    const { data } = await supabase
      .from("post_comments")
      .select("*, profiles!post_comments_author_id_fkey(full_name, avatar_url)")
      .eq("post_id", postId!)
      .order("created_at", { ascending: true });

    setComments(data || []);
    setLoadingComments(false);
  };

  const checkIfLiked = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("post_likes")
      .select("id")
      .eq("post_id", postId!)
      .eq("user_id", user.id)
      .maybeSingle();
    if (data) setLiked(true);
  };

  const handleLike = async () => {
    if (!user) return;

    if (liked) {
      const { error } = await supabase
        .from("post_likes")
        .delete()
        .eq("post_id", postId!)
        .eq("user_id", user.id);
      if (!error) {
        setLiked(false);
        setLikesCount((c) => Math.max(0, c - 1));
      }
    } else {
      const { error } = await supabase
        .from("post_likes")
        .insert({ post_id: postId!, user_id: user.id });
      if (!error) {
        setLiked(true);
        setLikesCount((c) => c + 1);
      }
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !user) return;

    const { error } = await supabase
      .from("post_comments")
      .insert({
        post_id: postId!,
        author_id: user.id,
        content: commentText.trim(),
      });

    if (error) {
      toast.error("Erro ao enviar comentário.");
      return;
    }

    setCommentText("");
    await fetchComments();
    toast.success("Comentário enviado!");
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.profiles?.full_name
            ? `Post de ${post.profiles.full_name}`
            : "Post na TravelConnect",
          text: post?.content?.slice(0, 100) || "",
          url,
        });
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-gray flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    );
  }

  if (!post) return null;

  const authorAvatar = post.profiles?.avatar_url ? (
    <img
      src={post.profiles.avatar_url}
      alt=""
      referrerPolicy="no-referrer"
      className="w-[49px] h-[49px] rounded-full object-cover shrink-0"
    />
  ) : (
    <div className="w-[49px] h-[49px] rounded-full bg-rose-100 flex items-center justify-center text-rose-500 font-bold text-base shrink-0">
      {post.profiles?.full_name?.[0]?.toUpperCase() || "?"}
    </div>
  );

  return (
    <div className="min-h-screen bg-warm-gray">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-[#4a5565] hover:text-[#1e2939] transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>

        {/* Post card */}
        <div className="bg-white border border-border rounded-[10px] overflow-hidden">
          {/* Header + Text */}
          <div className="border-b border-gray-200 p-4 space-y-4">
            <div className="flex items-center gap-3">
              {authorAvatar}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-medium text-[#1e2939]">
                    {post.profiles?.full_name || "Usuário"}
                  </span>
                </div>
                {post.location && (
                  <p className="text-[10px] text-[#6a7282] flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3 shrink-0" />
                    {post.location}
                  </p>
                )}
                <p className="text-[10px] text-[#6a7282] mt-0.5">
                  {new Date(post.created_at).toLocaleDateString("pt-BR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            {post.content && (
              <p className="text-base text-[#364153] leading-normal whitespace-pre-line">
                {post.content}
              </p>
            )}
          </div>

          {/* Full image — no crop, full view */}
          {post.image_url && (
            <div className="w-full bg-gray-50">
              <img
                src={post.image_url}
                alt=""
                className="w-full h-auto max-h-[80vh] object-contain mx-auto"
              />
            </div>
          )}

          {/* Hashtags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex items-center gap-4 px-4 py-2.5 text-sm text-[#155dfc]">
              {post.tags.map((tag: string, i: number) => (
                <span key={i}>#{tag}</span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-gray-200 flex items-center justify-between px-4 h-[57px]">
            <div className="flex items-center gap-4">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 transition-colors ${liked ? "text-rose-500" : "text-[#4a5565] hover:text-rose-500"}`}
              >
                <Heart className={`h-[18px] w-[18px] ${liked ? "fill-rose-500" : ""}`} />
                <span className="text-base">{likesCount}</span>
              </button>
              <button className="flex items-center gap-2 text-[#4a5565] hover:text-navy-500 transition-colors">
                <MessageCircle className="h-[18px] w-[18px]" />
                <span className="text-base">{comments.length}</span>
              </button>
            </div>
            <button
              onClick={handleShare}
              className="text-[#4a5565] hover:text-navy-500 transition-colors"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Comments section */}
        <div className="bg-white border border-border rounded-[10px] overflow-hidden mt-4">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-medium text-[#1e2939]">
              Comentários ({comments.length})
            </h3>
          </div>

          {/* Comment input */}
          {user && (
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 font-bold text-xs shrink-0">
                  {profile?.full_name?.[0]?.toUpperCase() || "?"}
                </div>
              )}
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmitComment()}
                placeholder="Escreva um comentário..."
                className="flex-1 px-3 py-2 rounded-lg border border-border bg-white text-sm text-[#1e2939] placeholder:text-[#6a7282] focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500"
              />
              <button
                onClick={handleSubmitComment}
                disabled={!commentText.trim()}
                className="p-2 rounded-full bg-navy-500 text-white hover:bg-navy-600 transition-colors disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Comments list */}
          {loadingComments && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-rose-500" />
            </div>
          )}

          {!loadingComments && comments.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-[#6a7282]">
                Nenhum comentário ainda. Seja o primeiro!
              </p>
            </div>
          )}

          {comments.map((comment) => (
            <div
              key={comment.id}
              className="flex gap-3 px-4 py-3 border-b border-gray-100 last:border-b-0"
            >
              {comment.profiles?.avatar_url ? (
                <img
                  src={comment.profiles.avatar_url}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 font-bold text-xs shrink-0">
                  {comment.profiles?.full_name?.[0]?.toUpperCase() || "?"}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[#1e2939]">
                    {comment.profiles?.full_name || "Usuário"}
                  </span>
                  <span className="text-[10px] text-[#6a7282]">
                    {new Date(comment.created_at).toLocaleDateString("pt-BR", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
                <p className="text-sm text-[#364153] mt-0.5">
                  {comment.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
