"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api, {
  LetterTemplate,
  LetterType,
  GeneratedLetter,
  ChildProfile,
  FieldHint,
} from "@/lib/api";

type Step = "select" | "customize" | "preview";

export default function LettersPage() {
  const [step, setStep] = useState<Step>("select");
  const [templates, setTemplates] = useState<LetterTemplate[]>([]);
  const [byCategory, setByCategory] = useState<Record<string, LetterTemplate[]>>({});
  const [selectedTemplate, setSelectedTemplate] = useState<LetterTemplate | null>(null);
  const [fieldHints, setFieldHints] = useState<Record<string, FieldHint>>({});
  const [generatedLetter, setGeneratedLetter] = useState<GeneratedLetter | null>(null);
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Form fields
  const [parentName, setParentName] = useState("");
  const [parentAddress, setParentAddress] = useState("");
  const [customFields, setCustomFields] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load templates
      const data = await api.getLetterTemplates();
      setTemplates(data.templates);
      setByCategory(data.by_category);

      // Load profile from localStorage
      const storedProfile = localStorage.getItem("childProfile");
      if (storedProfile) {
        setProfile(JSON.parse(storedProfile));
      }
    } catch (err) {
      console.error("Failed to load templates:", err);
    } finally {
      setLoading(false);
    }
  };

  const selectTemplate = async (template: LetterTemplate) => {
    setSelectedTemplate(template);
    setCustomFields({});

    // Load field hints for this template
    try {
      const details = await api.getLetterTemplate(template.type);
      setFieldHints(details.field_hints || {});
    } catch (err) {
      console.error("Failed to load template details:", err);
    }

    setStep("customize");
  };

  const generateLetter = async () => {
    if (!selectedTemplate || !profile) return;

    setGenerating(true);
    try {
      const letter = await api.generateLetter({
        letter_type: selectedTemplate.type as LetterType,
        profile,
        parent_name: parentName || "Parent/Guardian",
        parent_address: parentAddress || undefined,
        ...customFields,
      });
      setGeneratedLetter(letter);
      setStep("preview");
    } catch (err) {
      console.error("Failed to generate letter:", err);
      alert("Failed to generate letter. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedLetter) {
      navigator.clipboard.writeText(generatedLetter.content);
      alert("Letter copied to clipboard!");
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "school":
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
          </svg>
        );
      case "regional_center":
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21" />
          </svg>
        );
      case "insurance":
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getCategoryStyle = (category: string) => {
    switch (category) {
      case "school":
        return "icon-container school";
      case "regional_center":
        return "icon-container rc";
      case "insurance":
        return "icon-container insurance";
      default:
        return "icon-container";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--muted)]">Loading letter templates...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <h1 className="text-xl font-bold mb-2">Set Up Profile First</h1>
          <p className="text-[var(--muted)] mb-6">
            We need your child's profile to generate personalized letters.
          </p>
          <Link href="/onboarding" className="btn btn-primary">
            Get Started
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[var(--background)] border-b border-[var(--border)] px-4 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          {step === "select" ? (
            <Link href="/timeline" className="text-[var(--muted)]">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
          ) : (
            <button
              onClick={() => setStep(step === "preview" ? "customize" : "select")}
              className="text-[var(--muted)]"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <h1 className="font-semibold">
            {step === "select" && "Letter Templates"}
            {step === "customize" && selectedTemplate?.title}
            {step === "preview" && "Your Letter"}
          </h1>
          <div className="w-6" />
        </div>
      </header>

      {/* Step: Select Template */}
      {step === "select" && (
        <main className="px-4 py-6 max-w-md mx-auto">
          <p className="text-[var(--muted)] text-sm mb-6">
            Generate formal letters with proper legal language. Just fill in the details and copy.
          </p>

          {Object.entries(byCategory).map(([category, categoryTemplates]) => (
            <section key={category} className="mb-8">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)] mb-3">
                {category.replace("_", " ")}
              </h2>
              <div className="space-y-3">
                {categoryTemplates.map((template) => (
                  <button
                    key={template.type}
                    onClick={() => selectTemplate(template)}
                    className="w-full text-left card hover:border-[var(--color-primary)] transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className={getCategoryStyle(category)}>
                        {getCategoryIcon(category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[0.95rem]">{template.title}</h3>
                        <p className="text-sm text-[var(--muted)] mt-1">{template.description}</p>
                        <p className="text-xs text-[var(--color-primary)] mt-2 font-medium">
                          {template.urgency_note}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </main>
      )}

      {/* Step: Customize */}
      {step === "customize" && selectedTemplate && (
        <main className="px-4 py-6 max-w-md mx-auto">
          {/* Info banner */}
          <div className="card card-flat mb-6">
            <p className="text-sm text-[var(--muted)]">
              <strong>Legal basis:</strong> {selectedTemplate.legal_basis}
            </p>
          </div>

          <div className="space-y-4">
            {/* Parent Name */}
            <div>
              <label className="block text-sm font-medium mb-2">Your name</label>
              <input
                type="text"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="Enter your full name"
                className="input"
              />
            </div>

            {/* Parent Address */}
            <div>
              <label className="block text-sm font-medium mb-2">Your address (optional)</label>
              <textarea
                value={parentAddress}
                onChange={(e) => setParentAddress(e.target.value)}
                placeholder="123 Main St&#10;City, State ZIP"
                rows={3}
                className="input resize-none"
              />
            </div>

            {/* Dynamic fields based on template */}
            {Object.entries(fieldHints).map(([fieldName, hint]) => (
              <div key={fieldName}>
                <label className="block text-sm font-medium mb-2">
                  {hint.label}
                  {hint.required && <span className="text-[var(--color-danger)]"> *</span>}
                </label>
                <textarea
                  value={customFields[fieldName] || ""}
                  onChange={(e) =>
                    setCustomFields((prev) => ({ ...prev, [fieldName]: e.target.value }))
                  }
                  placeholder={hint.placeholder}
                  rows={4}
                  className="input resize-none"
                />
              </div>
            ))}

            {/* Child info preview */}
            <div className="card card-flat">
              <p className="text-xs font-semibold uppercase text-[var(--muted)] mb-2">
                Letter will include
              </p>
              <p className="text-sm">
                <strong>Child:</strong> {profile.name}
              </p>
              <p className="text-sm">
                <strong>DOB:</strong> {new Date(profile.date_of_birth).toLocaleDateString()}
              </p>
              <p className="text-sm">
                <strong>County:</strong> {profile.county}
              </p>
            </div>
          </div>

          {/* Generate button */}
          <div className="mt-8">
            <button
              onClick={generateLetter}
              disabled={generating || !parentName}
              className="btn btn-primary w-full disabled:opacity-50"
            >
              {generating ? "Generating..." : "Generate Letter"}
            </button>
          </div>
        </main>
      )}

      {/* Step: Preview */}
      {step === "preview" && generatedLetter && (
        <main className="px-4 py-6 max-w-md mx-auto">
          {/* Instructions banner */}
          <div className="card bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 mb-4">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Next step:</strong> {generatedLetter.instructions}
            </p>
          </div>

          {/* Letter content */}
          <div className="card">
            <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed overflow-x-auto">
              {generatedLetter.content}
            </pre>
          </div>

          {/* Actions */}
          <div className="mt-6 space-y-3">
            <button onClick={copyToClipboard} className="btn btn-primary w-full">
              Copy to Clipboard
            </button>
            <button
              onClick={() => {
                setStep("customize");
              }}
              className="btn btn-secondary w-full"
            >
              Edit & Regenerate
            </button>
            <button
              onClick={() => {
                setStep("select");
                setSelectedTemplate(null);
                setGeneratedLetter(null);
              }}
              className="btn btn-secondary w-full"
            >
              Generate Different Letter
            </button>
          </div>
        </main>
      )}

      {/* Bottom navigation */}
      <nav className="mobile-nav">
        <Link href="/timeline" className="nav-item">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Timeline
        </Link>
        <Link href="/letters" className="nav-item active">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Letters
        </Link>
        <Link href="/resources" className="nav-item">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          Resources
        </Link>
      </nav>
    </div>
  );
}
