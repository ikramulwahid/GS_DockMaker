import React from 'react';
import { Image as ImageIcon } from 'lucide-react';

export function DocumentPageMockup() {
  return (
    <article
      aria-label="A4 Portrait Document Page Mockup"
      className="w-full max-w-[595px] min-h-[842px] mx-auto bg-white border border-slate-200/90 shadow-xs rounded-[2px] px-10 py-12 sm:px-14 sm:py-14 flex flex-col justify-between text-slate-900"
    >
      {/* Main Page Body Content */}
      <div className="space-y-6">
        {/* Document Header & Metadata */}
        <header className="border-b border-slate-200 pb-4 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono tabular-nums">
            <span>Technical Report</span>
            <span>2026-10-09</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-snug">
            Q4 Infrastructure Architecture Specification
          </h1>
          <div className="text-xs text-slate-600">
            <span>Elena Rostova, Principal Systems Architect</span>
          </div>
        </header>

        {/* Heading */}
        <section className="space-y-2.5">
          <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
            1. Project Overview
          </h2>

          {/* Paragraph */}
          <p className="text-xs text-slate-700 leading-relaxed">
            This technical specification outlines the multi-region consensus architecture and deterministic failover protocols scheduled for fourth-quarter deployment. The objective is to maintain sub-millisecond read availability while enforcing strict transactional serializability across distributed storage nodes.
          </p>

          {/* Bulleted List */}
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-700 leading-relaxed pt-1">
            <li>
              Automated quorum rebalancing across three primary availability zones with zero manual intervention.
            </li>
            <li>
              Cryptographic ledger verification for every cross-region state snapshot prior to replication commit.
            </li>
          </ul>
        </section>

        {/* Formula Placeholder */}
        <section aria-label="Mathematical Expression" className="py-1">
          <div className="py-3 px-4 bg-slate-50/70 border border-slate-200 rounded-[2px] flex items-center justify-between">
            <span className="text-xs font-mono text-slate-800">
              L(q) = τ_net + max(t_commit) + ∑ (w_i · δ_sync)
            </span>
            <span className="text-[11px] font-mono tabular-nums text-slate-500">
              (1.1)
            </span>
          </div>
        </section>

        {/* Small Table */}
        <section aria-label="Performance Thresholds Table" className="space-y-1.5">
          <div className="text-[11px] font-medium text-slate-600">
            Table 1.1 — Consensus Performance Thresholds
          </div>
          <table className="w-full text-left border-collapse text-xs border border-slate-200">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-800">
                <th className="py-2 px-3 font-semibold border-r border-slate-200">
                  System Metric
                </th>
                <th className="py-2 px-3 font-semibold text-right">
                  Target Threshold
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              <tr>
                <td className="py-2 px-3 border-r border-slate-200">
                  Replication Latency (p99)
                </td>
                <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-900">
                  14.2 ms
                </td>
              </tr>
              <tr>
                <td className="py-2 px-3 border-r border-slate-200">
                  Failover Recovery Window
                </td>
                <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-900">
                  &lt; 250 ms
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Image Placeholder */}
        <figure className="space-y-1.5">
          <div className="h-36 w-full bg-slate-50 border border-slate-200 rounded-[2px] flex flex-col items-center justify-center gap-1.5 p-4 text-center">
            <ImageIcon className="w-5 h-5 text-slate-400 stroke-[1.5]" />
            <span className="text-xs font-medium text-slate-600">
              Multi-Region Consensus Topology Diagram
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              [Architecture Figure 1.1]
            </span>
          </div>
          <figcaption className="text-[11px] text-slate-500 text-center">
            Figure 1.1: Synchronous replication rings across primary availability zones.
          </figcaption>
        </figure>

        {/* Signature Area */}
        <section aria-label="Document Authorization Signature" className="pt-6">
          <div className="flex items-end justify-between gap-8 pt-4 border-t border-slate-100">
            <div className="w-56 space-y-1">
              <div className="border-b border-slate-400 pb-1">
                <span className="text-sm italic font-serif text-slate-700">
                  Elena Rostova
                </span>
              </div>
              <div className="text-[11px] font-medium text-slate-800">
                Elena Rostova
              </div>
              <div className="text-[10px] text-slate-500">
                Principal Systems Architect · Authorization Sign-off
              </div>
            </div>

            <div className="text-right space-y-1">
              <div className="text-[11px] font-mono tabular-nums text-slate-700 border-b border-slate-300 pb-1 px-2">
                2026-10-09
              </div>
              <div className="text-[10px] text-slate-500">Date Approved</div>
            </div>
          </div>
        </section>
      </div>

      {/* Discreet Page Number at the Bottom */}
      <footer className="pt-8 mt-8 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono tabular-nums">
        <span>A4 Portrait · 210 × 297 mm</span>
        <span>Page 1 of 1</span>
      </footer>
    </article>
  );
}
