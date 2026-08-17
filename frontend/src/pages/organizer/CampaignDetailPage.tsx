import { useParams } from "react-router-dom";
import { useDashboard, useCollectionTimeseries } from "../../hooks/useDashboard";
import { StatCard } from "../../components/ui/StatCard";
import { ActiveCampaignCard } from "../../components/organizer/ActiveCampaignCard";
import { RecentPaymentsList } from "../../components/organizer/RecentPaymentsList";
import { CollectionChart } from "../../components/organizer/CollectionChart";
import { formatNaira } from "../../lib/format";
import { BackLink } from "../../components/ui/BackLink";
import { CampaignDetailActions } from "../../components/organizer";
import { useStudents, useAddStudent, useImportStudentsCsv } from "../../hooks/useStudents";
import { StudentList, StudentForm, StudentImportForm } from "../../components/student";
import toast from "react-hot-toast";

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: studentsData, isLoading: studentsLoading } = useStudents(id);
  const addStudent = useAddStudent(id!);
  const importCsv = useImportStudentsCsv(id!);
  const students = Array.isArray(studentsData) ? studentsData : [];

  const { data, isLoading, isError } = useDashboard(id);
  const { data: timeseries, isLoading: isTimeseriesLoading } = useCollectionTimeseries(id);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--background)">
        <p className="text-(--text-muted) font-mono text-sm">Loading dashboard…</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--background)">
        <p className="text-(--text-muted) text-sm">Couldn't load this campaign.</p>
      </div>
    );
  }

  const { campaign, metrics, recentPayments } = data;

  return (
    <div className="min-h-screen bg-(--background) p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <BackLink to="/dashboard/campaigns" label="Back to campaigns" />
        
        {/* Title + actions together */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1
              className="text-2xl font-semibold text-(--text-primary)"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {campaign.title}
            </h1>
            <p className="mt-1 text-sm text-(--text-muted)">/{campaign.slug}</p>
          </div>

          <CampaignDetailActions campaign={campaign} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Collected" value={formatNaira(metrics.totalCollected, campaign.currency)} />
          <StatCard
            label="Collection Rate"
            value={`${metrics.collectionPercentage}%`}
            subtext={`${metrics.paidStudents} of ${metrics.totalStudents} paid`}
          />
          <StatCard
            label="Pending Amount"
            value={formatNaira(metrics.outstandingBalance, campaign.currency)}
            subtext={`${metrics.unpaidStudents} yet to pay`}
          />
          <StatCard
            label="Total Students"
            value={String(metrics.totalStudents)}
            subtext={metrics.flaggedPayments > 0 ? `${metrics.flaggedPayments} flagged for review` : undefined}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {isTimeseriesLoading || !timeseries ? (
              <div className="rounded-2xl border border-(--border) bg-(--surface) p-5 h-85 flex items-center justify-center">
                <p className="text-(--text-muted) text-sm">Loading chart…</p>
              </div>
            ) : (
              <CollectionChart data={timeseries} currency={campaign.currency} />
            )}
            <RecentPaymentsList payments={recentPayments} />
          </div>
          <div>
            <ActiveCampaignCard campaign={campaign} />
          </div>
        </div>

        {/* students  */}

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-(--text-primary)">Students</h2>

          <StudentImportForm
            isSubmitting={importCsv.isPending}
            onImport={async (file) => {
              try {
                await importCsv.mutateAsync(file);
                toast.success("Import started / completed");
              } catch (err: unknown) {
                const axiosError = err as { response?: { data?: { message?: string } } };
                toast.error(axiosError.response?.data?.message || "Import failed");
              }
            }}
          />

          <div className="rounded-2xl border border-(--border) bg-(--surface) p-5">
            <h3 className="mb-4 text-sm font-medium text-(--text-primary)">Add student</h3>
            <StudentForm
              isSubmitting={addStudent.isPending}
              onSubmit={async (values) => {
                try {
                  await addStudent.mutateAsync({
                    fullName: values.fullName,
                    matricNumber: values.matricNumber,
                    email: values.email || undefined,
                    phone: values.phone || undefined,
                    department: values.department || undefined,
                    level: values.level || undefined,
                  });
                  toast.success("Student added");
                } catch (err: unknown) {
                  const axiosError = err as { response?: { data?: { message?: string } } };
                  toast.error(axiosError.response?.data?.message || "Failed to add student");
                }
              }}
            />
          </div>

          <StudentList students={students} isLoading={studentsLoading} />
        </div>

      </div>
    </div>
  );
}