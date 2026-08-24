import { api } from "./api";

export async function downloadCampaignExport(
  campaignId: string,
  format: "csv" | "pdf"
) {
  const res = await api.get(`/campaigns/${campaignId}/payments/export/${format}`, {
    responseType: "blob",
  });

  const contentDisposition = res.headers["content-disposition"] as string | undefined;
  const match = contentDisposition?.match(/filename="?([^"]+)"?/);
  const filename =
    match?.[1] ||
    `paid-students.${format === "pdf" ? "pdf" : "csv"}`;

  const url = window.URL.createObjectURL(res.data);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}