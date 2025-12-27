"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  US_STATES,
  getCountiesForState,
  lookupOfficeByCounty,
  type County,
  type RegionalOffice,
  type DiagnosisStatus,
} from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Step = 1 | 2 | 3;

type RegionalCenterStatus =
  | "not_connected"
  | "intake_pending"
  | "in_evaluation"
  | "eligible"
  | "not_eligible";

type SchoolStatus =
  | "not_school_age"
  | "no_iep"
  | "evaluation_pending"
  | "has_iep";

type InsuranceType =
  | "private_fully_insured"
  | "private_self_funded"
  | "medi_cal"
  | "regional_center_only"
  | "none";

interface FormData {
  // Step 1
  name: string;
  date_of_birth: string;
  state: string;
  county: string;
  // Step 2
  diagnosis_status: DiagnosisStatus;
  diagnosis_date: string;
  // Step 3
  rc_status: RegionalCenterStatus;
  school_status: SchoolStatus;
  insurance_type: InsuranceType;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dynamic location data
  const [counties, setCounties] = useState<County[]>([]);
  const [loadingCounties, setLoadingCounties] = useState(false);
  const [regionalOffice, setRegionalOffice] = useState<RegionalOffice | null>(null);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    date_of_birth: "",
    state: "",
    county: "",
    diagnosis_status: "diagnosed",
    diagnosis_date: "",
    rc_status: "not_connected",
    school_status: "not_school_age",
    insurance_type: "private_fully_insured",
  });

  // Fetch counties when state changes
  useEffect(() => {
    if (formData.state) {
      setLoadingCounties(true);
      setCounties([]);
      setFormData((prev) => ({ ...prev, county: "" }));
      setRegionalOffice(null);

      getCountiesForState(formData.state)
        .then((data) => {
          setCounties(data.counties || []);
        })
        .catch((err) => {
          console.error("Failed to fetch counties:", err);
          setCounties([]);
        })
        .finally(() => {
          setLoadingCounties(false);
        });
    }
  }, [formData.state]);

  // Fetch regional office when county changes
  useEffect(() => {
    if (formData.state && formData.county) {
      lookupOfficeByCounty(formData.state, formData.county)
        .then((office) => {
          setRegionalOffice(office);
        })
        .catch(() => {
          setRegionalOffice(null);
        });
    }
  }, [formData.state, formData.county]);

  const updateForm = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleNext = async () => {
    if (step < 3) {
      setStep((step + 1) as Step);
    } else {
      await handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as Step);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Build profile object
      const profile = {
        name: formData.name,
        date_of_birth: formData.date_of_birth,
        state: formData.state,
        county: formData.county,
        regional_office_id: regionalOffice?.id,
        diagnosis_status: formData.diagnosis_status,
        diagnosis_date: formData.diagnosis_date || undefined,
        rc_status: formData.rc_status,
        school_status: formData.school_status,
        insurance_type: formData.insurance_type,
      };

      // Store profile in localStorage
      localStorage.setItem("childProfile", JSON.stringify(profile));

      // Store regional office info if available
      if (regionalOffice) {
        localStorage.setItem("regionalOffice", JSON.stringify(regionalOffice));
      }

      router.push("/timeline");
    } catch (err) {
      setError("Something went wrong. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isStep1Valid = formData.name && formData.date_of_birth && formData.state && formData.county;

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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </Link>
          <div className="text-sm font-medium">Step {step} of 3</div>
          <div className="w-6" />
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-1 bg-[var(--border)]">
        <div
          className="h-full bg-[var(--color-primary)] transition-all duration-300"
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>

      {/* Form content */}
      <main className="px-4 py-6 max-w-md mx-auto">
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">Let&apos;s get started</h1>
              <p className="text-[var(--muted)]">
                Tell us about your child so we can personalize their timeline.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Child&apos;s first name
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateForm("name", e.target.value)}
                  placeholder="Enter name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Date of birth
                </label>
                <Input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => updateForm("date_of_birth", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">State</label>
                <Select
                  value={formData.state}
                  onValueChange={(value) => updateForm("state", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your state" />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">County</label>
                <Select
                  value={formData.county}
                  onValueChange={(value) => updateForm("county", value)}
                  disabled={!formData.state || loadingCounties}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        loadingCounties
                          ? "Loading counties..."
                          : !formData.state
                            ? "Select a state first"
                            : "Select your county"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {counties.map((c) => (
                      <SelectItem key={c.name} value={c.name}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Regional Office Card */}
              {regionalOffice && (
                <Card className="p-4 bg-[var(--color-primary)]/5 border-[var(--color-primary)]/20">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--color-primary)]">
                        Your Regional Office
                      </p>
                      <p className="font-semibold">{regionalOffice.name}</p>
                      {regionalOffice.phone && (
                        <p className="text-sm text-[var(--muted)]">
                          {regionalOffice.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">Diagnosis status</h1>
              <p className="text-[var(--muted)]">
                Where are you in the diagnosis journey?
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  value: "not_started" as DiagnosisStatus,
                  label: "Suspecting autism",
                  desc: "Haven't started evaluation yet",
                },
                {
                  value: "in_progress" as DiagnosisStatus,
                  label: "In evaluation",
                  desc: "Currently being assessed",
                },
                {
                  value: "diagnosed" as DiagnosisStatus,
                  label: "Autism diagnosed",
                  desc: "Have an official diagnosis",
                },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => updateForm("diagnosis_status", option.value)}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    formData.diagnosis_status === option.value
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                      : "border-[var(--border)] hover:border-[var(--color-primary)]/50"
                  }`}
                >
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm text-[var(--muted)]">
                    {option.desc}
                  </div>
                </button>
              ))}
            </div>

            {formData.diagnosis_status === "diagnosed" && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Diagnosis date (optional)
                </label>
                <Input
                  type="date"
                  value={formData.diagnosis_date}
                  onChange={(e) => updateForm("diagnosis_date", e.target.value)}
                />
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">Current services</h1>
              <p className="text-[var(--muted)]">
                Help us understand what support you already have.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Regional Center status
              </label>
              <Select
                value={formData.rc_status}
                onValueChange={(value) => updateForm("rc_status", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_connected">Not connected yet</SelectItem>
                  <SelectItem value="intake_pending">Intake scheduled/pending</SelectItem>
                  <SelectItem value="in_evaluation">Being evaluated</SelectItem>
                  <SelectItem value="eligible">Eligible & receiving services</SelectItem>
                  <SelectItem value="not_eligible">Not eligible</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                School/IEP status
              </label>
              <Select
                value={formData.school_status}
                onValueChange={(value) => updateForm("school_status", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_school_age">Not school age yet</SelectItem>
                  <SelectItem value="no_iep">In school, no IEP</SelectItem>
                  <SelectItem value="evaluation_pending">IEP evaluation pending</SelectItem>
                  <SelectItem value="has_iep">Has IEP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Insurance</label>
              <Select
                value={formData.insurance_type}
                onValueChange={(value) => updateForm("insurance_type", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private_fully_insured">Private insurance (fully insured)</SelectItem>
                  <SelectItem value="private_self_funded">Private insurance (self-funded/ERISA)</SelectItem>
                  <SelectItem value="medi_cal">Medi-Cal</SelectItem>
                  <SelectItem value="regional_center_only">Regional Center only</SelectItem>
                  <SelectItem value="none">No insurance</SelectItem>
                </SelectContent>
              </Select>
              <p className="mt-1 text-xs text-[var(--muted)]">
                This helps us know which coverage laws apply to you
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-[var(--card-bg)] border-t border-[var(--border)] p-4 safe-bottom">
        <div className="max-w-md mx-auto flex gap-3">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex-1"
            >
              Back
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={loading || (step === 1 && !isStep1Valid)}
            className="flex-1"
          >
            {loading ? "Loading..." : step === 3 ? "See My Timeline" : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}
