'use client';

import { useState } from 'react';
import DocsCodeBlock from '@/components/DocsCodeBlock';
import { ChevronRight, FileCode } from 'lucide-react';

const ninServices = [
  {
    id: 'verify',
    title: 'NIN Verification',
    description: 'Verify a user\'s identity using their 11-digit NIN number.',
    endpoint: '/api/v1/identity/nin-verify',
    method: 'POST',
    body: { nin: "12345678901" },
    response: {
      status: true,
      data: { firstName: "Musa", surname: "Ali", photo: "base64..." }
    }
  },
  {
    id: 'validation',
    title: 'NIN Validation',
    description: 'Manual validation of NIN records (No Record, VNIN, etc). Requires Admin processing.',
    endpoint: '/api/v1/identity/nin-validation',
    method: 'POST',
    body: { nin: "12345678901", service_code: 331, reference: "txn_01" },
    response: {
      status: true,
      data: { status: "PROCESSING", request_id: "req_123" }
    }
  },
  {
    id: 'modification',
    title: 'NIN Modification',
    description: 'Request changes to Name, Phone, or Address on a NIN record.',
    endpoint: '/api/v1/identity/nin-modification',
    method: 'POST',
    body: { 
      service_code: 501, 
      reference: "txn_02",
      data: { 
        nin: "12345678901", 
        phone_number: "080123...", 
        new_details: { first_name: "NewName" } 
      }
    },
    response: {
      status: true,
      data: { status: "PROCESSING", service: "Change of Name" }
    }
  },
  {
    id: 'ipe',
    title: 'IPE Clearance',
    description: 'Clear IPE issues for a specific NIN tracking ID.',
    endpoint: '/api/v1/identity/ipe-clearance',
    method: 'POST',
    body: { tracking_id: "12345XYZ" },
    response: {
      status: true,
      data: { status: "PROCESSING", message: "Submitted for clearance" }
    }
  },
  {
    id: 'slip',
    title: 'NIN Slip Generation',
    description: 'Generate a Premium, Standard, or Regular NIN Slip PDF.',
    endpoint: '/api/v1/identity/slip',
    method: 'POST',
    body: { nin: "12345678901", type: "PREMIUM" },
    response: {
      status: true,
      data: { url: "https://agentlink.net/slips/..." }
    }
  }
];

export default function NinDocs() {
  const [activeService, setActiveService] = useState(ninServices[0]);

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in duration-500">
      
      {/* Local Sidebar (Service List) */}
      <div className="w-full lg:w-64 space-y-2 shrink-0">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Endpoints</h3>
        {ninServices.map((service) => (
          <button
            key={service.id}
            onClick={() => setActiveService(service)}
            className={`w-full text-left flex items-center justify-between px-4 py-3 rounded-lg text-sm transition-all ${
              activeService.id === service.id 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
            }`}
          >
            {service.title}
            {activeService.id === service.id && <ChevronRight className="w-4 h-4" />}
          </button>
        ))}
      </div>

      {/* Main Documentation Viewer */}
      <div className="flex-1 space-y-8">
        
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <span className={`px-2 py-1 rounded text-xs font-bold font-mono ${
               activeService.method === 'GET' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
             }`}>
               {activeService.method}
             </span>
             <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{activeService.title}</h2>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
            {activeService.description}
          </p>
        </div>

        {/* Code Example Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
            <FileCode className="w-4 h-4 text-blue-500" /> Request Example
          </div>
          <DocsCodeBlock 
            method={activeService.method} 
            url={activeService.endpoint} 
            body={activeService.body} 
          />
        </div>

        {/* Response Example Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Sample Response</h3>
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 overflow-x-auto">
            <pre className="font-mono text-sm text-green-400">
              {JSON.stringify(activeService.response, null, 2)}
            </pre>
          </div>
        </div>

      </div>
    </div>
  );
}
