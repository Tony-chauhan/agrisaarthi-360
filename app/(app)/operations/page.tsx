"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Tractor,
  Sprout,
  SprayCan,
  Wheat,
  Truck,
  MapPin,
  Clock3,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  CloudSun,
  Ruler,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, DataSourceTag } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/field";
import { EmptyState } from "@/components/ui/states";
import { useFarmProfile } from "@/lib/farm-context";
import { useTimeline } from "@/lib/timeline/timeline-context";
import { useWeather } from "@/lib/weather/use-weather";
import { deriveFarmWeatherAction } from "@/lib/weather/weather-actions";
import {
  FARM_OPERATIONS,
  OPERATION_LABELS,
} from "@/lib/operations/machine-knowledge";
import {
  matchMachinery,
  findAlternative,
  getOperation,
  demoResponseFor,
} from "@/lib/operations/machine-matching";
import type {
  FarmOperationId,
  MachineryProvider,
  AvailabilityStatus,
  MachineMatch,
  OperationRequestStatus,
  ProviderResponseKind,
} from "@/lib/operations/types";

/**
 * Farm Operations — machinery service request workflow.
 * Choose operation → review suitable machinery → send a service request →
 * view request status. Availability reflects the connected service dataset.
 */

type FlowStep = 1 | 2 | 3;

const OPERATION_ICONS: Record<FarmOperationId, typeof Tractor> = {
  "seedbed-preparation": Tractor,
  sowing: Sprout,
  spraying: SprayCan,
  harvesting: Wheat,
  transport: Truck,
};

const AVAILABILITY_META: Record<
  AvailabilityStatus,
  { badge: string; tone: "success" | "warning" | "danger" }
> = {
  available: { badge: "Shown available", tone: "success" },
  busy: { badge: "Shown busy", tone: "warning" },
  unavailable: { badge: "Unavailable", tone: "danger" },
};

const UNAVAILABLE_NOTE = "Currently unavailable — try another provider";

