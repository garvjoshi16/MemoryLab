import React from 'react';

const AlgorithmInfo: React.FC = () => {
  return (
    <section className="py-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="text-cyan">Algorithm Information</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* FIFO Information */}
          <div className="rounded-lg border border-blue-500/20 bg-navy p-6">
            <h3 className="text-blue-400 mb-3 flex items-center gap-2">
              <span className="text-cyan">FIFO (First-In, First-Out)</span>
            </h3>
            <p className="text-white text-sm leading-relax">
              "First-In, First-Out removes the page that has been in memory the longest."
            </p>
            <p className="text-blue-light/60 text-xs mt-4">
              When a page fault occurs and memory is full, FIFO simply evicts the page 
              that has been residing in RAM the longest, regardless of how recently it was used.
            </p>
          </div>

          {/* LRU Information */}
          <div className="rounded-lg border border-blue-500/20 bg-navy p-6">
            <h3 className="text-blue-400 mb-3 flex items-center gap-2">
              <span className="text-cyan">LRU (Least Recently Used)</span>
            </h3>
            <p className="text-white text-sm leading-relax">
              "Least Recently Used removes the page that has not been used for the longest time."
            </p>
            <p className="text-blue-light/60 text-xs mt-4">
              When a page fault occurs and memory is full, LRU evicts the page that has 
              gone the longest time without being accessed. This requires tracking when 
              each page was last used.
            </p>
          </div>

          {/* Key Terms */}
          <div className="rounded-lg border border-blue-500/20 bg-navy p-6">
            <h3 className="text-blue-400 mb-3 flex items-center gap-2">
              <span className="text-cyan">Key Terms</span>
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <span className="text-sm text-blue-light px-2 py-1 rounded bg-navy/50">Page</span>
              <span className="text-sm text-blue-light px-2 py-1 rounded bg-navy/50">RAM Frame</span>
              <span className="text-sm text-blue-light px-2 py-1 rounded bg-navy/50">Page Hit</span>
              <span className="text-sm text-blue-light px-2 py-1 rounded bg-navy/50">Page Fault</span>
              <span className="text-sm text-blue-light px-2 py-1 rounded bg-navy/50">Page Replacement</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AlgorithmInfo;