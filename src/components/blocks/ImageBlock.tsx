import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Link2,
  Upload,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlertTriangle,
} from 'lucide-react';
import { ImageBlockData } from '../../types/document';

interface ImageBlockProps {
  block: ImageBlockData;
  onChange: (updated: Partial<ImageBlockData>) => void;
}

export function ImageBlock({ block, onChange }: ImageBlockProps) {
  const [loadError, setLoadError] = useState(false);

  const align = block.align || 'center';
  const widthPercent = block.widthPercent || 100;

  const widthOptions = [
    { value: 100, label: '100% (Full Width)' },
    { value: 75, label: '75%' },
    { value: 50, label: '50% (Half)' },
    { value: 33, label: '33% (One Third)' },
  ];

  // Local file picker handler (creates temporary local preview object URL)
  const handleLocalFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setLoadError(false);
      onChange({
        url: objectUrl,
        altText: block.altText || file.name,
        caption: block.caption || file.name.replace(/\.[^/.]+$/, ''),
      });
    }
  };

  const handleUrlChange = (val: string) => {
    setLoadError(false);
    onChange({ url: val });
  };

  const alignContainerClass =
    align === 'left' ? 'mr-auto' : align === 'right' ? 'ml-auto' : 'mx-auto';

  return (
    <div className="space-y-3">
      {/* Caption, Sizing, and Alignment controls */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-2 items-end">
        <div className="space-y-1">
          <label htmlFor={`img-caption-${block.id}`} className="block text-[11px] font-medium text-slate-500">
            Figure Caption:
          </label>
          <input
            id={`img-caption-${block.id}`}
            type="text"
            value={block.caption}
            onChange={(e) => onChange({ caption: e.target.value })}
            placeholder="Figure 1.1 — Diagram description"
            className="w-full px-2.5 py-1.5 text-xs text-slate-800 bg-white border border-slate-200 rounded focus:outline-none focus:border-blue-600 transition-colors"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor={`img-width-${block.id}`} className="block text-[11px] font-medium text-slate-500">
            Size:
          </label>
          <select
            id={`img-width-${block.id}`}
            value={widthPercent}
            onChange={(e) => onChange({ widthPercent: Number(e.target.value) })}
            className="px-2 py-1.5 text-xs text-slate-800 bg-white border border-slate-200 rounded focus:outline-none focus:border-blue-600 transition-colors"
          >
            {widthOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <span className="block text-[11px] font-medium text-slate-500">Align:</span>
          <div className="inline-flex items-center rounded border border-slate-200 bg-slate-50 p-0.5">
            <button
              type="button"
              onClick={() => onChange({ align: 'left' })}
              title="Align Left"
              className={`p-1 rounded transition-colors cursor-pointer ${
                align === 'left' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onChange({ align: 'center' })}
              title="Align Center"
              className={`p-1 rounded transition-colors cursor-pointer ${
                align === 'center' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onChange({ align: 'right' })}
              title="Align Right"
              className={`p-1 rounded transition-colors cursor-pointer ${
                align === 'right' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* URL or Local Device Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
        <div className="space-y-1">
          <label htmlFor={`img-url-${block.id}`} className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
            <Link2 className="w-3 h-3 text-slate-400" />
            <span>Image URL or Source:</span>
          </label>
          <input
            id={`img-url-${block.id}`}
            type="text"
            value={block.url || ''}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="https://images.example.com/diagram.png or choose local file"
            className="w-full px-2 py-1 text-xs text-slate-800 bg-white border border-slate-200 rounded focus:outline-none focus:border-blue-600 transition-colors"
          />
        </div>

        <div className="space-y-1">
          <span className="block text-[11px] font-medium text-slate-500">Local File:</span>
          <label className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded hover:bg-slate-50 cursor-pointer transition-colors whitespace-nowrap">
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Choose Image</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleLocalFileSelect}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Alt Text Input */}
      <div className="space-y-1">
        <label htmlFor={`img-alt-${block.id}`} className="block text-[11px] font-medium text-slate-500">
          Accessibility Alt Text:
        </label>
        <input
          id={`img-alt-${block.id}`}
          type="text"
          value={block.altText}
          onChange={(e) => onChange({ altText: e.target.value })}
          placeholder="Describe graphic for screen readers and export..."
          className="w-full px-2 py-1 text-xs text-slate-800 bg-white border border-slate-200 rounded focus:outline-none focus:border-blue-600 transition-colors"
        />
      </div>

      {/* Visual Image Preview, Error State, or Neutral Placeholder */}
      <div
        className={`rounded border border-slate-200 bg-slate-50 overflow-hidden transition-all ${alignContainerClass}`}
        style={{ width: `${widthPercent}%` }}
      >
        {block.url ? (
          loadError ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded text-center text-xs text-amber-800 space-y-1">
              <div className="flex items-center justify-center gap-1.5 font-semibold text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Unable to load image from URL</span>
              </div>
              <p className="text-[11px] text-amber-700">
                Verify the image address or select a local image from your device.
              </p>
            </div>
          ) : (
            <div className="relative group bg-white flex items-center justify-center p-1">
              <img
                src={block.url}
                alt={block.altText || block.caption || 'Document Graphic'}
                referrerPolicy="no-referrer"
                onError={() => setLoadError(true)}
                className="w-full h-auto max-h-56 object-contain rounded"
              />
            </div>
          )
        ) : (
          <div className="h-28 w-full border border-dashed border-slate-300 rounded flex flex-col items-center justify-center gap-1.5 p-3 text-center">
            <ImageIcon className="w-5 h-5 text-slate-400 stroke-[1.75]" />
            <span className="text-xs font-medium text-slate-600 truncate max-w-full px-2">
              {block.caption || 'Image Diagram Placeholder'}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Width: {widthPercent}% · Alignment: {align} · No image selected
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
