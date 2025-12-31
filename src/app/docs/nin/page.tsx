'use client';

import { useState } from 'react';
import DocsCodeBlock from '@/components/DocsCodeBlock';
import { ChevronRight, Hash, Key, Code2 } from 'lucide-react';

// --- DATA: Full API Reference for NIN ---
const ninEndpoints = [
  {
    id: 'verify',
    title: 'Verify NIN',
    method: 'POST',
    url: '/api/v1/identity/nin-verify',
    description: 'Instant verification of an 11-digit NIN. Returns the user\'s full details and base64 photo.',
    params: [
      { name: 'nin', type: 'string', required: true, desc: 'The 11-digit NIN Number' }
    ],
    codes: null,
    body: { "nin": "12345678901" },
    response: {
      "status": true,
      "data": {
        "firstName": "Musa",
        "surname": "Ali",
        "middleName": "Bello",
        "dateOfBirth": "1990-01-01",
        "gender": "m",
        "mobile": "08012345678",
        "photo": "/9j/4AAQSkZJRg..." 
      }
    }
  },
  {
    id: 'slip',
    title: 'NIN Slip Generation',
    method: 'POST',
    url: '/api/v1/identity/slip',
    description: 'Generate a PDF Slip for a NIN. You must specify the template using the `service_code`.',
    params: [
      { name: 'nin', type: 'string', required: true, desc: 'The 11-digit NIN Number' },
      { name: 'service_code', type: 'integer', required: true, desc: 'Determines the Slip Design (See Codes below)' }
    ],
    codes: [
      { code: 401, name: 'Premium Slip', price: '₦1,000' },
      { code: 402, name: 'Standard Slip', price: '₦700' },
      { code: 403, name: 'Regular Slip', price: '₦500' }
    ],
    body: { 
      "nin": "12345678901",
      "service_code": 401
    },
    response: {
      "status": true,
      "message": "Slip Generated Successfully",
      "data": {
        "url": "https://agentlink.com/download/slip-pdf-uuid.pdf",
        "charged_amount": 1000
      }
    }
  },
  {
    id: 'validation',
    title: 'NIN Validation',
    method: 'POST',
    url: '/api/v1/identity/nin-validation',
    description: 'Manual validation services. This is an asynchronous request. You will get a `reference` to check status later.',
    params: [
      { name: 'nin', type: 'string', required: true, desc: 'The NIN to validate' },
      { name: 'service_code', type: 'integer', required: true, desc: 'Type of validation' },
      { name: 'reference', type: 'string', required: true, desc: 'Your unique transaction ref' }
    ],
    codes: [
      { code: 329, name: 'No Record Found', desc: 'Validates that NIN has no record' },
      { code: 330, name: 'Update Record', desc: 'Validates updated details' },
      { code: 331, name: 'VNIN Validation', desc: 'Validates Virtual NIN' }
    ],
    body: { 
      "nin": "12345678901",
      "service_code": 331,
      "reference": "my-ref-001"
    },
    response: {
      "status": true,
      "message": "Validation Request Submitted",
      "data": {
        "request_id": "req_clq...",
        "status": "PROCESSING",
        "note": "Check status endpoint for result"
      }
    }
  },
  {
    id: 'modification',
    title: 'NIN Modification',
    method: 'POST',
    url: '/api/v1/identity/nin-modification',
    description: 'Submit a request to modify NIN data (Name, Phone, Address). This is a manual service processed by Admin.',
    params: [
      { name: 'service_code', type: 'integer', required: true, desc: 'Modification Type' },
      { name: 'reference', type: 'string', required: true, desc: 'Your unique transaction ref' },
      { name: 'data', type: 'object', required: true, desc: 'Object containing `nin` and new details' }
    ],
    codes: [
      { code: 501, name: 'Change of Name', desc: 'Requires `new_details: { first_name, surname }`' },
      { code: 502, name: 'Change of Phone', desc: 'Requires `new_phone_number`' },
      { code: 503, name: 'Change of Address', desc: 'Requires `new_address`' }
    ],
    body: { 
      "service_code": 501,
      "reference": "mod_001",
      "data": {
        "nin": "12345678901",
        "phone_number": "08012345678",
        "new_details": {
          "first_name": "NewName",
          "surname": "NewSurname"
        }
      }
    },
    response: {
      "status": true,
      "data": {
        "request_id": "req_mod_123",
        "status": "PROCESSING",
        "service": "NIN Modification: Change of Name"
      }
    }
  },
  {
    id: 'status',
    title: 'Check Request Status',
    method: 'GET',
    url: '/api/v1/identity/nin-validation/status',
    description: 'Check the status of any Async request (Validation or Modification).',
    params: [
      { name: 'request_id', type: 'string', required: false, desc: 'The AgentLink Request ID' },
      { name: 'reference', type: 'string', required: false, desc: 'Your Client Reference (Alternative)' }
    ],
    codes: null,
    body: null, // GET request has no body
    response: {
      "status": true,
      "current_status": "COMPLETED",
      "result": {
        "valid": true,
        "message": "Validation Successful"
      }
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
          <code className="text-sm bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded text-gray-600 dark:text-gray-300 font-mono">
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
                      <td className="px-4 py-3 text-gray-500">{c.desc || c.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Request Parameters */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Request Body</h3>
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
