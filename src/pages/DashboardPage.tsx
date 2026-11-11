import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import EngineerCard from "../components/EngineerCard";
import WorkspaceCard from "../components/WorkspaceCard";
import RequestBadge from "../components/RequestBadge";
import useToggle from "../hooks/useToggle";

import type { Engineer, ApiWorkspace, ApiRequest } from "../types/index";
import { mockEngineers } from "../data/mockData";
import useUiStore from "../store/uiStore";
import { fetchWorkspaces, fetchRequests } from "../api/client";
import useAuthStore from "../store/authStore";
import { formatDate } from "../lib/formatDate";

// A small label for numbers and lists that are sample data, so nobody
// reads them as a real team or real infrastructure.
function SampleTag() {
  return (
    <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
      Sample
    </span>
  );
}

// Shown in a metric card while its number is loading.
function MetricSkeleton() {
  return (
    <span
      role="status"
      aria-label="Loading"
      className="mt-3 block h-7 w-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
    />
  );
}

function DashboardPage() {
  const [selectedEngineer, setSelectedEngineer] = useState<Engineer | null>(null);
  
  const { data: workspaces = [], isPending: workspacesPending, isError: workspacesError } = useQuery<ApiWorkspace[]>({
    queryKey: ["workspaces"],
    queryFn: fetchWorkspaces,
  });

  // Provision requests are protected, so only ask for them when signed in.
  // Otherwise every visit would make a request that ends in 401.
  const token = useAuthStore((state) => state.token);
  const isSignedIn = Boolean(token);

  const { data: requests = [], isPending: requestsPending } = useQuery<ApiRequest[]>({
    queryKey: ["requests", token],
    queryFn: fetchRequests,
    enabled: isSignedIn,
  });
  
  const latestRequest = requests.length > 0 ? requests[requests.length - 1] : null;
  const pendingRequestsCount = requests.filter(
    (r) => r.status === "Pending Review" || (r.status as unknown) === 0 || r.status === "0"
  ).length;

  const searchTerm = useUiStore((state) => state.searchTerm);
  const setSearchTerm = useUiStore((state) => state.setSearchTerm);
  
  const [showRequest, toggleRequest] = useToggle(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  };

  const filteredWorkspaces = workspaces.filter((w) =>
    w.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage your infrastructure and team</p>
        </div>
      </div>

      {/* What this demo is, in one line, before anyone has to ask. */}
      <p
        role="note"
        className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-200"
      >
        Demo project: the workspaces and the team list are sample data. Provision
        requests are saved to the database, but nothing is created in a real cloud account.
      </p>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Workspaces</h3>
          {workspacesPending ? (
            <MetricSkeleton />
          ) : (
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{workspacesError ? "—" : workspaces.length}</p>
          )}
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Team Members<SampleTag /></h3>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{mockEngineers.length}</p>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-6 shadow-sm dark:border-blue-900/50 dark:bg-blue-900/20">
          <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400">Pending Requests</h3>
          {!isSignedIn ? (
            <p className="mt-3 text-sm text-blue-700 dark:text-blue-300">Log in to see your requests</p>
          ) : requestsPending ? (
            <MetricSkeleton />
          ) : (
            <p className="mt-2 text-3xl font-bold text-blue-700 dark:text-blue-300">{pendingRequestsCount}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column: Workspaces */}
        <div className="xl:col-span-2 space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-800 dark:bg-gray-800/50 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Active Workspaces</h2>
              <input 
                value={searchTerm}
                onChange={handleSearchChange}
                type="text"
                placeholder="Filter workspaces..."
                className="w-48 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
            
            <div className="p-6">
              {workspacesPending ? (
                <div className="animate-pulse flex space-x-4">
                  <div className="flex-1 space-y-4 py-1">
                    <div className="h-2 bg-gray-200 rounded"></div>
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="h-2 bg-gray-200 rounded col-span-2"></div>
                        <div className="h-2 bg-gray-200 rounded col-span-1"></div>
                      </div>
                      <div className="h-2 bg-gray-200 rounded"></div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Connecting to the API. The first load after a quiet period can take a few seconds.
                    </p>
                  </div>
                </div>
              ) : workspacesError ? (
                <p className="text-red-500">Failed to load workspaces.</p>
              ) : filteredWorkspaces.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No workspaces found.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredWorkspaces.map(ws => (
                    <WorkspaceCard key={ws.id} workspace={ws} variant="compact" />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Engineers & Requests */}
        <div className="space-y-6">
          
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-800 dark:bg-gray-800/50">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Engineering Team<SampleTag /></h2>
            </div>
            <div className="p-6 space-y-4">
              {mockEngineers.map(eng => (
                <EngineerCard key={eng.id} engineer={eng} onSelect={setSelectedEngineer} />
              ))}
              
              {selectedEngineer && (
                <div className="mt-4 rounded-lg bg-green-50 p-3 border border-green-200 dark:bg-green-900/20 dark:border-green-800/30">
                  <p className="text-sm font-medium text-green-800 dark:text-green-400">
                    Selected: {selectedEngineer.name}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-800 dark:bg-gray-800/50 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Request</h2>
              <button 
                onClick={toggleRequest} 
                className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {showRequest ? "Hide" : "Show"}
              </button>
            </div>
            
            {showRequest && (
              <div className="p-6">
                {!isSignedIn ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Log in to see your latest request.</p>
                ) : latestRequest ? (
                  <RequestBadge request={latestRequest}>
                    <p className="text-xs mt-1 text-gray-500">Requested: {formatDate(latestRequest.requestedAt)}</p>
                  </RequestBadge>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No recent requests.</p>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
