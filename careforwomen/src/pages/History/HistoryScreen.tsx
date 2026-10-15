import React, { useState } from 'react';
import {
  Clock3,
  Search,
  History,
  ShieldCheck,
  ChevronRight,
  ScanLine,
} from 'lucide-react';
import { NutriButton } from '../../components/ui/NutriButton';
import { NutriVerdictBadge } from '../../components/ui/NutriVerdictBadge';
import { ProductArt } from '../../components/ui/ProductArt';
import { useHistory } from '../../context/HistoryContext';
import { ScanRecord } from '../../types/scan';
import { VerdictLevel } from '../../types/verdict';

export interface HistoryScreenProps {
  onSelectScan: (record: ScanRecord) => void;
  onScanAnother?: () => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  onSelectScan,
  onScanAnother,
}) => {
  const { scans } = useHistory();
  const [search, setSearch] = useState('');
  const [filterVerdict, setFilterVerdict] = useState<VerdictLevel | 'all'>('all');

  const filtered = scans.filter((record) => {
    const matchesSearch =
      record.product.name.toLowerCase().includes(search.toLowerCase()) ||
      (record.product.brand && record.product.brand.toLowerCase().includes(search.toLowerCase()));

    const matchesVerdict = filterVerdict === 'all' || record.verdict.overall === filterVerdict;
    return matchesSearch && matchesVerdict;
  });

  return (
    <div className="animate-in">
      {/* Page Heading */}
      <div className="page-heading">
        <div>
          <div className="eyebrow">Your activity</div>
          <h1>Scan history</h1>
          <p>A private record of completed product assessments.</p>
        </div>
        {onScanAnother && (
          <NutriButton onClick={onScanAnother} className="scan-button">
            <ScanLine className="size-4 shrink-0" />
            <span>Scan another</span>
          </NutriButton>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="search-box flex-1">
          <Search className="size-4 text-plum/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search scanned products or brands…"
            aria-label="Search scans"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-xs text-plum/40 hover:text-plum">
              Clear
            </button>
          )}
        </div>

        {/* Verdict Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All' },
            { id: 'green', label: 'Suitable' },
            { id: 'yellow', label: 'Caution' },
            { id: 'red', label: 'Avoid' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilterVerdict(item.id as any)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                filterVerdict === item.id
                  ? 'bg-primary text-white'
                  : 'bg-white border border-[#eadfd9] text-plum/70 hover:bg-black/5'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* History List or Empty State */}
      {filtered.length > 0 ? (
        <div className="history-list">
          {filtered.map((record) => {
            const dateStr = new Date(record.scannedAt).toLocaleDateString([], {
              month: 'short',
              day: 'numeric',
            });
            const timeStr = new Date(record.scannedAt).toLocaleTimeString([], {
              hour: 'numeric',
              minute: '2-digit',
            });

            return (
              <div className="history-item" key={record.id}>
                <ProductArt product={record.product} />

                <div className="min-w-0 flex-1">
                  <div className="text-[11px] text-plum/50 truncate">
                    {record.product.brand || 'Product'} {record.product.category ? `· ${record.product.category}` : ''}
                  </div>
                  <div className="mt-0.5 text-sm font-semibold text-plum truncate">
                    {record.product.name}
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-[11px] text-plum/45">
                    <Clock3 className="size-3.5 shrink-0" />
                    <span>
                      {dateStr} at {timeStr}
                      {record.explanation ? ` · ${record.explanation.slice(0, 48)}…` : ''}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  <NutriVerdictBadge verdict={record.verdict.overall} />
                  <NutriButton
                    variant="outline"
                    size="sm"
                    onClick={() => onSelectScan(record)}
                    className="border-[#eadfd9] hover:bg-black/5 text-plum"
                  >
                    <span>Open result</span>
                    <ChevronRight className="size-3.5" />
                  </NutriButton>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <History className="size-8 text-plum/30" />
          <h2>No scans found</h2>
          <p>
            {scans.length === 0
              ? 'Products you assess will appear here automatically.'
              : 'No scanned products matched your search or verdict filter.'}
          </p>
          {onScanAnother && (
            <NutriButton onClick={onScanAnother} className="scan-button">
              Scan a product
            </NutriButton>
          )}
        </div>
      )}

      {/* Footer Statement */}
      <div className="history-footer">
        <ShieldCheck className="size-4 text-sage-strong shrink-0" />
        <span>Scan history is encrypted and securely synchronized with your account.</span>
      </div>
    </div>
  );
};

export default HistoryScreen;
