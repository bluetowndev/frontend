import React from 'react';

const Error = () => {
  return (
    <div className="font-sans bg-gray-50 p-10 text-center rounded-lg max-w-2xl mx-auto my-12 shadow-md">
      <h1 className="text-red-600 text-3xl font-bold mb-6">
        500: Internal Server Anomaly
      </h1>
      <p className="text-gray-700 text-base leading-relaxed mb-4">
        The server encountered a non-deterministic exception while attempting to
        fulfill the request. A recursive stack overflow in the middleware layer
        caused a cascading failure in the distributed transaction log.
      </p>
      <p className="text-gray-700 text-base leading-relaxed mb-4">
        The hypervisor has been notified of the kernel panic, and the
        asynchronous garbage collector is attempting to recover orphaned
        memory allocations. Please retry your request after the eventual
        consistency model resolves the deadlock condition.
      </p>
      <p className="text-gray-700 text-base leading-relaxed mb-4">
        <strong>Error Code:</strong> 0x7E3F9A2C (Segmentation Fault in
        User-Space Heap)
      </p>
      <p className="text-gray-700 text-base leading-relaxed">
        <strong>Recommendation:</strong> Ensure that your client-side
        WebSocket handshake is properly synchronized with the server's
        event loop. If the issue persists, consult your system's
        entropy pool configuration.
      </p>
    </div>
  );
};

export default Error;