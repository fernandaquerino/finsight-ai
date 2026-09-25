"use client";

import { DownloadIcon, FileTextIcon } from "lucide-react";

import { Button } from "@/components/ui/Button";
import type { ReportGranularity } from "@/features/reports/types";

type ReportExportActionsProps = Readonly<{
  granularity: ReportGranularity;
  month: string;
  disabled?: boolean;
}>;

// A exportação é um GET autenticado que responde com Content-Disposition:
// attachment. Um link comum basta — não há blob no cliente, e o arquivo nunca
// passa pela memória do navegador.
function ReportExportActions({
  granularity,
  month,
  disabled = false,
}: ReportExportActionsProps) {
  function exportHref(format: "csv" | "pdf"): string {
    return `/api/reports/export?${new URLSearchParams({ format, granularity, month })}`;
  }

  return (
    <div className="flex gap-2">
      <Button variant="secondary" size="sm" asChild disabled={disabled}>
        <a href={exportHref("pdf")} download>
          <FileTextIcon aria-hidden="true" />
          Gerar PDF
        </a>
      </Button>
      <Button variant="secondary" size="sm" asChild disabled={disabled}>
        <a href={exportHref("csv")} download>
          <DownloadIcon aria-hidden="true" />
          CSV
        </a>
      </Button>
    </div>
  );
}

export { ReportExportActions };
