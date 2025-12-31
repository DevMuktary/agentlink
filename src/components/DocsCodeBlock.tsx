'use client';
import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  method: string;
  url: string;
  body?: object;
}

export default function DocsCodeBlock({ method, url, body }: CodeBlockProps) {
  const [lang, setLang] = useState<'curl' | 'node' | 'php'>('curl');
  const [copied, setCopied] = useState(false);

  const fullUrl = `https://api.agentlink.net${url}`;
  const jsonBody = JSON.stringify(body, null, 2);

  const snippets = {
    curl: `curl -X ${method} "${fullUrl}" \\
-H "Authorization: Bearer YOUR_SECRET_KEY" \\
-H "Content-Type: application/json"${body ? ` \\
-d '${jsonBody}'` : ''}`,
    
    node: `const axios = require('axios');

const response = await axios.${method.toLowerCase()}('${fullUrl}', {
  ${body ? `data: ${jsonBody},` : ''}
  headers: {
    'Authorization': 'Bearer YOUR_SECRET_KEY',
    'Content-Type': 'application/json'
  }
});

console.log(response.data);`,

    php: `<?php
$curl = curl_init();

curl_setopt_array($curl, array(
  CURLOPT_URL => '${fullUrl}',
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => '',
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 0,
  CURLOPT_FOLLOWLOCATION => true,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => '${method}',
  ${body ? `CURLOPT_POSTFIELDS => '${jsonBody}',` : ''}
  CURLOPT_HTTPHEADER => array(
    'Authorization: Bearer YOUR_SECRET_KEY',
    'Content-Type: application/json'
  ),
));

$response = curl_exec($curl);
curl_close($curl);
echo $response;
?>`
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(snippets[lang]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-[#0d1117] text-gray-300 my-4 shadow-lg">
      <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-gray-800">
        <div className="flex gap-2">
          {['curl', 'node', 'php'].map((l) => (
            <button
              key={l}
              onClick={() => setLang(l as any)}
              className={`text-xs font-mono px-3 py-1 rounded transition-colors uppercase ${
                lang === l ? 'bg-blue-600 text-white' : 'hover:bg-gray-800 text-gray-400'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
        <button onClick={handleCopy} className="text-gray-400 hover:text-white">
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="font-mono text-sm leading-relaxed text-blue-100">
          <code>{snippets[lang]}</code>
        </pre>
      </div>
    </div>
  );
}
