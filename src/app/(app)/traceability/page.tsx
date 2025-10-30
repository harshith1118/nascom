"use client";

import { useState, useEffect, useMemo } from 'react';
import { useTestCases } from '@/contexts/TestCasesContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, FileText, Link2, BarChart3 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function TraceabilityMatrixPage() {
  const { testCases } = useTestCases();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTestCases, setFilteredTestCases] = useState(testCases);

  // Filter test cases based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredTestCases(testCases);
      return;
    }
    
    const filtered = testCases.filter(tc => 
      tc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tc.requirementsTrace && tc.requirementsTrace.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    setFilteredTestCases(filtered);
  }, [searchTerm, testCases]);
  
  // Memoize grouped test cases to prevent unnecessary recalculations
  const memoizedGroupedTestCases = useMemo(() => {
    return filteredTestCases.reduce((acc: Record<string, any[]>, testCase) => {
      const trace = testCase.requirementsTrace || 'No Requirements Trace';
      if (!acc[trace]) {
        acc[trace] = [];
      }
      acc[trace].push(testCase);
      return acc;
    }, {});
  }, [filteredTestCases]);
  
  // Import useMemo at the top of the component (we need to add this)

  // Group test cases by requirements trace is now memoized above
  
  // Define types for formatted requirements
  type FormattedRequirement = {
    docTitle: string;
    sections: Array<{ type: string; content: string }>;
  };

  // Function to format requirements trace for display
  const formatRequirementsTrace = (trace: string): FormattedRequirement => {
    if (!trace || trace === 'N/A' || trace === 'No Requirements Trace') {
      return { docTitle: 'No Requirements', sections: [] };
    }
    
    // Extract document title
    const titleMatch = trace.match(/# Software Requirements for ([^\n\r]+)/);
    const docTitle = titleMatch ? titleMatch[1] : 'Requirements Document';
    
    // Split by sections (##) and format
    const sections = trace.split(/\n\s*##\s/).filter(s => s.trim() !== '');
    
    // Take first section and extract its subsections
    const firstSection = sections[0];
    if (!firstSection) {
      return { docTitle, sections: [] };
    }
    
    // Split into lines and process
    const lines = firstSection.split('\n').filter(line => line.trim() !== '');
    const formattedLines = lines.slice(0, 6).map(line => {
      if (line.startsWith('# ')) {
        return { type: 'title', content: line.replace(/^#+\s*/, '') };
      } else if (line.startsWith('- ')) {
        return { type: 'item', content: line.substring(2).trim() };
      } else if (line.match(/^\d+\./)) {
        return { type: 'step', content: line.trim() };
      } else {
        return { type: 'text', content: line.trim() };
      }
    });
    
    return { docTitle, sections: formattedLines };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Link2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Requirements Traceability Matrix</h1>
              <p className="text-muted-foreground">
                Link test cases to original requirements for complete coverage visibility
              </p>
            </div>
          </div>
        </div>
        <div className="w-full md:w-64">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
        </div>
      </div>

      {testCases.length === 0 ? (
        <Card className="max-w-2xl mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 bg-muted rounded-full mb-4">
              <FileText className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Test Cases Generated</h3>
            <p className="text-muted-foreground mb-6">
              Generate test cases first to see the traceability matrix
            </p>
            <Button asChild>
              <a href="/generate">Generate Test Cases</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Requirements</p>
                    <h3 className="text-2xl font-bold mt-1">
                      {Object.keys(memoizedGroupedTestCases).filter(key => key !== 'No Requirements Trace').length}
                    </h3>
                  </div>
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <Link2 className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Test Cases</p>
                    <h3 className="text-2xl font-bold mt-1">{filteredTestCases.length}</h3>
                  </div>
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <FileText className="h-6 w-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Traceability Coverage</p>
                    <h3 className="text-2xl font-bold mt-1">
                      {filteredTestCases.length > 0 
                        ? Math.round((filteredTestCases.filter(tc => tc.requirementsTrace && tc.requirementsTrace !== 'N/A' && tc.requirementsTrace !== '').length / filteredTestCases.length) * 100) || 0
                        : 0}%
                    </h3>
                  </div>
                  <div className="p-3 bg-purple-500/10 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Traceability Table */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5" />
                Requirements to Test Cases Mapping
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="min-w-full">
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-[300px]">Requirement</TableHead>
                      <TableHead>Test Cases</TableHead>
                      <TableHead className="text-right">Coverage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(memoizedGroupedTestCases).map(([requirement, testCasesForRequirement]) => {
                      const formattedReq = formatRequirementsTrace(requirement);
                      return (
                        <TableRow key={requirement} className="hover:bg-muted/5 transition-colors">
                          <TableCell className="font-medium">
                            <div className="flex flex-col">
                              {requirement === 'No Requirements Trace' ? (
                                <span className="font-semibold text-red-600">Unlinked Test Cases</span>
                              ) : (
                                <>
                                  <div className="text-sm font-semibold mb-1">
                                    {formattedReq.docTitle}
                                  </div>
                                  {formattedReq.sections.length > 0 && (
                                    <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-md max-h-32 overflow-y-auto border">
                                      <div className="space-y-1">
                                        {formattedReq.sections.map((line, idx) => (
                                          <div key={idx} className={line.type === 'title' ? 'font-semibold mt-2' : ''}>
                                            {line.type === 'item' ? `• ${line.content}` : 
                                             line.type === 'step' ? `${line.content}` : 
                                             line.content}
                                          </div>
                                        ))}
                                        {formattedReq.sections.length === 6 && <div className="text-xs text-muted-foreground mt-1">+ more...</div>}
                                      </div>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              {testCasesForRequirement.map((tc) => (
                                <div key={tc.id} className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 bg-muted/30 rounded-md border">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="text-xs px-2 py-1">
                                      {tc.caseId}
                                    </Badge>
                                    <span className={`text-xs px-2 py-1 rounded ${tc.priority.toLowerCase() === 'high' ? 'bg-red-100 text-red-800' : tc.priority.toLowerCase() === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                      {tc.priority}
                                    </span>
                                  </div>
                                  <span className="text-sm font-medium flex-1 truncate">
                                    {tc.title}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    v{tc.version}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex flex-col items-end">
                              <Badge variant="outline" className="mb-2">
                                {testCasesForRequirement.length} TC{testCasesForRequirement.length !== 1 ? 's' : ''}
                              </Badge>
                              <div className="text-xs text-muted-foreground">
                                {requirement === 'No Requirements Trace' 
                                  ? 'Needs Tracing' 
                                  : 'Traced'}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Coverage Details */}
          <Card>
            <CardHeader>
              <CardTitle>Traceability Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Coverage Breakdown</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Traced Test Cases</span>
                      <span className="font-medium">
                        {filteredTestCases.filter(tc => tc.requirementsTrace && tc.requirementsTrace !== 'N/A' && tc.requirementsTrace !== '').length} of {filteredTestCases.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Untraced Test Cases</span>
                      <span className="font-medium">
                        {filteredTestCases.filter(tc => !tc.requirementsTrace || tc.requirementsTrace === 'N/A' || tc.requirementsTrace === '').length} of {filteredTestCases.length}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Coverage Percentage</span>
                      <span className="text-primary">
                        {filteredTestCases.length > 0 
                          ? Math.round((filteredTestCases.filter(tc => tc.requirementsTrace && tc.requirementsTrace !== 'N/A' && tc.requirementsTrace !== '').length / filteredTestCases.length) * 100) || 0
                          : 0}%
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">Requirements Overview</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Traced Requirements</span>
                      <span className="font-medium">
                        {Object.keys(memoizedGroupedTestCases).filter(key => key !== 'No Requirements Trace').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Untraced Test Cases</span>
                      <span className="font-medium">
                        {memoizedGroupedTestCases['No Requirements Trace'] ? memoizedGroupedTestCases['No Requirements Trace'].length : 0}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total Requirements</span>
                      <span className="text-primary">
                        {Object.keys(memoizedGroupedTestCases).length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}