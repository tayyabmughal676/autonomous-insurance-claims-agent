import React, { useState } from "react";
import { CheckCircle2, Clock, AlertCircle, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { ClaimProcessingState, NodeStatus } from "../types/claim";

interface AgentTraceProps {
  processingState?: ClaimProcessingState;
  isProcessing?: boolean;
}

export const AgentTrace: React.FC<AgentTraceProps> = ({ processingState, isProcessing }) => {
  const nodes = processingState?.nodes || [];
  const [expandedNodeId, setExpandedNodeId] = useState<string | null>(nodes[0]?.node_id || null);

  const getNodeIcon = (status: NodeStatus) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />;
      case "RUNNING":
        return <Loader2 className="h-3.5 w-3.5 text-blue-400 animate-spin" />;
      case "FAILED":
        return <AlertCircle className="h-3.5 w-3.5 text-rose-400" />;
      default:
        return <Clock className="h-3.5 w-3.5 text-slate-600" />;
    }
  };

  const getStatusBadge = (status: NodeStatus) => {
    switch (status) {
      case "COMPLETED":
        return <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-medium">DONE</span>;
      case "RUNNING":
        return <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-mono font-medium animate-pulse">RUNNING</span>;
      case "FAILED":
        return <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-mono font-medium">FAILED</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded bg-[#161B26] text-slate-500 text-[10px] font-mono font-medium">QUEUED</span>;
    }
  };

  if (!processingState && !isProcessing) {
    return (
      <div className="p-8 text-center bg-[#0E121A] rounded-xl border border-white/[0.06] text-xs text-slate-500">
        Click <strong className="text-slate-300">Run AI Pipeline</strong> to initiate StateGraph multi-agent execution.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {nodes.map((node, index) => {
        const isExpanded = expandedNodeId === node.node_id;

        return (
          <div
            key={node.node_id}
            className="bg-[#0E121A] rounded-xl border border-white/[0.08] hover:border-white/[0.12] transition overflow-hidden text-xs"
          >
            {/* Header Row */}
            <div
              onClick={() => setExpandedNodeId(isExpanded ? null : node.node_id)}
              className="p-3 cursor-pointer flex items-center justify-between gap-3 bg-[#111520] hover:bg-[#141A28] transition"
            >
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-[11px] text-slate-500 w-4">{index + 1}.</span>
                {getNodeIcon(node.status)}
                <span className="font-medium text-slate-100">{node.agent_name}</span>
                <span className="font-mono text-[10px] text-slate-500 hidden sm:inline">[{node.node_id}]</span>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                {node.duration_ms !== undefined && (
                  <span className="font-mono text-[10px] text-slate-400">
                    {node.duration_ms}ms
                  </span>
                )}
                {getStatusBadge(node.status)}
                {isExpanded ? (
                  <ChevronUp className="h-3.5 w-3.5 text-slate-500" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
                )}
              </div>
            </div>

            {/* Expanded Body */}
            {isExpanded && (
              <div className="p-3 border-t border-white/[0.06] bg-[#090B10] space-y-2">
                {node.output_summary && (
                  <div className="p-2.5 rounded-lg bg-[#121622] border border-white/[0.04] text-slate-200">
                    <span className="text-[10px] font-mono uppercase text-blue-400 block mb-0.5">Outcome</span>
                    {node.output_summary}
                  </div>
                )}

                {node.thought_trace && node.thought_trace.length > 0 && (
                  <div className="p-2.5 rounded-lg bg-[#080A0E] border border-white/[0.04] font-mono text-[11px] text-slate-300 space-y-1">
                    {node.thought_trace.map((thought, tIdx) => (
                      <div key={tIdx} className="flex items-start gap-2">
                        <span className="text-blue-500 select-none">&gt;</span>
                        <span className={thought.includes("ALERT") || thought.includes("FLAGGED") ? "text-amber-300 font-medium" : ""}>
                          {thought}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
