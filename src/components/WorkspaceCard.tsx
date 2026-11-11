import type { ApiWorkspace } from "../types/index";
import { formatDate } from "../lib/formatDate";

interface WorkspaceCardProps {
  workspace: ApiWorkspace;
  variant?: "default" | "compact"; // NEW: optional variant prop
}

function WorkspaceCard({ workspace, variant = "default" }: WorkspaceCardProps) {
  const isCompact = variant === "compact";

  return (
    <div className={`rounded-lg border border-blue-500 bg-white shadow-sm dark:bg-gray-800 dark:border-blue-700 ${isCompact ? "p-3" : "p-5"}`}>
      <h3 className={`font-bold text-gray-900 dark:text-white ${isCompact ? "text-sm" : "text-lg"}`}>
        {workspace.title}
      </h3>
      
      {/* Hide description if compact */}
      {!isCompact && (
        <p className="text-gray-600 dark:text-gray-300 mt-1">{workspace.description}</p>
      )}
      
      <small className="block mt-2 text-gray-500 dark:text-gray-400">
        Created: {formatDate(workspace.createdAt)}
      </small>
    </div>
  );
}

export default WorkspaceCard;