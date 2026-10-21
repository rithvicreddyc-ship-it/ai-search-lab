import { CompareResultItem } from '../types';

export function exportToJson(data: any, filename: string): void {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.json') ? filename : `${filename}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportComparisonToCsv(results: CompareResultItem[], filename: string = 'algorithm_comparison.csv'): void {
  const headers = [
    'Algorithm',
    'Solution Found',
    'Path Cost',
    'Path Length',
    'Nodes Expanded',
    'Nodes Generated',
    'Max Frontier Size',
    'Execution Time (ms)',
    'Optimality Guarantee',
    'Completeness Guarantee',
    'Notes',
  ];

  const rows = results.map((r) => [
    `"${r.name}"`,
    r.solution_found ? 'YES' : 'NO',
    r.path_cost,
    r.path_length,
    r.nodes_expanded,
    r.nodes_generated,
    r.max_frontier_size,
    r.execution_time_ms,
    `"${r.optimality_guarantee.replace(/"/g, '""')}"`,
    `"${r.completeness_guarantee.replace(/"/g, '""')}"`,
    `"${r.notes.replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch {
    return false;
  }
}
