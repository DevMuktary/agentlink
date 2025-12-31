'use client';

import { useState } from 'react';
import DocsCodeBlock from '@/components/DocsCodeBlock';
import { ChevronRight, Hash, Key, Code2, AlertCircle } from 'lucide-react';

// --- DATA: Full API Reference for NIN ---
const ninEndpoints = [
  // 1. NIN VERIFICATION (BY ID)
  {
    id: 'verify-id',
    title: 'NIN Verification (By ID)',
    method: 'POST',
    url: '/api/v1/identity/nin-verify',
    description: 'Verify a user identity using their 11-digit NIN Number. This is a synchronous request that returns results immediately.',
    params: [
      { name: 'nin', type: 'string', required: true, desc: 'The 11-digit NIN Number' },
      { name: 'reference', type: 'string', required: false, desc: 'Your unique client reference' }
    ],
    codes: null,
    body: { 
      "nin": "12345678901",
      "reference": "my-ref-001" 
    },
    response: {
      "status": true,
      "message": "Success",
      "data": {
        "firstName": "Musa",
        "surname": "Ali",
        "middleName": "Bello",
        "dateOfBirth": "1990-01-01",
        "gender": "m",
        "mobile": "08012345678",
        "photo": "/9j/4AAQSkZJRg...",
        "address": "No 1 Lagos Way"
      }
    }
  },

  // 2. NIN VERIFICATION (BY PHONE)
  {
    id: 'verify-phone',
    title: 'NIN Verification (By Phone)',
    method: 'POST',
    url: '/api/v1/identity/phone-verify',
    description: 'Retrieve NIN details using a linked Phone Number. This is a synchronous request.',
    params: [
      { name: 'phone', type: 'string', required: true, desc: 'Phone number (e.g., 08012345678)' },
      { name: 'reference', type: 'string', required: false, desc: 'Your unique client reference' }
    ],
    codes: null,
    body: { 
      "phone": "08012345678",
      "reference": "my-ref-002" 
    },
    response: {
      "status": true,
      "message": "Success",
      "data": {
        "firstName": "Musa",
        "surname": "Ali",
        "nin": "12345678901",
        "dateOfBirth": "1990-01-01",
        "photo": "/9j/4AAQSkZJRg..."
      }
    }
  },

  // 3. SLIP GENERATION
  {
    id: 'slip',
    title: 'NIN Slip Generation',
    method: 'POST',
    url: '/api/v1/identity/slip',
    description: 'Generate a PDF Slip. Returns a Base64 encoded PDF string. Does not return user text data.',
    params: [
      { name: 'nin', type: 'string', required: true, desc: 'The 11-digit NIN Number' },
      { name: 'service_code', type: 'integer', required: true, desc: 'Template Code (401, 402, 403)' },
      { name: 'reference', type: 'string', required: false, desc: 'Your unique client reference' }
    ],
    codes: [
      { code: 401, name: 'Premium Slip', desc: 'Full Color, ID Card Style (₦1,000)' },
      { code: 402, name: 'Standard Slip', desc: 'Standard NIMC Layout (₦700)' },
      { code: 403, name: 'Regular Slip', desc: 'Black & White / Basic (₦500)' }
    ],
    body: { 
      "nin": "12345678901",
      "service_code": 401,
      "reference": "slip-ref-001"
    },
    response: {
      "status": true,
      "message": "Slip Generated Successfully",
      "pdf_base64": "JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZS..."
    }
  },

  // 4. NIN VALIDATION (SUBMIT)
  {
    id: 'validation-submit',
    title: 'NIN Validation (Submit)',
    method: 'POST',
    url: '/api/v1/identity/nin-validation',
    description: 'Submit a Manual Validation request (e.g., No Record Found, VNIN Validation). This is Asynchronous.',
    params: [
      { name: 'nin', type: 'string', required: true, desc: 'The NIN/VNIN to validate' },
      { name: 'service_code', type: 'integer', required: true, desc: 'Validation Type (329, 330, 331)' },
      { name: 'reference', type: 'string', required: true, desc: 'Your unique client reference' }
    ],
    codes: [
      { code: 329, name: 'No Record Found', desc: 'Validate NIN showing No Record' },
      { code: 330, name: 'Update Record', desc: 'Validate updated details' },
      { code: 331, name: 'VNIN Validation', desc: 'Validate Virtual NIN' }
    ],
    body: { 
      "nin": "12345678901",
      "service_code": 331,
      "reference": "val-ref-001"
    },
    response: {
      "status": true,
      "message": "Validation Request Submitted Successfully",
      "data": {
        "reference": "req_clq...",
        "service": "V-NIN Validation",
        "status": "PROCESSING",
        "note": "This is a manual service. Status will be updated by Admin."
      }
    }
  },

  // 5. NIN VALIDATION (CHECK STATUS)
  {
    id: 'validation-status',
    title: 'NIN Validation (Check Status)',
    method: 'GET',
    url: '/api/v1/identity/nin-validation/status',
    description: 'Check the status of a submitted Validation or Modification request.',
    params: [
      { name: 'reference', type: 'string', required: true, desc: 'The client reference you submitted' }
    ],
    codes: null,
    body: undefined,
    response: {
      "status": true,
      "current_status": "COMPLETED",
      "message": "Validation Successful",
      "result": {
        "valid": true,
        "message": "Validation Successful"
      },
      "last_updated": "2024-01-01T12:00:00.000Z"
    }
  },

  // 6. IPE CLEARANCE (SUBMIT)
  {
    id: 'ipe-submit',
    title: 'IPE Clearance (Submit)',
    method: 'POST',
    url: '/api/v1/identity/ipe-clearance',
    description: 'Submit an IPE Clearance request for a specific Tracking ID.',
    params: [
      { name: 'trackingId', type: 'string', required: true, desc: 'NIMC Tracking ID' },
      { name: 'reference', type: 'string', required: false, desc: 'Your unique client reference' }
    ],
    codes: null,
    body: { 
      "trackingId": "12345XYZ",
      "reference": "ipe-ref-001"
    },
    response: {
      "status": true,
      "message": "IPE Request Submitted Successfully",
      "requestId": "req_ipe_123",
      "data": {
         "status": "success",
         "message": "Submitted"
      }
    }
  },

  // 7. IPE CLEARANCE (CHECK STATUS)
  {
    id: 'ipe-status',
    title: 'IPE Clearance (Check Status)',
    method: 'GET',
    url: '/api/v1/identity/ipe-clearance/status',
    description: 'Check the live status of an IPE Clearance request.',
    params: [
      { name: 'reference', type: 'string', required: true, desc: 'The client reference you submitted' }
    ],
    codes: null,
    body: undefined,
    response: {
      "status": true,
      "current_status": "COMPLETED",
      "original_tracking_id": "12345XYZ",
      "result": {
        "status": "success",
        "clearance_status": "Successful",
        "data": { "nin": "123...", "name": "John Doe" }
      },
      "last_updated": "2024-01-01T12:00:00.000Z"
    }
  },

  // 8. NIN PERSONALIZATION
  {
    id: 'personalization',
    title: 'NIN Personalization',
    method: 'POST',
    url: '/api/v1/identity/nin-personalization',
    description: 'Submit a request to personalize a NIN record.',
    params: [
      { name: 'trackingId', type: 'string', required: true, desc: 'NIMC Tracking ID' },
      { name: 'reference', type: 'string', required: false, desc: 'Your unique client reference' }
    ],
    codes: null,
    body: { 
      "trackingId": "ABC-12345",
      "reference": "pers-ref-001"
    },
    response: {
      "status": true,
      "message": "Request Submitted. Processing started.",
      "requestId": "req_pers_999"
    }
  }
];

