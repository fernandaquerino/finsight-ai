import { getDb } from "@/lib/db";
import { jsonError } from "@/server/api/responses";
import { UnauthorizedError, requireUserId } from "@/server/auth/session";
import {
  auditLogRepository,
  transactionRepository,
} from "@/server/repositories";
import {
  buildReportCsv,
  reportFileName,
} from "@/server/services/reports/export-csv";
import { getReport } from "@/server/services/reports/get-report";
import { resolveReportPeriod } from "@/server/services/reports/period";
import { reportExportQuerySchema } from "@/server/validators/reports";

// @react-pdf/renderer só roda em Node — nunca no edge.
export const runtime = "nodejs";

// GET /api/reports/export?format=csv|pdf&granularity=…&month=YYYY-MM
//
// Exporta apenas os dados do próprio usuário (repositories filtram por userId)
// e registra a exportação em audit_logs, sem valores financeiros no metadata.
export async function GET(request: Request): Promise<Response> {
  let userId: string;

  try {
    userId = await requireUserId();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return jsonError("UNAUTHORIZED", "Autenticação necessária.", 401);
    }
    throw error;
  }

  const { searchParams } = new URL(request.url);
  const parsed = reportExportQuerySchema.safeParse({
    format: searchParams.get("format") ?? undefined,
    granularity: searchParams.get("granularity") ?? undefined,
    month: searchParams.get("month") ?? undefined,
  });

  if (!parsed.success) {
    return jsonError(
      "INVALID_QUERY",
      "Parâmetros de exportação inválidos.",
      422,
      parsed.error.flatten(),
    );
  }

  const { format, granularity, month } = parsed.data;
  const db = getDb();
  const period = resolveReportPeriod(granularity, month);

  try {
    const body =
      format === "csv"
        ? await buildCsvBody(db, userId, period)
        : await buildPdfBody(db, userId, period);

    // Auditoria: registra o evento com contagem e formato — nunca o conteúdo.
    await auditLogRepository.record(db, {
      userId,
      action: "data_export",
      targetType: "report",
      metadata: {
        format,
        granularity,
        periodKey: period.key,
        rowCount: body.rowCount,
      },
    });

    return new Response(new Uint8Array(body.bytes), {
      headers: {
        "Content-Type": body.contentType,
        "Content-Disposition": `attachment; filename="${reportFileName(period.key, format)}"`,
        // Relatório é dado financeiro pessoal: nunca em cache compartilhado.
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return jsonError(
      "INTERNAL_ERROR",
      "Não foi possível gerar a exportação.",
      500,
    );
  }
}

type ExportBody = {
  bytes: Uint8Array;
  contentType: string;
  rowCount: number;
};

async function buildCsvBody(
  db: ReturnType<typeof getDb>,
  userId: string,
  period: ReturnType<typeof resolveReportPeriod>,
): Promise<ExportBody> {
  const rows = await transactionRepository.listByUserInPeriodWithRelations(
    db,
    userId,
    period.from,
    period.toExclusive,
  );

  return {
    bytes: new TextEncoder().encode(buildReportCsv(rows)),
    contentType: "text/csv; charset=utf-8",
    rowCount: rows.length,
  };
}

async function buildPdfBody(
  db: ReturnType<typeof getDb>,
  userId: string,
  period: ReturnType<typeof resolveReportPeriod>,
): Promise<ExportBody> {
  const report = await getReport(db, userId, period);
  // Import dinâmico: mantém o custo de carregar o renderer de PDF fora do
  // caminho do CSV, que é a exportação mais comum.
  const { renderReportPdf } =
    await import("@/server/services/reports/export-pdf");
  const buffer = await renderReportPdf(report);

  return {
    bytes: new Uint8Array(buffer),
    contentType: "application/pdf",
    rowCount: report.transactionCount,
  };
}
