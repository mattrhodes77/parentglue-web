"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api, { Timeline, TimelineEvent, ChildProfile, RegionalOffice, lookupOfficeByCounty } from "@/lib/api";
import { Phone, Mail, Globe, MapPin, Building2 } from "lucide-react";

export default function TimelinePage() {
  const [timeline, setTimeline] = useState<Timeline | null>(null);
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [regionalOffice, setRegionalOffice] = useState<RegionalOffice | null>(null);
  const [immediateActions, setImmediateActions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    loadTimeline();
  }, []);

  const loadTimeline = async () => {
    try {
      // Get profile from localStorage
      const storedProfile = localStorage.getItem("childProfile");
      const storedActions = localStorage.getItem("immediateActions");

      if (!storedProfile) {
        // No profile - redirect to onboarding
        window.location.href = "/onboarding";
        return;
      }

      const profileData = JSON.parse(storedProfile) as ChildProfile;
      setProfile(profileData);

      if (storedActions) {
        setImmediateActions(JSON.parse(storedActions));
      }

      // Generate timeline from API
      const timelineData = await api.generateTimeline(profileData);
      setTimeline(timelineData);

      // Fetch regional office based on profile location
      if (profileData.state && profileData.county) {
        const office = await lookupOfficeByCounty(profileData.state, profileData.county);
        setRegionalOffice(office);
      }
    } catch (err) {
      setError("Failed to load timeline");
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
          <p className="text-[var(--muted)]">Loading your timeline...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Link href="/onboarding" className="btn btn-primary">
            Start Over
          </Link>
        </div>
      </div>
    );
  }

  if (!timeline || !profile) {
    return null;
  }

  const allEvents = [
    ...timeline.overdue,
    ...timeline.due_soon,
    ...timeline.upcoming,
  ];

  const categories = [...new Set(allEvents.map((e) => e.category))];

  return (
    <div className="min-h-screen bg-[var(--background)] pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[var(--color-primary)] text-white px-4 py-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-lg font-semibold">{profile.name}'s Timeline</h1>
            <Link
              href="/resources"
              className="text-white/80 hover:text-white"
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
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </Link>
          </div>

          {/* Stats */}
          <div className="flex gap-4 text-sm">
            {timeline.overdue.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                <span>{timeline.overdue.length} overdue</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>{timeline.due_soon.length} due soon</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span>{timeline.upcoming.length} upcoming</span>
            </div>
          </div>
        </div>
      </header>

      {/* Next Action Card */}
      {timeline.next_action && (
        <div className="px-4 -mt-2">
          <div className="max-w-md mx-auto">
            <div className="card bg-white dark:bg-gray-800 shadow-lg border-l-4 border-[var(--color-primary)]">
              <div className="text-xs font-semibold uppercase text-[var(--color-primary)] mb-2">
                Next Priority
              </div>
              <h3 className="font-semibold">{timeline.next_action.title}</h3>
              <p className="text-sm text-[var(--muted)] mt-1">
                {timeline.next_action.description}
              </p>
              {timeline.next_action.due_date && (
                <p className="text-xs text-[var(--muted)] mt-2">
                  Due:{" "}
                  {new Date(timeline.next_action.due_date).toLocaleDateString(
                    "en-US",
                    { month: "short", day: "numeric" }
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Immediate Actions */}
      {immediateActions.length > 0 && (
        <div className="px-4 pt-4">
          <div className="max-w-md mx-auto">
            <div className="card bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
              <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                Immediate Actions
              </h3>
              <ul className="space-y-2">
                {immediateActions.map((action, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-amber-600 mt-0.5">→</span>
                    <span className="text-amber-900 dark:text-amber-100">
                      {action}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Regional Office Card */}
      {regionalOffice && (
        <div className="px-4 pt-4">
          <div className="max-w-md mx-auto">
            <div className="card bg-[var(--color-teal)]/5 border border-[var(--color-teal)]/20">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-teal)]/10 flex items-center justify-center flex-shrink-0">
                  <Building2 size={20} className="text-[var(--color-teal)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[var(--color-charcoal)]">
                    Your Regional Center
                  </h3>
                  <p className="text-sm font-medium text-[var(--color-teal-dark)]">
                    {regionalOffice.name}
                  </p>

                  <div className="mt-3 space-y-2">
                    {regionalOffice.address && (
                      <div className="flex items-start gap-2 text-sm text-[var(--color-charcoal-light)]">
                        <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                        <span>{regionalOffice.address}{regionalOffice.city ? `, ${regionalOffice.city}` : ''}</span>
                      </div>
                    )}
                    {regionalOffice.phone && (
                      <a
                        href={`tel:${regionalOffice.phone}`}
                        className="flex items-center gap-2 text-sm text-[var(--color-teal)] hover:text-[var(--color-teal-dark)]"
                      >
                        <Phone size={14} />
                        <span>{regionalOffice.phone}</span>
                      </a>
                    )}
                    {regionalOffice.email && (
                      <a
                        href={`mailto:${regionalOffice.email}`}
                        className="flex items-center gap-2 text-sm text-[var(--color-teal)] hover:text-[var(--color-teal-dark)]"
                      >
                        <Mail size={14} />
                        <span>{regionalOffice.email}</span>
                      </a>
                    )}
                    {regionalOffice.website && (
                      <a
                        href={regionalOffice.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-[var(--color-teal)] hover:text-[var(--color-teal-dark)]"
                      >
                        <Globe size={14} />
                        <span>Visit Website</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category filters */}
      <div className="px-4 py-4 overflow-x-auto">
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
      <main className="px-4 max-w-md mx-auto">
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

        {/* Completed */}
        {filterEvents(timeline.completed).length > 0 && (
          <section className="mb-6">
            <h2 className="text-sm font-semibold text-green-600 dark:text-green-400 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Completed
            </h2>
            <div className="space-y-3">
              {filterEvents(timeline.completed).map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  getCategoryStyle={getCategoryStyle}
                  getPriorityDot={getPriorityDot}
                  formatCategory={formatCategory}
                  completed
                />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Bottom navigation */}
      <nav className="mobile-nav">
        <Link href="/timeline" className="nav-item active">
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
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          Timeline
        </Link>
        <Link href="/resources" className="nav-item">
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
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          Resources
        </Link>
        <Link href="/profile" className="nav-item">
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
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          Profile
        </Link>
      </nav>
    </div>
  );
}

function EventCard({
  event,
  getCategoryStyle,
  getPriorityDot,
  formatCategory,
  completed = false,
}: {
  event: TimelineEvent;
  getCategoryStyle: (cat: string) => string;
  getPriorityDot: (priority: string) => string;
  formatCategory: (cat: string) => string;
  completed?: boolean;
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
      className={`card cursor-pointer transition-all ${
        completed ? "opacity-60" : ""
      } priority-${event.priority}`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${
            completed ? "bg-green-500" : getPriorityDot(event.priority)
          }`}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className={`font-medium ${completed ? "line-through" : ""}`}>
              {event.title}
            </h3>
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
                      <li key={i} className="text-sm flex items-start gap-2">
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
                      <li
                        key={i}
                        className="text-sm text-[var(--color-primary)]"
                      >
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