export default function NinDocs() {
  const [activeId, setActiveId] = useState(ninEndpoints[0].id);
  const activeDoc = ninEndpoints.find(e => e.id === activeId) || ninEndpoints[0];

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in duration-500">
      
      {/* 1. Page Sidebar (Table of Contents) */}
      <div className="w-full lg:w-64 space-y-2 shrink-0">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">Table of Contents</h3>
        {ninEndpoints.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveId(item.id)}
            className={`w-full text-left flex items-center justify-between px-4 py-3 rounded-lg text-sm transition-all border ${
              activeId === item.id 
                ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50'
            }`}
          >
            {item.title}
            {activeId === item.id && <ChevronRight className="w-4 h-4" />}
          </button>
        ))}
      </div>

      {/* 2. Main Documentation Viewer */}
      <div className="flex-1 min-w-0">
        
        {/* Error Codes Reference (Top of Page) */}
        <div className="mb-10 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" /> Standard API Response Codes
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
             <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-100 dark:border-green-800">
               <span className="block font-mono font-bold text-green-700">200 OK</span>
               <span className="text-xs text-gray-600 dark:text-gray-300">Request Successful</span>
             </div>
             <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-100 dark:border-yellow-800">
               <span className="block font-mono font-bold text-yellow-700">400 Bad Request</span>
               <span className="text-xs text-gray-600 dark:text-gray-300">Invalid Input / Missing Fields</span>
             </div>
             <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded border border-orange-100 dark:border-orange-800">
               <span className="block font-mono font-bold text-orange-700">402 Payment</span>
               <span className="text-xs text-gray-600 dark:text-gray-300">Insufficient Wallet Balance</span>
             </div>
             <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-100 dark:border-red-800">
               <span className="block font-mono font-bold text-red-700">401 Unauthorized</span>
               <span className="text-xs text-gray-600 dark:text-gray-300">Invalid API Key</span>
             </div>
          </div>
        </div>

        {/* Title Header */}
        <div className="mb-8 border-b border-gray-200 dark:border-gray-800 pb-6">
          <div className="flex items-center gap-3 mb-3">
             <span className={`px-3 py-1 rounded text-xs font-bold font-mono ${
               activeDoc.method === 'GET' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
             }`}>
               {activeDoc.method}
             </span>
             <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{activeDoc.title}</h1>
          </div>
          <code className="text-sm bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded text-gray-600 dark:text-gray-300 font-mono break-all">
            {activeDoc.url}
          </code>
          <p className="mt-4 text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
            {activeDoc.description}
          </p>
        </div>

        {/* Authentication Info */}
        <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-800 mb-8">
           <div className="flex items-center gap-2 font-bold text-blue-700 dark:text-blue-400 text-sm mb-2">
             <Key className="w-4 h-4" /> Authentication
           </div>
           <p className="text-sm text-gray-600 dark:text-gray-400">
             Include your API Secret Key in the Request Header:
           </p>
           <code className="block mt-2 bg-white dark:bg-black p-2 rounded border border-blue-200 dark:border-blue-800 text-xs font-mono">
             Authorization: Bearer sk_live_xxxxxxxxxxxxxxxx
           </code>
        </div>

        {/* Service Codes Table (If Applicable) */}
        {activeDoc.codes && (
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Hash className="w-5 h-5 text-gray-400" /> Service Codes
            </h3>
            <div className="overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 font-medium">
                  <tr>
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3">Service Name</th>
                    <th className="px-4 py-3">Description / Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-900">
                  {activeDoc.codes.map((c: any) => (
                    <tr key={c.code}>
                      <td className="px-4 py-3 font-mono font-bold text-blue-600">{c.code}</td>
                      <td className="px-4 py-3 font-medium">{c.name}</td>
                      <td className="px-4 py-3 text-gray-500">{c.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Request Parameters */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Request Body Parameters</h3>
          <div className="overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 font-medium">
                  <tr>
                    <th className="px-4 py-3">Field</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-900">
                  {activeDoc.params.map((p) => (
                    <tr key={p.name}>
                      <td className="px-4 py-3 font-mono text-purple-600">
                        {p.name} {p.required && <span className="text-red-500">*</span>}
                      </td>
                      <td className="px-4 py-3 text-xs uppercase text-gray-400 font-bold">{p.type}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{p.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
          </div>
        </div>

        {/* Code Example */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Code2 className="w-5 h-5 text-gray-400" /> Example Request
          </h3>
          <DocsCodeBlock 
            method={activeDoc.method} 
            url={activeDoc.url} 
            body={activeDoc.body} 
          />
        </div>

        {/* Response Example */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Success Response</h3>
          <div className="bg-[#0d1117] rounded-xl p-5 border border-gray-800 overflow-x-auto shadow-inner">
            <pre className="font-mono text-sm text-green-400">
              {JSON.stringify(activeDoc.response, null, 2)}
            </pre>
          </div>
        </div>

      </div>
    </div>
  );
}
