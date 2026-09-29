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
import { useLanguage } from "@/lib/i18n/language-context";
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
 *
 * Canonical availability note (English default, rendered via the i18n
 * dictionary as t.operations.availabilityNote):
 * "Availability depends on connected service providers."
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
  const { t } = useLanguage();
  const steps = [
    { n: 1, label: t.operations.step1 },
    { n: 2, label: t.operations.step2 },
    { n: 3, label: t.operations.step3 },
  ];
  return (
    <ol
      className="flex items-center gap-2"
      aria-label={t.operations.progressAria}
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
  const { t } = useLanguage();
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
        {t.operations.seasonChip}
        {season}
      </span>
      {crop ? (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-sprout-400/15 px-3 py-1 font-medium text-canopy-800">
          <Sprout className="h-3.5 w-3.5" aria-hidden />
          {t.operations.cropChip}
          {crop}
        </span>
      ) : null}
    </div>
  );
}

function AvailabilityLine({ provider }: { provider: MachineryProvider }) {
  const { t } = useLanguage();
  const meta = AVAILABILITY_META[provider.availabilityStatus];
  const badgeLabel =
    provider.availabilityStatus === "available"
      ? t.operations.shownAvailable
      : provider.availabilityStatus === "busy"
        ? t.operations.shownBusy
        : t.operations.unavailableBadge;
  return (
    <div className="flex flex-col items-start gap-1">
      <Badge tone={meta.tone}>{badgeLabel}</Badge>
      {provider.availabilityStatus === "unavailable" ? (
        <span className="text-xs text-loam-600">{t.operations.unavailableNote}</span>
      ) : null}
    </div>
  );
}

