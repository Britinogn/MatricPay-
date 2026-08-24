import PDFDocument from "pdfkit";
import { PaymentStatus, UserRole } from "@prisma/client";
import { paymentRepository } from "../repositories/payment.repository";
import { campaignRepository } from "../repositories/campaign.repository";
import { HttpError } from "../utils/http-error";

type AuthUser = {
  id: string;
  role: UserRole;
};

const colors = {
  primary: "#1F4D3A",
  accent: "#C9972B",
  text: "#1B2B22",
  muted: "#4A5A50",
  border: "#E4DCC8",
  background: "#F7F3E8",
};

async function getOwnedCampaign(user: AuthUser, campaignId: string) {
  const campaign =
    user.role === UserRole.admin
      ? await campaignRepository.findById(campaignId)
      : await campaignRepository.findByIdForOrganizer(campaignId, user.id);

  if (!campaign) {
    throw new HttpError(404, "Campaign not found");
  }

  return campaign;
}

async function loadSuccessfulPayments(campaignId: string) {
  const all = [];
  let page = 1;
  const limit = 100;

  for (;;) {
    const result = await paymentRepository.listByCampaign({
      campaignId,
      status: PaymentStatus.successful,
      page,
      limit,
    });

    all.push(...result.payments);

    if (page >= result.totalPages || result.payments.length === 0) {
      break;
    }

    page += 1;
  }

  return all;
}

function csvEscape(value: string | number | null | undefined) {
  const s = value == null ? "" : String(value);
  if (/[",\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export class CampaignExportService {
  async exportCsv(user: AuthUser, campaignId: string) {
    const campaign = await getOwnedCampaign(user, campaignId);
    const payments = await loadSuccessfulPayments(campaign.id);

    const header = [
      "Full Name",
      "Matric Number",
      "Email",
      "Amount",
      "Currency",
      "Reference",
      "Paid At",
    ];

    const rows = payments.map((p) => [
      csvEscape(p.student?.fullName),
      csvEscape(p.student?.matricNumber),
      csvEscape(p.student?.email),
      csvEscape(Number(p.amount)),
      csvEscape(p.currency),
      csvEscape(p.reference),
      csvEscape(
        p.verifiedAt
          ? new Date(p.verifiedAt).toISOString()
          : new Date(p.createdAt).toISOString()
      ),
    ]);

    const body = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const filename = `${campaign.slug || campaign.id}-paid-students.csv`;

    return {
      filename,
      body,
      contentType: "text/csv; charset=utf-8",
    };
  }

  async exportPdf(user: AuthUser, campaignId: string): Promise<{
    filename: string;
    buffer: Buffer;
    contentType: string;
  }> {
    const campaign = await getOwnedCampaign(user, campaignId);
    const payments = await loadSuccessfulPayments(campaign.id);

    const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0);

    const doc = new PDFDocument({ margin: 40, size: "A4" });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));

    const done = new Promise<Buffer>((resolve, reject) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);
    });

    // Header band
    doc.rect(0, 0, 595, 72).fill(colors.background);

    doc
      .fillColor(colors.primary)
      .font("Helvetica-Bold")
      .fontSize(16)
      .text("MatricPay", 40, 24, { lineBreak: false });

    const titlePrefixWidth = doc.widthOfString("MatricPay");
    doc
      .fillColor(colors.accent)
      .font("Helvetica")
      .fontSize(16)
      .text(" — Collection Report", 40 + titlePrefixWidth, 24);

    doc
      .fillColor(colors.text)
      .font("Helvetica-Bold")
      .fontSize(12)
      .text(campaign.title, 40, 48);

    doc
      .fillColor(colors.muted)
      .font("Helvetica")
      .fontSize(9)
      .text(`Generated: ${new Date().toLocaleString("en-NG")}`, 40, 64);

    doc.y = 90;

    // Summary
    doc.fillColor(colors.text).font("Helvetica").fontSize(10);
    doc.text(`Paid students: ${payments.length}`);
    doc.text(
      `Total collected: NGN ${totalAmount.toLocaleString("en-NG", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    );
    doc.moveDown(1);

    // Columns (fixed x positions — no string padding)
    const col = {
      name: 40,
      matric: 200,
      amount: 340,
      reference: 410,
    };
    const rowHeight = 16;
    const bottomLimit = 750;

    const drawTableHeader = (y: number) => {
      doc.font("Helvetica-Bold").fontSize(9).fillColor(colors.primary);
      doc.text("Name", col.name, y, { width: 150, lineBreak: false });
      doc.text("Matric", col.matric, y, { width: 130, lineBreak: false });
      doc.text("Amount", col.amount, y, { width: 60, lineBreak: false });
      doc.text("Reference", col.reference, y, {
        width: 145,
        lineBreak: false,
      });

      doc
        .moveTo(40, y + 12)
        .lineTo(555, y + 12)
        .strokeColor(colors.border)
        .lineWidth(1)
        .stroke();
    };

    let y = doc.y;
    drawTableHeader(y);
    y += 18;

    doc.font("Helvetica").fontSize(8).fillColor(colors.text);

    for (const p of payments) {
      if (y > bottomLimit) {
        doc.addPage();
        y = 50;
        drawTableHeader(y);
        y += 18;
        doc.font("Helvetica").fontSize(8).fillColor(colors.text);
      }

      const name = p.student?.fullName || "—";
      const matric = p.student?.matricNumber || "—";
      const amount = Number(p.amount).toLocaleString("en-NG", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      const ref = p.reference;

      doc.text(name, col.name, y, {
        width: 150,
        ellipsis: true,
        lineBreak: false,
      });
      doc.text(matric, col.matric, y, {
        width: 130,
        ellipsis: true,
        lineBreak: false,
      });
      doc.text(amount, col.amount, y, { width: 60, lineBreak: false });
      doc.text(ref, col.reference, y, {
        width: 145,
        ellipsis: true,
        lineBreak: false,
      });

      y += rowHeight;
    }

    y += 16;
    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor(colors.muted)
      .text("Verified payments via Paystack · MatricPay", 40, y);

    doc.end();

    const buffer = await done;
    const filename = `${campaign.slug || campaign.id}-paid-students.pdf`;

    return {
      filename,
      buffer,
      contentType: "application/pdf",
    };
  }
}

export const campaignExportService = new CampaignExportService();