"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api, { Timeline, TimelineEvent } from "@/lib/api";

export default function DemoPage() {
  const [timeline, setTimeline] = useState<Timeline | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    loadDemoTimeline();
  }, []);

  const loadDemoTimeline = async () => {
    try {
      const data = await api.getDemoTimeline();
      setTimeline(data);
    } catch (err) {
      setError("Failed to load demo timeline");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryStyle = (category: string) => {
    const styles: Record<string, string> = {
      regional_center: "badge-rc",
      school: "badge-school",
      insurance: "badge-insurance",
      therapy: "badge-therapy",
      life_transition: "badge-life",
    };
    return styles[category] || "badge-rc";
  };

  const getPriorityDot = (priority: string) => {
    const colors: Record<string, string> = {
      urgent: "bg-red-500",
      high: "bg-amber-500",
      normal: "bg-blue-500",
      low: "bg-gray-400",
    };
    return colors[priority] || "bg-gray-400";
  };

  const formatCategory = (category: string) => {
    return category
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const filterEvents = (events: TimelineEvent[]) => {
    if (!activeCategory) return events;
    return events.filter((e) => e.category === activeCategory);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--muted)]">Loading demo timeline...</p>
        </div>
      </div>
    );
  }

  if (error || !timeline) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || "Failed to load"}</p>
          <Link href="/" className="btn btn-primary">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const allEvents = [
    ...timeline.overdue,
    ...timeline.due_soon,
    ...timeline.upcoming,
  ];

  const categories = [...new Set(allEvents.map((e) => e.category))];

  return (
    <div className="min-h-screen bg-[var(--background)] pb-nav">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[var(--background)] border-b border-[var(--border)] px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
          <h1 className="font-semibold">Demo Timeline</h1>
          <div className="w-6" />
        </div>
      </header>

      {/* Demo banner */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 px-4 py-3 text-center">
        <p className="text-sm text-indigo-700 dark:text-indigo-300">
          This is a sample timeline for "Alex" (age 4)
        </p>
      </div>

      {/* Category filters */}
      <div className="px-4 py-3 overflow-x-auto">
        <div className="flex gap-2 max-w-md mx-auto">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
              activeCategory === null
                ? "bg-[var(--color-primary)] text-white"
                : "bg-[var(--border)] text-[var(--muted)]"
            }`}
          >
            All ({allEvents.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? "bg-[var(--color-primary)] text-white"
                  : "bg-[var(--border)] text-[var(--muted)]"
              }`}
            >
              {formatCategory(cat)}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline sections */}
      <main className="px-4 py-4 max-w-md mx-auto">
        {/* Overdue */}
        {filterEvents(timeline.overdue).length > 0 && (
          <section className="mb-6">
            <h2 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              Overdue
            </h2>
            <div className="space-y-3">
              {filterEvents(timeline.overdue).map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  getCategoryStyle={getCategoryStyle}
                  getPriorityDot={getPriorityDot}
                  formatCategory={formatCategory}
                />
              ))}
            </div>
          </section>
        )}

        {/* Due Soon */}
        {filterEvents(timeline.due_soon).length > 0 && (
          <section className="mb-6">
            <h2 className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Due Soon (within 30 days)
            </h2>
            <div className="space-y-3">
              {filterEvents(timeline.due_soon).map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  getCategoryStyle={getCategoryStyle}
                  getPriorityDot={getPriorityDot}
                  formatCategory={formatCategory}
                />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming */}
        {filterEvents(timeline.upcoming).length > 0 && (
          <section className="mb-6">
            <h2 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Upcoming
            </h2>
            <div className="space-y-3">
              {filterEvents(timeline.upcoming).map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  getCategoryStyle={getCategoryStyle}
                  getPriorityDot={getPriorityDot}
                  formatCategory={formatCategory}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-[var(--card-bg)] border-t border-[var(--border)] p-4 safe-bottom">
        <div className="max-w-md mx-auto">
          <Link href="/onboarding" className="btn btn-primary w-full block text-center">
            Create My Timeline
          </Link>
        </div>
      </div>
    </div>
  );
}

function EventCard({
  event,
  getCategoryStyle,
  getPriorityDot,
  formatCategory,
}: {
  event: TimelineEvent;
  getCategoryStyle: (cat: string) => string;
  getPriorityDot: (priority: string) => string;
  formatCategory: (cat: string) => string;
}) {
  const [expanded, setExpanded] = useState(false);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "No date set";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div
      className={`card cursor-pointer transition-all priority-${event.priority}`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${getPriorityDot(
            event.priority
          )}`}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium">{event.title}</h3>
            <span className={`badge ${getCategoryStyle(event.category)}`}>
              {formatCategory(event.category)}
            </span>
          </div>
          <p className="text-sm text-[var(--muted)] mt-1">{event.description}</p>
          <p className="text-xs text-[var(--muted)] mt-2">
            {formatDate(event.due_date)}
          </p>

          {expanded && (
            <div className="mt-4 pt-4 border-t border-[var(--border)]">
              {event.action_items.length > 0 && (
                <div className="mb-3">
                  <h4 className="text-xs font-semibold uppercase text-[var(--muted)] mb-2">
                    Action Items
                  </h4>
                  <ul className="space-y-1">
                    {event.action_items.map((item, i) => (
                      <li
                        key={i}
                        className="text-sm flex items-start gap-2"
                      >
                        <span className="text-[var(--color-primary)]">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {event.resources.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase text-[var(--muted)] mb-2">
                    Resources
                  </h4>
                  <ul className="space-y-1">
                    {event.resources.map((resource, i) => (
                      <li key={i} className="text-sm text-[var(--color-primary)]">
                        {resource}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