export default function OperationsPage() {
  const { profile, hasCompleteProfile, setLatestOperation } = useFarmProfile();
  const { emitEvent } = useTimeline();
  const { snapshot } = useWeather(profile.location);
  const { t, lang } = useLanguage();
  const weatherAction = snapshot
    ? deriveFarmWeatherAction(snapshot, profile, lang)
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
    () => (operationId ? matchMachinery(operationId, profile, lang) : []),
    [operationId, profile, lang]
  );
  const alternative = useMemo(() => {
    if (!operationId || !selectedMachine) return null;
    return findAlternative(operationId, selectedMachine.provider.id, profile, lang);
  }, [operationId, selectedMachine, profile, lang]);

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
      title: t.operations.eventRequestedTitle(summaryBase.operationName),
      description: t.operations.eventRequestedDescription(
        selectedMachine.provider.machineName,
        selectedMachine.provider.providerName,
      ),
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
          title: t.operations.eventAcceptedTitle(summaryBase.operationName),
          description: t.operations.eventAcceptedDescription,
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
        eyebrow={t.operations.eyebrow}
        title={t.operations.title}
        description={t.operations.description}
      />

      <StepIndicator current={step} />

      {!hasCompleteProfile ? (
        <Alert tone="warning" title={t.operations.profileIncompleteTitle}>
          {t.operations.profileIncompleteBody}
          <div className="mt-2">
            <Link href="/farm-profile">
              <Button size="sm" variant="accent">
                {t.operations.completeProfile}
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
                {t.operations.weatherSuggests(weatherAction.title)}
              </p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {/* ------------------------- STEP 1 ------------------------- */}
      {step === 1 ? (
        <section aria-label={t.operations.step1} className="flex flex-col gap-4">
          <h2 className="font-display text-lg font-semibold text-canopy-900">
            {t.operations.chooseQuestion}
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
                    {t.operations.findEquipment}
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
        <section aria-label={t.operations.step2} className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-semibold text-canopy-900">
                {t.operations.suitableTitle(operation.name)}
              </h2>
              <p className="text-sm text-loam-600">
                {t.operations.suitableNote}
              </p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              leftIcon={<ArrowLeft className="h-4 w-4" aria-hidden />}
              onClick={() => setStep(1)}
            >
              {t.operations.chooseDifferent}
            </Button>
          </div>

          {matches.length === 0 ? (
            <EmptyState
              title={t.operations.noMachineryTitle}
              description={t.operations.noMachineryBody}
              action={
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setStep(1)}
                >
                  {t.operations.tryAnotherOperation}
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
        <section aria-label={t.operations.step3} className="flex flex-col gap-4">
          {requestStatus === "reviewing" ? (
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>{t.operations.confirmTitle}</CardTitle>
                  <CardDescription>
                    {t.operations.confirmDescription}
                  </CardDescription>
                </div>
                <DataSourceTag source="demo" />
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                  <Detail label={t.operations.detailOperation} value={operation.name} />
                  <Detail
                    label={t.operations.detailMachine}
                    value={selectedMachine.provider.machineName}
                  />
                  <Detail
                    label={t.operations.detailProvider}
                    value={selectedMachine.provider.providerName}
                  />
                  <Detail
                    label={t.operations.detailDate}
                    value={requestedDate || t.operations.detailDateFlexible}
                  />
                  <Detail label={t.operations.detailLocation} value={profile.location} />
                  <Detail label={t.operations.detailSize} value={`${profile.farmSizeAcres} ${t.common.acres}`} />
                </dl>
                <div>
                  <label
                    htmlFor="op-request-date"
                    className="text-xs font-medium uppercase tracking-wide text-loam-500"
                  >
                    {t.operations.dateLabel}
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
                  {t.operations.availabilityNote}
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  variant="accent"
                  onClick={confirmRequest}
                  rightIcon={<ArrowRight className="h-4 w-4" aria-hidden />}
                >
                  {t.operations.confirmRequest}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<ArrowLeft className="h-4 w-4" aria-hidden />}
                  onClick={() => setStep(2)}
                >
                  {t.operations.backToMachinery}
                </Button>
              </CardFooter>
            </Card>
          ) : null}

          {requestStatus === "submitted" ? (
            <Card>
              <CardHeader>
                <CardTitle>{t.operations.submittedTitle}</CardTitle>
                <DataSourceTag source="demo" />
              </CardHeader>
              <CardContent className="flex flex-col gap-2 text-sm text-loam-700">
                <p className="font-medium text-canopy-900">
                  {operation.name} — {selectedMachine.provider.machineName}
                </p>
                <p>Provider: {selectedMachine.provider.providerName}</p>
                <p>{t.operations.providerResponse(selectedMachine.provider.estimatedResponse)}</p>
                <p className="text-xs text-loam-500">
                  {t.operations.availabilityNote}
                </p>
              </CardContent>
            </Card>
          ) : null}

          {requestStatus === "provider_response" && responseKind ? (
            responseKind === "accepted" ? (
              <Card>
                <CardHeader>
                  <CardTitle>{t.operations.responseTitle}</CardTitle>
                  <DataSourceTag source="demo" />
                </CardHeader>
                <CardContent className="flex flex-col gap-2 text-sm text-loam-700">
                  <p className="flex items-center gap-2 font-medium text-canopy-900">
                    <CheckCircle2 className="h-5 w-5 text-sprout-500" aria-hidden />
                    {t.operations.acceptedBody(
                      selectedMachine.provider.providerName,
                      operation.name.toLowerCase(),
                    )}
                  </p>
                  <p>
                    {t.operations.machineDate(
                      selectedMachine.provider.machineName,
                      requestedDate || t.operations.flexible,
                    )}
                  </p>
                  <p className="text-xs text-loam-500">
                    {t.operations.finalScheduling}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    size="sm"
                    variant="secondary"
                    leftIcon={<RotateCcw className="h-4 w-4" aria-hidden />}
                    onClick={startOver}
                  >
                    {t.operations.planAnother}
                  </Button>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-1 text-sm font-medium text-terracotta-600 hover:underline"
                  >
                    {t.operations.viewDashboard}
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                </CardFooter>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>{t.operations.providerUnavailableTitle}</CardTitle>
                  <DataSourceTag source="demo" />
                </CardHeader>
                <CardContent className="flex flex-col gap-3 text-sm text-loam-700">
                  <p>{t.operations.providerUnavailableBody}</p>
                  {alternative ? (
                    <div className="rounded-xl border border-canopy-200 bg-canopy-50/60 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-loam-500">
                        {t.operations.alternativeMachine}
                      </p>
                      <p className="mt-1 font-display text-base font-semibold text-canopy-900">
                        {alternative.provider.machineName}
                      </p>
                      <p className="text-sm text-loam-600">
                        {t.operations.alternativeMeta(
                          alternative.provider.providerName,
                          alternative.provider.distanceKm,
                          alternative.provider.availabilityStatus === "available"
                            ? t.operations.shownAvailable
                            : alternative.provider.availabilityStatus === "busy"
                              ? t.operations.shownBusy
                              : t.operations.unavailableBadge,
                        )}
                      </p>
                    </div>
                  ) : (
                    <p>{t.operations.noAlternative}</p>
                  )}
                  <p className="text-xs text-loam-500">
                    {t.operations.availabilityNote}
                  </p>
                </CardContent>
                <CardFooter>
                  {alternative ? (
                    <Button variant="accent" onClick={tryAlternative}>
                      {t.operations.tryAnotherMachine}
                    </Button>
                  ) : (
                    <Button variant="secondary" onClick={() => setStep(1)}>
                      {t.operations.tryAnotherOperation}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<RotateCcw className="h-4 w-4" aria-hidden />}
                    onClick={startOver}
                  >
                    {t.operations.startOver}
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
  const { t, lang } = useLanguage();
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
            {t.common.kmAway(provider.distanceKm)}
          </span>
          <span className="flex items-center gap-1.5">
            <Ruler className="h-4 w-4 text-canopy-600" aria-hidden />
            {t.operations.suitableFor(
              provider.suitableFarmSizeAcres.min,
              provider.suitableFarmSizeAcres.max,
            )}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock3 className="h-4 w-4 text-canopy-600" aria-hidden />
            {t.operations.responseTime(provider.estimatedResponse)}
          </span>
        </div>
        <ul className="flex flex-col gap-1 text-xs text-loam-600">
          {matchBasis.map((basis, index) => (
            <li key={`${basis}-${index}`} className="flex items-start gap-1.5">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-canopy-400" aria-hidden />
              {basis}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-loam-500">{t.operations.serviceDataNote}</p>
        <Button size="sm" variant="accent" onClick={onRequest}>
          {t.operations.requestService}
        </Button>
      </CardFooter>
    </Card>
  );
}
