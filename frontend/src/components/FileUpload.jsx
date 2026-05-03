import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

export default function FileUpload({ onFileAccepted, fileName, disabled, maxSize = 50 * 1024 * 1024 }) {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      onFileAccepted(acceptedFiles[0])
    }
  }, [onFileAccepted])

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'], 'application/vnd.ms-excel': ['.csv'] },
    maxFiles: 1,
    maxSize,
    disabled,
  })

  return (
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragActive
            ? 'border-blue-500 bg-blue-50 scale-[1.02]'
            : fileName
            ? 'border-teal-400 bg-teal-50'
            : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 bg-slate-50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />

        {fileName ? (
          <div className="space-y-2">
            <div className="w-12 h-12 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-teal-700 text-sm">{fileName}</p>
              <p className="text-teal-500 text-xs mt-0.5">Click or drag to replace</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto transition-colors ${
              isDragActive ? 'bg-blue-100' : 'bg-slate-100'
            }`}>
              <svg className={`w-6 h-6 ${isDragActive ? 'text-blue-600' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-slate-700 text-sm">
                {isDragActive ? 'Drop your CSV here' : 'Upload CSV File'}
              </p>
              <p className="text-slate-400 text-xs mt-1">Drag & drop or click to browse • CSV only • Max {Math.round(maxSize / (1024 * 1024))}MB</p>
            </div>
          </div>
        )}
      </div>

      {fileRejections.length > 0 && (
        <p className="text-rose-500 text-xs flex items-center gap-1">
          <span>⚠️</span>
          <span>File rejected. Ensure it is a CSV and under {Math.round(maxSize / (1024 * 1024))}MB.</span>
        </p>
      )}
    </div>
  )
}
