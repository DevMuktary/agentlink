'use client';

import { useState } from 'react';
import DocsCodeBlock from '@/components/DocsCodeBlock';
import { ChevronRight, Hash, Key, Code2, AlertTriangle, CheckCircle, Info } from 'lucide-react';

// --- 1. ERROR CODES DEFINITION ---
const ERROR_CODES = [
  { code: 400, desc: "Bad Request. Missing parameters or invalid input format." },
  { code: 401, desc: "Unauthorized. Invalid or missing Bearer Token." },
  { code: 402, desc: "Insufficient Funds. Wallet balance is too low for this service." },
  { code: 404, desc: "Not Found. The requested resource or service code does not exist." },
  { code: 500, desc: "Server Error. An internal error occurred. (Transactions are usually not charged)." },
  { code: 503, desc: "Service Unavailable. The service is currently inactive." }
];

// --- 2. FULL API ENDPOINTS DATA ---
const ninEndpoints = [
  // --- VERIFICATION GROUP ---
  {
    id: 'verify-nin',
    group: 'Verification',
    title: 'Verify by NIN',
    method: 'POST',
    url: '/api/v1/identity/nin-verify',
    description: 'Verify an identity using the 11-digit NIN Number. Charges apply per successful hit.',
    params: [
      { name: 'nin', type: 'string', required: true, desc: 'The 11-digit NIN Number' },
      { name: 'reference', type: 'string', required: false, desc: 'Your unique transaction reference' }
    ],
    codes: null,
    body: { "nin": "12345678901", "reference": "my-ref-001" },
    response: {
      "status": true,
      "message": "Success",
      "data": {
        "firstname": "Musa",
        "surname": "Ali",
        "birthdate": "1990-01-01",
        "gender": "m",
        "telephoneno": "08012345678",
        "photo": "/9j/4AAQSkZJRg...",
        "residence_adress": "No 1 Lagos Way"
      }
    }
  },
  {
    id: 'verify-phone',
    group: 'Verification',
    title: 'Verify by Phone',
    method: 'POST',
    url: '/api/v1/identity/phone-verify',
    description: 'Retrieve NIN details using a linked Phone Number.',
    params: [
      { name: 'phone', type: 'string', required: true, desc: 'Phone number (11 digits)' },
      { name: 'reference', type: 'string', required: false, desc: 'Your unique transaction reference' }
    ],
    codes: null,
    body: { "phone": "08012345678", "reference": "my-ref-002" },
    response: {
      "status": true,
      "message": "Success",
      "data": {
        "nin": "12345678901",
        "firstname": "Musa",
        "surname": "Ali",
        "photo": "..."
      }
    }
  },

  // --- SLIP GENERATION GROUP ---
  {
    id: 'slip-gen',
    group: 'Documents',
    title: 'Slip Generation',
    method: 'POST',
    url: '/api/v1/identity/slip',
    description: 'Generate a PDF Slip (Base64 encoded). Requires a specific `service_code` for the template.',
    params: [
      { name: 'nin', type: 'string', required: true, desc: 'The 11-digit NIN Number' },
      { name: 'service_code', type: 'integer', required: true, desc: 'Template Code (See Table)' },
      { name: 'reference', type: 'string', required: false, desc: 'Your unique transaction reference' }
    ],
    codes: [
      { code: 401, name: 'Premium Slip', desc: 'Full Color, ID Card Style' },
      { code: 402, name: 'Standard Slip', desc: 'Standard NIMC Layout' },
      { code: 403, name: 'Regular Slip', desc: 'Black & White / Basic' }
    ],
    body: { 
      "nin": "12345678901", 
      "service_code": 401,
      "reference": "slip-txn-01"
    },
    response: {
      "status": true,
      "message": "Slip Generated Successfully",
      "pdf_base64": "JVBERi0xLjQKJ..." 
    }
  },

  // --- VALIDATION GROUP ---
  {
    id: 'validation-submit',
    group: 'Validation',
    title: 'Submit Validation',
    method: 'POST',
    url: '/api/v1/identity/nin-validation',
    description: 'Submit a manual validation request (No Record, VNIN, etc.). Returns a reference for tracking.',
    params: [
      { name: 'nin', type: 'string', required: true, desc: 'NIN to validate' },
      { name: 'service_code', type: 'integer', required: true, desc: 'Validation Type (See Table)' },
      { name: 'reference', type: 'string', required: true, desc: 'Unique Client Reference' }
    ],
    codes: [
      { code: 329, name: 'No Record Found', desc: 'Validate NIN has no record' },
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
        "reference": "req_id_from_db",
        "service": "V-NIN Validation",
        "status": "PROCESSING",
        "note": "This is a manual service. Status will be updated by Admin."
      }
    }
  },
  {
    id: 'validation-status',
    group: 'Validation',
    title: 'Check Val. Status',
    method: 'GET',
    url: '/api/v1/identity/nin-validation/status',
    description: 'Check if the Admin has approved or rejected the validation.',
    params: [
      { name: 'reference', type: 'string', required: true, desc: 'The client reference you submitted' }
    ],
    codes: null,
    body: undefined,
    response: {
      "status": true,
      "current_status": "COMPLETED",
      "message": "Transaction Completed",
      "result": {
        "valid": true,
        "message": "Validation Successful"
      }
    }
  },

  // --- MODIFICATION GROUP ---
  {
    id: 'modification-submit',
    group: 'Modification',
    title: 'Submit Modification',
    method: 'POST',
    url: '/api/v1/identity/nin-modification',
    description: 'Request changes to NIN data. Requires specific `data` fields based on the code.',
    params: [
      { name: 'service_code', type: 'integer', required: true, desc: 'Modification Type' },
      { name: 'reference', type: 'string', required: true, desc: 'Unique Client Reference' },
      { name: 'data', type: 'object', required: true, desc: 'Object with details (see body)' }
    ],
    codes: [
      { code: 501, name: 'Change of Name', desc: 'Needs `new_details: { first_name, surname }`' },
      { code: 502, name: 'Change of Phone', desc: 'Needs `new_phone_number`' },
      { code: 503, name: 'Change of Address', desc: 'Needs `new_address`' }
    ],
    body: { 
      "service_code": 501,
      "reference": "mod-ref-001",
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
      "message": "Modification Request Submitted Successfully",
      "data": {
        "request_id": "req_mod_123",
        "status": "PROCESSING",
        "service": "NIN Modification: Change of Name"
      }
    }
  },
  {
    id: 'modification-status',
    group: 'Modification',
    title: 'Check Mod. Status',
    method: 'GET',
    url: '/api/v1/identity/nin-modification/status',
    description: 'Check modification result. Success returns an image URL.',
    params: [
      { name: 'reference', type: 'string', required: true, desc: 'The client reference' }
    ],
    codes: null,
    body: undefined,
    response: {
      "status": true,
      "current_status": "COMPLETED",
      "message": "Modification Successful",
      "result": {
        "success": true,
        "image_url": "https://agentlink.com/images/mod-proof.jpg",
        "note": "Changes applied successfully"
      }
    }
  },

  // --- IPE CLEARANCE GROUP ---
  {
    id: 'ipe-submit',
    group: 'IPE Clearance',
    title: 'Submit IPE Request',
    method: 'POST',
    url: '/api/v1/identity/ipe-clearance',
    description: 'Clear IPE issues using a Tracking ID.',
    params: [
      { name: 'trackingId', type: 'string', required: true, desc: 'The NIN Tracking ID' },
      { name: 'reference', type: 'string', required: false, desc: 'Unique Client Reference' }
    ],
    codes: null,
    body: { 
      "trackingId": "123456ABC",
      "reference": "ipe-001"
    },
    response: {
      "status": true,
      "message": "IPE Request Submitted Successfully",
      "data": { "status": "submitted" },
      "requestId": "req_ipe_123"
    }
  },
  {
    id: 'ipe-status',
    group: 'IPE Clearance',
    title: 'Check IPE Status',
    method: 'GET',
    url: '/api/v1/identity/ipe-clearance/status',
    description: 'Check if IPE has been cleared.',
    params: [
      { name: 'request_id', type: 'string', required: true, desc: 'The requestId returned from submit' }
    ],
    codes: null,
    body: undefined,
    response: {
      "status": true,
      "current_status": "COMPLETED",
      "result": {
        "nin": "12345678901",
        "status": "Cleared"
      }
    }
  },

   // --- PERSONALIZATION GROUP ---
   {
    id: 'pers-submit',
    group: 'Personalization',
    title: 'Submit Personalization',
    method: 'POST',
    url: '/api/v1/identity/nin-personalization',
    description: 'Personalize NIN data.',
    params: [
      { name: 'trackingId', type: 'string', required: true, desc: 'The NIN Tracking ID' },
      { name: 'reference', type: 'string', required: false, desc: 'Unique Client Reference' }
    ],
    codes: null,
    body: { 
      "trackingId": "123456ABC",
      "reference": "pers-001"
    },
    response: {
      "status": true,
      "message": "Request Submitted. Processing started.",
      "requestId": "req_pers_123"
    }
  }
];

