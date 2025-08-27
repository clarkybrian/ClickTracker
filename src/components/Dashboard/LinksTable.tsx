import React, { useState } from 'react';
import { Copy, ExternalLink, Trash2, ToggleLeft, ToggleRight, Eye, Download } from 'lucide-react';
import { Link } from '../../types';
import { formatDate, copyToClipboard, exportToCSV } from '../../lib/utils';

interface LinksTableProps {
  links: Link[];
  loading: boolean;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
}

export const LinksTable: React.FC<LinksTableProps> = ({
  links,
  loading,
  onDelete,
  onToggleStatus
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (shortUrl: string, linkId: string) => {
    const success = await copyToClipboard(shortUrl);
    if (success) {
      setCopiedId(linkId);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleExport = () => {
    const exportData = links.map(link => ({
      'Original URL': link.originalUrl,
      'Short Code': link.shortCode,
      'Custom Alias': link.customAlias || '',
      'Total Clicks': link.totalClicks,
      'Status': link.isActive ? 'Active' : 'Inactive',
      'Created': formatDate(link.createdAt)
    }));
    exportToCSV(exportData, 'clicktracker-links.csv');
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your links...</p>
      </div>
    );
  }

  if (links.length === 0) {
    return (
      <div className="text-center py-12">
        <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No links yet</h3>
        <p className="text-gray-600">Create your first short link to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Your Links</h3>
        <button
          onClick={handleExport}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-700">Original URL</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Short Link</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Clicks</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Created</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {links.map((link) => (
              <tr key={link.id} className="hover:bg-gray-50">
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-2">
                    <a
                      href={link.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 truncate max-w-xs"
                      title={link.originalUrl}
                    >
                      {link.originalUrl}
                    </a>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="font-mono text-sm bg-gray-100 px-3 py-1 rounded">
                    clt.kr/{link.customAlias || link.shortCode}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {link.totalClicks} clicks
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    link.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {link.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-4 px-4 text-gray-600">
                  {formatDate(link.createdAt)}
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleCopy(`https://clt.kr/${link.customAlias || link.shortCode}`, link.id)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Copy link"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onToggleStatus(link.id, !link.isActive)}
                      className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title={link.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {link.isActive ? (
                        <ToggleRight className="w-4 h-4" />
                      ) : (
                        <ToggleLeft className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => onDelete(link.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete link"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};