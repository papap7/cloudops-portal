import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { requestSchema } from "../schemas/requestSchema";
import type { RequestFormValues } from "../schemas/requestSchema";
import RequestBadge from "../components/RequestBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ApiRequest, ApiWorkspace } from "../types/index";
import { fetchRequests, createRequest, fetchWorkspaces } from "../api/client";

function RequestsPage() {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    mode: "onBlur",
    defaultValues: { resourceType: "", workspaceId: 101 },
  });

  const { data: requests = [], isPending, isError, error } = useQuery<ApiRequest[]>({
    queryKey: ["requests"],
    queryFn: fetchRequests,
  });

  const { data: workspaces = [] } = useQuery<ApiWorkspace[]>({
    queryKey: ["workspaces"],
    queryFn: fetchWorkspaces,
  });

  const addRequest = useMutation({
    mutationFn: createRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      reset();
    },
  });

    const onSubmit = (values: RequestFormValues): void => {
    addRequest.mutate({
      workspaceId: values.workspaceId,
      resourceType: values.resourceType,
    });
  };


  if (isPending) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center space-x-3 text-gray-500">
          <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
          <span className="text-lg font-medium">Loading requests...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl bg-red-50 p-6 border border-red-100 text-red-700 dark:bg-red-900/20 dark:border-red-800/30">
        <h3 className="font-semibold text-lg mb-2">Error Loading Requests</h3>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      {/* Header Section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Provision Requests</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Submit and track requests for new cloud infrastructure resources.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Form */}
        <div className="lg:col-span-1">
          <form onSubmit={handleSubmit(onSubmit)} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">New Request</h3>
            
            <div className="space-y-4">
              <div className="grid gap-1.5">
                <Label htmlFor="resourceType" className="text-foreground">
                  Resource Type
                </Label>
                <Input 
                  id="resourceType"
                  {...register("resourceType")}
                  aria-invalid={errors.resourceType ? true : undefined}
                  placeholder="e.g. AWS RDS PostgreSQL"
                />
                {errors.resourceType && (
                  <p className="text-sm text-red-600">{errors.resourceType.message}</p>
                )}
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="workspaceId" className="text-foreground">
                  Target Workspace
                </Label>
                <select 
                  id="workspaceId"
                  {...register("workspaceId", { valueAsNumber: true })}
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  {workspaces.map((ws) => (
                    <option key={ws.id} value={ws.id}>
                      {ws.id} - {ws.title}
                    </option>
                  ))}
                </select>
                {errors.workspaceId && (
                  <p className="text-sm text-red-600">{errors.workspaceId.message}</p>
                )}
              </div>

              {addRequest.isError && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
                  {addRequest.error.message}
                </div>
              )}

              <Button 
                type="submit"
                disabled={addRequest.isPending}
                className="w-full mt-4 justify-center"
              >
                {addRequest.isPending ? "Submitting..." : "Submit Provision Request"}
              </Button>
            </div>
          </form>
        </div>

        {/* Right Column: Feed */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-800 dark:bg-gray-800/50">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
            </div>
            
            <div className="p-6">
              {requests.length === 0 ? (
                <div className="text-center py-12">
                  <span className="text-4xl">📭</span>
                  <p className="mt-4 text-gray-500 dark:text-gray-400">No provision requests yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Map through requests in reverse to show newest first */}
                  {[...requests].reverse().map((req) => (
                    <RequestBadge key={req.id} request={req}>
                      <div className="flex justify-between items-center text-sm mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                        <span className="text-gray-500 dark:text-gray-400">
                          Requested on: {new Date(req.requestedAt).toLocaleString()}
                        </span>
                        <span className="text-xs font-medium px-2 py-1 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                          Workspace #{req.workspaceId}
                        </span>
                      </div>
                    </RequestBadge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default RequestsPage;