export default function NinDocs() {
  const [activeId, setActiveId] = useState(ninEndpoints[0].id);
  const activeDoc = ninEndpoints.find(e => e.id === activeId) || ninEndpoints[0];

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in duration-500">
      
      {/* 1. Page Sidebar (Table of Contents) */}
      <div className="w-full lg:w-64 space-y-6 shrink-0">
        
        {/* Verification */}
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">Verification</h3>
          <div className="space-y-1">
            {ninEndpoints.filter(e => e.group === 'Verification').map((item) => (
              <NavButton key={item.id} item={item} activeId={activeId} setActiveId={setActiveId} />
            ))}
          </div>
        </div>

        {/* Documents */}
        <div>
           <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">Documents</h3>
           <div className="space-y-1">
             {ninEndpoints.filter(e => e.group === 'Documents').map((item) => (
               <NavButton key={item.id} item={item} activeId={activeId} setActiveId={setActiveId} />
             ))}
           </div>
        </div>

        {/* Validation */}
        <div>
           <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">Validation</h3>
           <div className="space-y-1">
             {ninEndpoints.filter(e => e.group === 'Validation').map((item) => (
               <NavButton key={item.id} item={item} activeId={activeId} setActiveId={setActiveId} />
             ))}
           </div>
        </div>

         {/* Modification */}
         <div>
           <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">Modification</h3>
           <div className="space-y-1">
             {ninEndpoints.filter(e => e.group === 'Modification').map((item) => (
               <NavButton key={item.id} item={item} activeId={activeId} setActiveId={setActiveId} />
             ))}
           </div>
        </div>

         {/* Others */}
         <div>
           <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">IPE & Others</h3>
           <div className="space-y-1">
             {ninEndpoints.filter(e => ['IPE Clearance', 'Personalization'].includes(e.group)).map((item) => (
               <NavButton key={item.id} item={item} activeId={activeId} setActiveId={setActiveId} />
             ))}
           </div>
        </div>

      </div>

      {/* 2. Main Documentation Viewer */}
      <div className="flex-1 min-w-0">
        
        {/* --- ERROR CODES HEADER --- */}
        <div className="mb-10 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wide">Standard Error Codes</h3>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
             {ERROR_CODES.map((err) => (
               <div key={err.code} className="flex gap-3">
                 <span className="font-mono font-bold text-red-500 w-10">{err.code}</span>
                 <span className="text-gray-600 dark:text-gray-400">{err.desc}</span>
               </div>
             ))}
          </div>
        </div>

        {/* --- ACTIVE DOC CONTENT --- */}
        <div className="border-b border-gray-200 dark:border-gray-800 pb-6 mb-8">
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
                    <th className="px-4 py-3">Description</th>
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

        {/* Request Parameters Definition */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-gray-400" /> Request Body Parameters
          </h3>
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

        {/* Code Example (Request) */}
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
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
             <CheckCircle className="w-5 h-5 text-green-500" /> Example Success Response
          </h3>
          <div className="bg-[#0d1117] rounded-xl p-5 border border-gray-800 overflow-x-auto shadow-inner relative group">
            <pre className="font-mono text-sm text-green-400">
              {JSON.stringify(activeDoc.response, null, 2)}
            </pre>
          </div>
        </div>

      </div>
    </div>
  );
}

// Helper for Sidebar Buttons
function NavButton({ item, activeId, setActiveId }: any) {
  return (
    <button
      onClick={() => setActiveId(item.id)}
      className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-md text-sm transition-all border-l-2 ${
        activeId === item.id 
          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-600 font-medium' 
          : 'text-gray-600 dark:text-gray-400 border-transparent hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
      }`}
    >
      {item.title}
      {activeId === item.id && <ChevronRight className="w-3 h-3" />}
    </button>
  );
}