function StepIndicator({ current }: { current: FlowStep }) {
  const steps = [
    { n: 1, label: "Choose operation" },
    { n: 2, label: "Review machinery" },
    { n: 3, label: "Request service" },
  ];
  return (
    <ol
      className="flex items-center gap-2"
      aria-label="Workflow progress"
    >
      {steps.map((s, i) => {
        const done = s.n < current;
        const active = s.n === current;
        return (
          <li key={s.n} className="flex flex-1 items-center gap-2">
            {i > 0 && (
              <span
                className={cnLine(done || active)}
                aria-hidden
              />
            )}
            <span
              className="flex min-w-0 flex-1 items-center gap-2"
              aria-current={active ? "step" : undefined}
            >
              <span
                className={
                  done
                    ? "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sprout-400/20 text-canopy-800"
                    : active
                      ? "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-terracotta-600 text-white"
                      : "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-canopy-100 text-canopy-500"
                }
              >
                {done ? (
                  <CheckCircle2 className="h-4 w-4" aria-hidden />
                ) : (
                  <span className="text-xs font-semibold">{s.n}</span>
                )}
              </span>
              <span
                className={
                  active
                    ? "truncate text-xs font-semibold text-canopy-900 sm:text-sm"
                    : done
                      ? "truncate text-xs text-canopy-700 sm:text-sm"
                      : "truncate text-xs text-loam-500 sm:text-sm"
                }
              >
                {s.label}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function cnLine(done: boolean) {
  return done
    ? "h-0.5 w-4 shrink-0 rounded bg-sprout-400/60 sm:w-6"
    : "h-0.5 w-4 shrink-0 rounded bg-canopy-100 sm:w-6";
}

function FarmContextChips({
  crop,
  size,
  location,
  season,
}: {
  crop?: string;
  size: string;
  location: string;
  season: string;
}) {
  return (
    <div className="flex flex-wrap gap-2 text-xs">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-canopy-50 px-3 py-1 font-medium text-canopy-800">
        <Ruler className="h-3.5 w-3.5" aria-hidden />
        {size}
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-canopy-50 px-3 py-1 font-medium text-canopy-800">
        <MapPin className="h-3.5 w-3.5" aria-hidden />
        {location}
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-canopy-50 px-3 py-1 font-medium text-canopy-800">
        Season: {season}
      </span>
      {crop ? (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-sprout-400/15 px-3 py-1 font-medium text-canopy-800">
          <Sprout className="h-3.5 w-3.5" aria-hidden />
          Crop: {crop}
        </span>
      ) : null}
    </div>
  );
}

function AvailabilityLine({ provider }: { provider: MachineryProvider }) {
  const meta = AVAILABILITY_META[provider.availabilityStatus];
  return (
    <div className="flex flex-col items-start gap-1">
      <Badge tone={meta.tone}>{meta.badge}</Badge>
      {provider.availabilityStatus === "unavailable" ? (
        <span className="text-xs text-loam-600">{UNAVAILABLE_NOTE}</span>
      ) : null}
    </div>
  );
}

export default function OperationsPage() {
  const { profile, hasCompleteProfile, setLatestOperation } = useFarmProfile();
  const { emitEvent } = useTimeline();
  const { snapshot } = useWeather(profile.location);
  const weatherAction = snapshot
    ? deriveFarmWeatherAction(snapshot, profile)
    : null;

  const [step, setStep] = useState<FlowStep>(1);
  const [operationId, setOperationId] = useState<FarmOperationId | null>(null);
  const [selectedMachine, setSelectedMachine] = useState<MachineMatch | null>(
    null
  );
  const [requestedDate, setRequestedDate] = useState("");
  const [requestStatus, setRequestStatus] =
    useState<OperationRequestStatus>("idle");
  const [responseKind, setResponseKind] = useState<ProviderResponseKind | null>(
    null
  );

  const timerRef = useRef<number | null>(null);
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const operation = operationId ? getOperation(operationId) : undefined;
  const matches = useMemo(
    () => (operationId ? matchMachinery(operationId, profile) : []),
    [operationId, profile]
  );
  const alternative = useMemo(() => {
    if (!operationId || !selectedMachine) return null;
    return findAlternative(operationId, selectedMachine.provider.id, profile);
  }, [operationId, selectedMachine, profile]);

  const chooseOperation = (id: FarmOperationId) => {
    setOperationId(id);
    setSelectedMachine(null);
    setRequestStatus("reviewing");
    setResponseKind(null);
    setStep(2);
  };

  const openRequest = (match: MachineMatch) => {
    setSelectedMachine(match);
    setRequestStatus("reviewing");
    setResponseKind(null);
    setStep(3);
  };

  const confirmRequest = () => {
    if (!selectedMachine || !operationId) return;
    const summaryBase = {
      operationId,
      operationName: OPERATION_LABELS[operationId],
      machineName: selectedMachine.provider.machineName,
      providerName: selectedMachine.provider.providerName,
      source: "demo" as const,
      createdAt: new Date().toISOString(),
    };
    setRequestStatus("submitted");
    setLatestOperation({ ...summaryBase, status: "submitted" });
    // P1: actual action → timeline event.
    emitEvent({
      eventType: "OPERATION_REQUESTED",
      title: `${summaryBase.operationName} requested`,
      description: `Service request sent for ${selectedMachine.provider.machineName} (${selectedMachine.provider.providerName}).`,
      source: "demo",
      entityType: "operation",
      entityId: `${summaryBase.operationId}-${summaryBase.createdAt}`,
    });

    // Short UI transition only — no real provider is contacted.
    timerRef.current = window.setTimeout(() => {
      const kind = demoResponseFor(
        selectedMachine.provider.availabilityStatus
      );
      setResponseKind(kind);
      setRequestStatus("provider_response");
      setLatestOperation({
        ...summaryBase,
        status: "provider_response",
        response: kind,
      });
      // P1: accepted dataset outcome → OPERATION_COMPLETED event
      // (provenance-eligible). Honest framing: service-workflow outcome,
      // not a real-world booking.
      if (kind === "accepted") {
        emitEvent({
          eventType: "OPERATION_COMPLETED",
          title: `${summaryBase.operationName} accepted by provider`,
          description: `Provider accepted the service request in the workflow. Final scheduling is confirmed directly with the provider.`,
          source: "demo",
          entityType: "operation",
          entityId: `${summaryBase.operationId}-${summaryBase.createdAt}`,
        });
      }
    }, 900);
  };

  const tryAlternative = () => {
    if (!alternative) return;
    setSelectedMachine(alternative);
    setRequestStatus("reviewing");
    setResponseKind(null);
    setStep(3);
  };

  const startOver = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setStep(1);
    setOperationId(null);
    setSelectedMachine(null);
    setRequestStatus("idle");
    setResponseKind(null);
  };

  const cropLabel = profile.selectedCrop;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <PageHeader
        eyebrow="Operation to equipment to service request"
        title="Farm Operations"
        description="Choose an operation, review suitable machinery, and send a service request — the status is tracked in your farm workspace."
      />

      <StepIndicator current={step} />

      {!hasCompleteProfile ? (
        <Alert tone="warning" title="Farm profile incomplete">
          Set up your farm profile to get contextual operation suggestions.
          <div className="mt-2">
            <Link href="/farm-profile">
              <Button size="sm" variant="accent">
                Complete Farm Profile
              </Button>
            </Link>
          </div>
        </Alert>
      ) : null}

      {hasCompleteProfile ? (
        <Card>
          <CardContent className="flex flex-col gap-2 pt-5">
            <FarmContextChips
              crop={cropLabel}
              size={`${profile.farmSizeAcres} acres`}
              location={profile.location}
              season={profile.season}
            />
            {weatherAction ? (
              <p className="flex items-start gap-1.5 text-xs text-loam-600">
                <CloudSun className="mt-0.5 h-3.5 w-3.5 shrink-0 text-canopy-600" aria-hidden />
                Weather action currently suggests: {weatherAction.title.toLowerCase()}.
              </p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {/* ------------------------- STEP 1 ------------------------- */}
      {step === 1 ? (
        <section aria-label="Choose an operation" className="flex flex-col gap-4">
          <h2 className="font-display text-lg font-semibold text-canopy-900">
            What farm operation do you need?
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {FARM_OPERATIONS.map((op) => {
              const Icon = OPERATION_ICONS[op.id];
              return (
                <button
                  key={op.id}
                  type="button"
                  onClick={() => chooseOperation(op.id)}
                  className="card-surface group flex cursor-pointer flex-col gap-2 px-5 py-4 text-left transition-shadow hover:shadow-lift"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-canopy-50 text-canopy-600 transition-colors group-hover:bg-canopy-100">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="font-display text-base font-semibold text-canopy-900">
                    {op.name}
                  </span>
                  <span className="text-sm text-loam-600">{op.description}</span>
                  <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-terracotta-600">
                    Find equipment
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* ------------------------- STEP 2 ------------------------- */}
      {step === 2 && operation ? (
        <section aria-label="Review suitable machinery" className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-semibold text-canopy-900">
                Suitable machinery — {operation.name}
              </h2>
              <p className="text-sm text-loam-600">
                Suitability from the decision engine — based on farm size,
                crop and distance. Not a scientifically optimal selection.
              </p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              leftIcon={<ArrowLeft className="h-4 w-4" aria-hidden />}
              onClick={() => setStep(1)}
            >
              Choose a different operation
            </Button>
          </div>

          {matches.length === 0 ? (
            <EmptyState
              title="No suitable machinery found for this operation."
              description="No equipment is currently listed for this operation. Try another operation or check back later."
              action={
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setStep(1)}
                >
                  Try another operation
                </Button>
              }
            />
          ) : (
            matches.map((match) => (
              <MachineryCard
                key={match.provider.id}
                match={match}
                onRequest={() => openRequest(match)}
              />
            ))
          )}
        </section>
      ) : null}

      {/* ------------------------- STEP 3 ------------------------- */}
      {step === 3 && operation && selectedMachine ? (
        <section aria-label="Request service" className="flex flex-col gap-4">
          {requestStatus === "reviewing" ? (
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Confirm your request</CardTitle>
                  <CardDescription>
                    Review the details before sending your service request.
                  </CardDescription>
                </div>
                <DataSourceTag source="demo" />
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                  <Detail label="Operation" value={operation.name} />
                  <Detail
                    label="Machine"
                    value={selectedMachine.provider.machineName}
                  />
                  <Detail
                    label="Provider"
                    value={selectedMachine.provider.providerName}
                  />
                  <Detail
                    label="Requested date"
                    value={requestedDate || "Flexible — to be confirmed with provider"}
                  />
                  <Detail label="Farm location" value={profile.location} />
                  <Detail label="Farm size" value={`${profile.farmSizeAcres} acres`} />
                </dl>
                <div>
                  <label
                    htmlFor="op-request-date"
                    className="text-xs font-medium uppercase tracking-wide text-loam-500"
                  >
                    Requested date (optional)
                  </label>
                  <Input
                    id="op-request-date"
                    type="date"
                    value={requestedDate}
                    onChange={(e) => setRequestedDate(e.target.value)}
                    className="mt-1 max-w-xs"
                  />
                </div>
                <p className="rounded-lg bg-canopy-50 px-3 py-2 text-xs text-loam-600">
                  Availability depends on connected service providers.
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  variant="accent"
                  onClick={confirmRequest}
                  rightIcon={<ArrowRight className="h-4 w-4" aria-hidden />}
                >
                  Confirm request
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<ArrowLeft className="h-4 w-4" aria-hidden />}
                  onClick={() => setStep(2)}
                >
                  Back to machinery
                </Button>
              </CardFooter>
            </Card>
          ) : null}

          {requestStatus === "submitted" ? (
            <Card>
              <CardHeader>
                <CardTitle>Request submitted</CardTitle>
                <DataSourceTag source="demo" />
              </CardHeader>
              <CardContent className="flex flex-col gap-2 text-sm text-loam-700">
                <p className="font-medium text-canopy-900">
                  {operation.name} — {selectedMachine.provider.machineName}
                </p>
                <p>Provider: {selectedMachine.provider.providerName}</p>
                <p>
                  Provider response expected in{" "}
                  {selectedMachine.provider.estimatedResponse}.
                </p>
                <p className="text-xs text-loam-500">
                  Availability depends on connected service providers.
                </p>
              </CardContent>
            </Card>
          ) : null}

          {requestStatus === "provider_response" && responseKind ? (
            responseKind === "accepted" ? (
              <Card>
                <CardHeader>
                  <CardTitle>Service request status</CardTitle>
                  <DataSourceTag source="demo" />
                </CardHeader>
                <CardContent className="flex flex-col gap-2 text-sm text-loam-700">
                  <p className="flex items-center gap-2 font-medium text-canopy-900">
                    <CheckCircle2 className="h-5 w-5 text-sprout-500" aria-hidden />
                    {selectedMachine.provider.providerName} accepted your
                    service request for {operation.name.toLowerCase()}.
                  </p>
                  <p>
                    Machine: {selectedMachine.provider.machineName} · Date:{" "}
                    {requestedDate || "flexible"}
                  </p>
                  <p className="text-xs text-loam-500">
                    Final scheduling is confirmed directly with the provider.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    size="sm"
                    variant="secondary"
                    leftIcon={<RotateCcw className="h-4 w-4" aria-hidden />}
                    onClick={startOver}
                  >
                    Plan another operation
                  </Button>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-1 text-sm font-medium text-terracotta-600 hover:underline"
                  >
                    View dashboard
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                </CardFooter>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Provider unavailable</CardTitle>
                  <DataSourceTag source="demo" />
                </CardHeader>
                <CardContent className="flex flex-col gap-3 text-sm text-loam-700">
                  <p>
                    That machine is currently unavailable. You can try another
                    suitable machine from the service dataset.
                  </p>
                  {alternative ? (
                    <div className="rounded-xl border border-canopy-200 bg-canopy-50/60 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-loam-500">
                        Alternative machine
                      </p>
                      <p className="mt-1 font-display text-base font-semibold text-canopy-900">
                        {alternative.provider.machineName}
                      </p>
                      <p className="text-sm text-loam-600">
                        {alternative.provider.providerName} ·{" "}
                        {alternative.provider.distanceKm} km away ·{" "}
                        {AVAILABILITY_META[alternative.provider.availabilityStatus].badge}
                      </p>
                    </div>
                  ) : (
                    <p>
                      No alternative provider is available for this operation
                      right now.
                    </p>
                  )}
                  <p className="text-xs text-loam-500">
                    Availability depends on connected service providers.
                  </p>
                </CardContent>
                <CardFooter>
                  {alternative ? (
                    <Button variant="accent" onClick={tryAlternative}>
                      Try another suitable machine
                    </Button>
                  ) : (
                    <Button variant="secondary" onClick={() => setStep(1)}>
                      Try another operation
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<RotateCcw className="h-4 w-4" aria-hidden />}
                    onClick={startOver}
                  >
                    Start over
                  </Button>
                </CardFooter>
              </Card>
            )
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
/* ------------------------------------------------------------------ */

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-loam-500">
        {label}
      </dt>
      <dd className="mt-0.5 font-medium text-canopy-900">{value}</dd>
    </div>
  );
}

function MachineryCard({
  match,
  onRequest,
}: {
  match: MachineMatch;
  onRequest: () => void;
}) {
  const { provider, matchBasis } = match;
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="text-base">{provider.machineName}</CardTitle>
          <p className="mt-0.5 text-sm text-loam-600">
            {provider.providerName} · {provider.location}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <AvailabilityLine provider={provider} />
          <DataSourceTag source={provider.source} />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-4 text-sm text-loam-700">
          <span className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-canopy-600" aria-hidden />
            {provider.distanceKm} km away
          </span>
          <span className="flex items-center gap-1.5">
            <Ruler className="h-4 w-4 text-canopy-600" aria-hidden />
            Suitable for: {provider.suitableFarmSizeAcres.min}–
            {provider.suitableFarmSizeAcres.max} acres
          </span>
          <span className="flex items-center gap-1.5">
            <Clock3 className="h-4 w-4 text-canopy-600" aria-hidden />
            Response: {provider.estimatedResponse}
          </span>
        </div>
        <ul className="flex flex-col gap-1 text-xs text-loam-600">
          {matchBasis.map((basis) => (
            <li key={basis} className="flex items-start gap-1.5">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-canopy-400" aria-hidden />
              {basis}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-loam-500">
          SERVICE DATA · Availability depends on connected service providers.
        </p>
        <Button size="sm" variant="accent" onClick={onRequest}>
          Request service
        </Button>
      </CardFooter>
    </Card>
  );
}
