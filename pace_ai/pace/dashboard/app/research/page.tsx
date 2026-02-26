'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/card';
import { ParaBadge } from '@/components/shared/para-badge';
import { SearchBar } from '@/components/shared/search-bar';
import { Button } from '@/components/shared/button';
import { mockResearchEntries } from '@/lib/mock-data';
import { BookOpen, ExternalLink, FileText, Lightbulb, Search } from 'lucide-react';

export default function ResearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);

  const filteredEntries = mockResearchEntries.filter(
    (entry) =>
      searchQuery === '' ||
      entry.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.keyFindings.some((f) => f.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleRequestResearch = () => {
    // In real implementation, this would open a modal or send to Redis
    console.log('Request research clicked');
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Research Library</h1>
          <p className="text-text-secondary mt-1">
            Searchable repository of all research outputs
          </p>
        </div>

        <Button variant="primary" onClick={handleRequestResearch}>
          <Search className="w-4 h-4 mr-2" />
          Request Research
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search research topics, findings..."
          className="max-w-md"
        />
      </div>

      {/* Research Entries Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Entry List */}
        <div className="space-y-4">
          {filteredEntries.map((entry) => (
            <Card
              key={entry.id}
              className={cn(
                'cursor-pointer transition-colors',
                selectedEntry === entry.id
                  ? 'border-brand-cyan'
                  : 'hover:border-brand-cyan/30'
              )}
              onClick={() => setSelectedEntry(entry.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-brand-sky" />
                    <h3 className="font-semibold text-text-primary">{entry.topic}</h3>
                  </div>
                  <span className="text-xs text-text-muted">{formatDate(entry.createdAt)}</span>
                </div>

                <p className="text-sm text-text-secondary line-clamp-2 mb-3">
                  {entry.content.substring(0, 150)}...
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted">
                      {entry.sources.length} sources
                    </span>
                    <span className="text-text-muted">·</span>
                    <span className="text-xs text-text-muted">
                      {entry.keyFindings.length} findings
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {entry.paraTags.map((tag) => (
                      <ParaBadge key={tag} category={tag} size="sm" />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredEntries.length === 0 && (
            <div className="flex items-center justify-center h-32 text-text-muted">
              No research found
            </div>
          )}
        </div>

        {/* Selected Entry Detail */}
        <div className="lg:sticky lg:top-20">
          {selectedEntry ? (
            (() => {
              const entry = mockResearchEntries.find((e) => e.id === selectedEntry);
              if (!entry) return null;

              return (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-brand-sky" />
                      {entry.topic}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Key Findings */}
                    <div>
                      <h4 className="text-sm font-medium text-text-primary mb-2 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-status-warning" />
                        Key Findings
                      </h4>
                      <ul className="space-y-2">
                        {entry.keyFindings.map((finding, index) => (
                          <li
                            key={index}
                            className="text-sm text-text-secondary flex items-start gap-2"
                          >
                            <span className="text-brand-cyan">•</span>
                            {finding}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Sources */}
                    <div>
                      <h4 className="text-sm font-medium text-text-primary mb-2">Sources</h4>
                      <div className="space-y-2">
                        {entry.sources.map((source, index) => (
                          <a
                            key={index}
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-2 rounded bg-dark-bg text-sm text-text-secondary hover:text-brand-cyan transition-colors"
                          >
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{source.title}</span>
                            <span className="text-xs text-text-muted capitalize ml-auto">
                              {source.type}
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>

                    {/* Content Preview */}
                    <div>
                      <h4 className="text-sm font-medium text-text-primary mb-2">Content</h4>
                      <div className="p-3 rounded bg-dark-bg text-sm text-text-secondary font-mono whitespace-pre-wrap max-h-64 overflow-y-auto">
                        {entry.content}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })()
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64 text-text-muted">
                <BookOpen className="w-8 h-8 mb-2" />
                <p>Select a research entry to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
