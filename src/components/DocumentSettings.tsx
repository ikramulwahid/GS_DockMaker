import React from 'react';
import { Sliders, Maximize2, Compass, LayoutGrid, Hash } from 'lucide-react';
import { DocumentMetadata } from '../types/document';
import { HeadingNumberingStyle, DEFAULT_HEADING_NUMBERING_SETTINGS } from '../types/numbering';

interface DocumentSettingsProps {
  metadata: DocumentMetadata;
  onChange: (updated: Partial<DocumentMetadata>) => void;
}

export function DocumentSettings({ metadata, onChange }: DocumentSettingsProps) {
  const numberingSettings = metadata.headingNumbering || DEFAULT_HEADING_NUMBERING_SETTINGS;

  const handleToggleNumbering = (enabled: boolean) => {
    onChange({
      headingNumbering: {
        ...numberingSettings,
        enabled,
        style: enabled && numberingSettings.style === 'off' ? 'decimal' : numberingSettings.style,
      },
    });
  };

  const handleStyleChange = (style: HeadingNumberingStyle) => {
    onChange({
      headingNumbering: {
        ...numberingSettings,
        style,
        enabled: style !== 'off',
      },
    });
  };

  const handleStartNumberChange = (startNumber: number) => {
    onChange({
      headingNumbering: {
        ...numberingSettings,
        startNumber: Math.max(1, startNumber),
      },
    });
  };

  const handleMaxLevelChange = (maxLevel: number) => {
    onChange({
      headingNumbering: {
        ...numberingSettings,
        maxLevel: Math.min(6, Math.max(1, maxLevel)),
      },
    });
  };

  return (
    <section aria-labelledby="doc-settings-heading" className="space-y-3.5">
      <div className="flex items-center gap-2">
        <Sliders className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        <h2
          id="doc-settings-heading"
          className="text-xs font-semibold text-slate-900 tracking-tight"
        >
          Document Settings
        </h2>
      </div>

      <div className="space-y-3">
        {/* Page Size Selector */}
        <div className="space-y-1">
          <label
            htmlFor="page-size"
            className="flex items-center gap-1.5 text-xs font-medium text-slate-600"
          >
            <Maximize2 className="w-3 h-3 text-slate-400" />
            <span>Page Size</span>
          </label>
          <select
            id="page-size"
            value={metadata.pageSize}
            onChange={(e) =>
              onChange({ pageSize: e.target.value as DocumentMetadata['pageSize'] })
            }
            className="w-full px-2.5 py-1.5 text-xs text-slate-900 bg-white border border-slate-200 rounded-md focus:outline-none focus:border-blue-600 transition-colors"
          >
            <option value="A4">A4 (210 × 297 mm)</option>
            <option value="Letter">US Letter (8.5 × 11 in)</option>
            <option value="Legal">US Legal (8.5 × 14 in)</option>
            <option value="A5">A5 (148 × 210 mm)</option>
          </select>
        </div>

        {/* Page Orientation Selector */}
        <div className="space-y-1">
          <label
            htmlFor="page-orientation"
            className="flex items-center gap-1.5 text-xs font-medium text-slate-600"
          >
            <Compass className="w-3 h-3 text-slate-400" />
            <span>Page Orientation</span>
          </label>
          <select
            id="page-orientation"
            value={metadata.pageOrientation}
            onChange={(e) =>
              onChange({
                pageOrientation: e.target.value as DocumentMetadata['pageOrientation'],
              })
            }
            className="w-full px-2.5 py-1.5 text-xs text-slate-900 bg-white border border-slate-200 rounded-md focus:outline-none focus:border-blue-600 transition-colors"
          >
            <option value="Portrait">Portrait</option>
            <option value="Landscape">Landscape</option>
          </select>
        </div>

        {/* Page Margin Selector */}
        <div className="space-y-1">
          <label
            htmlFor="page-margins"
            className="flex items-center gap-1.5 text-xs font-medium text-slate-600"
          >
            <LayoutGrid className="w-3 h-3 text-slate-400" />
            <span>Page Margins</span>
          </label>
          <select
            id="page-margins"
            value={metadata.pageMargins}
            onChange={(e) =>
              onChange({
                pageMargins: e.target.value as DocumentMetadata['pageMargins'],
              })
            }
            className="w-full px-2.5 py-1.5 text-xs text-slate-900 bg-white border border-slate-200 rounded-md focus:outline-none focus:border-blue-600 transition-colors"
          >
            <option value="Standard">Standard (25.4 mm / 1 in)</option>
            <option value="Narrow">Narrow (12.7 mm / 0.5 in)</option>
            <option value="Wide">Wide (38.1 mm / 1.5 in)</option>
            <option value="Academic">Academic Binding (Left 35 mm)</option>
          </select>
        </div>

        {/* Automatic Heading Numbering Configuration */}
        <div className="pt-2 border-t border-slate-200/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="heading-numbering-toggle"
              className="flex items-center gap-1.5 text-xs font-medium text-slate-700 cursor-pointer"
            >
              <Hash className="w-3.5 h-3.5 text-slate-400" />
              <span>Heading Numbering</span>
            </label>
            <input
              id="heading-numbering-toggle"
              type="checkbox"
              checked={numberingSettings.enabled && numberingSettings.style !== 'off'}
              onChange={(e) => handleToggleNumbering(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
          </div>

          {numberingSettings.enabled && numberingSettings.style !== 'off' && (
            <div className="space-y-2.5 pl-1 pt-0.5">
              {/* Numbering Style Selector */}
              <div className="space-y-1">
                <label
                  htmlFor="numbering-style"
                  className="text-[11px] font-medium text-slate-600"
                >
                  Numbering Style
                </label>
                <select
                  id="numbering-style"
                  value={numberingSettings.style}
                  onChange={(e) =>
                    handleStyleChange(e.target.value as HeadingNumberingStyle)
                  }
                  className="w-full px-2 py-1 text-xs text-slate-900 bg-white border border-slate-200 rounded focus:outline-none focus:border-blue-600"
                >
                  <option value="decimal">Hierarchical (1, 1.1, 1.1.1)</option>
                  <option value="decimal-period">Trailing Period (1., 1.1., 1.1.1.)</option>
                  <option value="parenthesized">Parenthesized ((1), (1.1))</option>
                  <option value="roman">Roman Top-Level (I, I.1, II)</option>
                  <option value="alphabetical">Alphabetical Top-Level (A, A.1, B)</option>
                </select>
              </div>

              {/* Numbered Levels & Start Number row */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label
                    htmlFor="max-numbered-level"
                    className="text-[11px] font-medium text-slate-600 truncate block"
                    title="Levels to number"
                  >
                    Number Levels
                  </label>
                  <select
                    id="max-numbered-level"
                    value={numberingSettings.maxLevel ?? 6}
                    onChange={(e) => handleMaxLevelChange(Number(e.target.value))}
                    className="w-full px-2 py-1 text-xs text-slate-900 bg-white border border-slate-200 rounded focus:outline-none focus:border-blue-600"
                  >
                    <option value={1}>H1 only</option>
                    <option value={2}>H1 – H2</option>
                    <option value={3}>H1 – H3</option>
                    <option value={4}>H1 – H4</option>
                    <option value={5}>H1 – H5</option>
                    <option value={6}>H1 – H6 (All)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="start-number"
                    className="text-[11px] font-medium text-slate-600 truncate block"
                    title="Starting number for Heading 1"
                  >
                    Start From
                  </label>
                  <input
                    id="start-number"
                    type="number"
                    min={1}
                    max={999}
                    value={numberingSettings.startNumber ?? 1}
                    onChange={(e) => handleStartNumberChange(Number(e.target.value) || 1)}
                    className="w-full px-2 py-1 text-xs text-slate-900 bg-white border border-slate-200 rounded focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
