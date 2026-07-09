"use client";

import { useMemo, useState } from "react";
import { MessageSquare, Megaphone, ShoppingCart, Clock } from "lucide-react";
import { Card, CardHeader, StatCard, Badge, IconTile, Pills, MultiSelect, passesFilter, FilterRow , DateRangeBar } from "@/components/ui";
import { cx } from "@/lib/format";
import { SOCIAL_ADS, SOCIAL_COMMENTS, SocialComment, commentsSummary } from "@/lib/data";

type SentFilter = "all" | "positive" | "negative" | "neutral" | "intent";

export default function SocialCommentsPage() {
  const summary = commentsSummary();
  const [sentiment, setSentiment] = useState<SentFilter>("intent");
  const [ads, setAds] = useState<Set<string>>(new Set());
  const [platforms, setPlatforms] = useState<Set<string>>(new Set());

  const comments = useMemo(() => {
    return SOCIAL_COMMENTS.filter((c) => {
      if (!passesFilter(ads, c.ad)) return false;
      if (!passesFilter(platforms, c.platform)) return false;
      if (sentiment === "intent") return c.purchaseIntent;
      if (sentiment !== "all") return c.sentiment === sentiment;
      return true;
    }).sort((a, b) => {
      // Unanswered purchase-intent first, oldest first
      const aScore = (a.purchaseIntent && !a.answered ? 1000 : 0) + a.ageHours;
      const bScore = (b.purchaseIntent && !b.answered ? 1000 : 0) + b.ageHours;
      return bScore - aScore;
    });
  }, [sentiment, ads, platforms]);

  const oldestUnanswered = SOCIAL_COMMENTS.filter((c) => c.purchaseIntent && !c.answered).sort((a, b) => b.ageHours - a.ageHours)[0];

  return (
    <div className="space-y-6">
      <DateRangeBar />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Positive comments" value={`${summary.positive}`} tone="ok" />
        <StatCard label="Negative comments" value={`${summary.negative}`} tone="danger" />
        <StatCard label="Purchase-intent comments" value={`${summary.intent}`} />
        <StatCard label="Unanswered intent (act now)" value={`${summary.unansweredIntent}`} tone="danger" />
      </div>

      {oldestUnanswered && (
        <Card className="border-[var(--accent)]/40 bg-[var(--accent)]/5">
          <div className="flex items-start gap-3">
            <IconTile icon={<ShoppingCart size={18} />} tone="accent" />
            <div className="text-sm">
              <div className="font-medium mb-0.5">Reply to this first — {oldestUnanswered.ageHours}h old, still unanswered</div>
              <p className="text-[var(--muted)] text-xs">
                <span className="text-[var(--foreground)]">@{oldestUnanswered.author}</span> on <span className="text-[var(--foreground)]">{oldestUnanswered.ad}</span>: “{oldestUnanswered.text}” — a 30-second reply likely converts this buyer.
              </p>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <FilterRow>
          <MultiSelect label="Ad" icon={<Megaphone size={12} />} selected={ads} onChange={setAds} options={SOCIAL_ADS.map((a) => ({ value: a, label: a.split(" – ")[0] }))} />
          <MultiSelect label="Platform" selected={platforms} onChange={setPlatforms} options={[{ value: "Instagram", label: "Instagram" }, { value: "Facebook", label: "Facebook" }]} />
        </FilterRow>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <CardHeader title="Comment triage" subtitle={`${comments.length} comments · AI sentiment (Claude Haiku) across English, Hindi & Hinglish`} />
          <Pills
            options={[
              { value: "intent", label: "Purchase intent" },
              { value: "all", label: "All" },
              { value: "positive", label: "Positive" },
              { value: "negative", label: "Negative" },
              { value: "neutral", label: "Neutral" },
            ]}
            value={sentiment}
            onChange={(v) => setSentiment(v as SentFilter)}
          />
        </div>

        <div className="space-y-2.5">
          {comments.map((c) => (
            <CommentRow key={c.id} comment={c} />
          ))}
          {comments.length === 0 && <p className="text-sm text-[var(--muted)] py-6 text-center">No comments match this filter.</p>}
        </div>
      </Card>
    </div>
  );
}

function CommentRow({ comment: c }: { comment: SocialComment }) {
  const urgent = c.purchaseIntent && !c.answered;
  return (
    <div className={cx("rounded-xl border p-4", urgent ? "border-[var(--accent)]/40 bg-[var(--accent)]/5" : "border-[var(--border)] bg-[var(--surface-2)]")}>
      <div className="flex items-start gap-3">
        <IconTile icon={<MessageSquare size={15} />} tone={c.sentiment === "positive" ? "ok" : c.sentiment === "negative" ? "danger" : "default"} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-sm font-medium">@{c.author}</span>
            <Badge tone={c.sentiment}>{c.sentiment}</Badge>
            {c.purchaseIntent && <Badge tone="new-launch">purchase intent</Badge>}
            <span className="text-[10px] text-[var(--muted)]">{c.language}</span>
          </div>
          <p className="text-sm">{c.text}</p>
          <div className="flex items-center gap-3 text-[11px] text-[var(--muted)] mt-1.5">
            <span>{c.platform} · {c.ad}</span>
            <span className="flex items-center gap-1"><Clock size={10} /> {c.ageHours}h ago</span>
            {c.answered ? <span className="text-[var(--ok)]">Replied</span> : <span className="text-[var(--warning)]">awaiting reply</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
