'use client'

import React, { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react'

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

export default function PDFViewer({ 
  pdfUrl = '/sample.pdf', 
  width = 800 
}: { 
  pdfUrl?: string, 
  width?: number 
}) {
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [scale, setScale] = useState<number>(1)

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
  }

  const goToPrevPage = () => {
    setPageNumber(prevPage => Math.max(1, prevPage - 1))
  }

  const goToNextPage = () => {
    setPageNumber(prevPage => Math.min(numPages, prevPage + 1))
  }

  const zoomIn = () => {
    setScale(prevScale => Math.min(prevScale + 0.25, 2))
  }

  const zoomOut = () => {
    setScale(prevScale => Math.max(prevScale - 0.25, 0.5))
  }

  return (
    <div className="flex flex-col items-center space-y-4 p-4">
      <div className="border shadow-lg rounded-lg overflow-auto">
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          className="flex justify-center"
        >
          <Page 
            pageNumber={pageNumber} 
            width={width}
            scale={scale}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </Document>
      </div>

      <div className="flex items-center space-x-4">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={goToPrevPage} 
          disabled={pageNumber <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <span className="text-sm">
          Page {pageNumber} of {numPages}
        </span>

        <Button 
          variant="outline" 
          size="icon" 
          onClick={goToNextPage} 
          disabled={pageNumber >= numPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={zoomOut}
            disabled={scale <= 0.5}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>

          <span className="text-sm">{Math.round(scale * 100)}%</span>

          <Button 
            variant="outline" 
            size="icon" 
            onClick={zoomIn}
            disabled={scale >= 2}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}