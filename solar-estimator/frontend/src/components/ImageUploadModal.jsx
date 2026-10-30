import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

export default function ImageUploadModal({ isOpen, onClose, onUploadProcess, loading }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [segmentResult, setSegmentResult] = useState(null);
  const [pixelResolution, setPixelResolution] = useState(0.25);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setSegmentResult(null);
    }
  };

  const handleProcess = async () => {
    if (!selectedFile) return;
    try {
      const result = await onUploadProcess(selectedFile, { pixelResolution });
      setSegmentResult(result);
    } catch (err) {
      console.error("Upload error:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white border border-slate-200 w-full max-w-3xl rounded-2xl p-6 relative max-h-[90vh] overflow-y-auto shadow-2xl text-slate-800 font-roboto">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-5">
          <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600 border border-blue-200">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              AERIAL IMAGE SEGMENTATION LAB
            </h2>
            <p className="text-xs text-slate-500">
              Upload custom drone or aerial photos to extract rooftop contours and evaluate solar potential
            </p>
          </div>
        </div>

        {/* Upload Zone */}
        {!previewUrl ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-blue-50/30 transition-colors text-center"
          >
            <ImageIcon className="w-12 h-12 text-slate-400 mb-3" />
            <p className="text-sm font-semibold text-slate-800">
              Click to select or drag and drop an aerial/satellite image
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Supports RGB formats (JPG, PNG, WebP) • Optimized for 512×512 to 2048×2048 tiles
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Image Comparison Canvas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Original Preview */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col items-center">
                <span className="text-xs font-semibold text-slate-600 mb-2">RAW AERIAL INPUT</span>
                <div className="relative w-full aspect-square bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center">
                  <img src={previewUrl} alt="Raw Input" className="w-full h-full object-cover" />
                </div>
              </div>

              {/* Segmentation Mask Overlay */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col items-center relative">
                <span className="text-xs font-bold text-blue-600 mb-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  PREDICTION CONTOUR OVERLAY
                </span>
                <div className="relative w-full aspect-square bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center">
                  <img src={previewUrl} alt="Raw Base" className="w-full h-full object-cover" />
                  {segmentResult?.mask_png_base64 && (
                    <img
                      src={segmentResult.mask_png_base64}
                      alt="Segmentation Mask"
                      className="absolute inset-0 w-full h-full object-cover opacity-90 animate-fade-in"
                    />
                  )}
                  {!segmentResult && !loading && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center text-xs text-slate-500 p-4 text-center">
                      Click "Run Extraction" below to segment rooftop contours
                    </div>
                  )}
                  {loading && (
                    <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center text-xs text-blue-600 gap-2">
                      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>PROCESSING SEGMENTATION...</span>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 border border-slate-200 p-3 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-700 font-medium">Ground Resolution:</span>
                <select
                  value={pixelResolution}
                  onChange={(e) => setPixelResolution(parseFloat(e.target.value))}
                  className="bg-white border border-slate-300 text-xs text-slate-800 px-3 py-1.5 rounded-lg focus:outline-none focus:border-blue-500 shadow-2xs"
                >
                  <option value={0.10}>Drone High-Res (0.10 m/px)</option>
                  <option value={0.25}>Aerial Orthophoto (0.25 m/px)</option>
                  <option value={0.50}>Satellite Standard (0.50 m/px)</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                    setSegmentResult(null);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 px-3 py-1.5 transition-colors font-medium"
                >
                  Clear Image
                </button>
                <button
                  type="button"
                  onClick={handleProcess}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-4 py-2 rounded-lg transition-all shadow-sm"
                >
                  <span>{loading ? 'Processing...' : 'Run Extraction'}</span>
                </button>
              </div>
            </div>

            {/* Results Pill Grid */}
            {segmentResult && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 border border-slate-200 p-4 rounded-xl animate-fade-in">
                <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-xs text-slate-500 uppercase font-medium">Usable Roof Area</span>
                  <div className="text-lg font-bold text-slate-900 mt-0.5">{segmentResult.usable_area_m2} m²</div>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-xs text-emerald-600 uppercase font-medium">Est. Annual Yield</span>
                  <div className="text-lg font-bold text-emerald-600 mt-0.5">{segmentResult.annual_energy_kwh.toLocaleString()} kWh</div>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-xs text-emerald-600 uppercase font-medium">Carbon Offset</span>
                  <div className="text-lg font-bold text-emerald-600 mt-0.5">{segmentResult.carbon_offset_tons} Tons/yr</div>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-xs text-blue-600 uppercase font-medium">Payback & ROI</span>
                  <div className="text-lg font-bold text-blue-600 mt-0.5">{segmentResult.payback_years} Yrs ({segmentResult.roi_percentage}% ROI)</div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
