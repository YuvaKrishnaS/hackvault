'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/lib/auth-context';
import { getAllPasswords, addPassword } from '@/lib/storage/database';
import { encryptData, decryptData, generateIV, base64ToUint8Array, uint8ArrayToBase64 } from '@/lib/crypto/encryption';
import { useToast } from '@/components/ui/toast-simple';
import { Download, Upload, AlertTriangle } from 'lucide-react';

interface ExportImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

export function ExportImportDialog({ isOpen, onClose, onImportComplete }: ExportImportDialogProps) {
  const { encryptionKey } = useAuth();
  const { showToast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  const handleExport = async () => {
    if (!encryptionKey) {
      showToast('Encryption key not available', 'error');
      return;
    }

    setIsExporting(true);

    try {
      const passwords = await getAllPasswords();
      
      // Decrypt all passwords for export
      const decryptedData = [];
      for (const entry of passwords) {
        try {
          const decryptedPassword = await decryptData(
            entry.password,
            encryptionKey,
            base64ToUint8Array(entry.iv)
          );
          
          decryptedData.push({
            title: entry.title,
            username: entry.username,
            password: decryptedPassword,
            url: entry.url || '',
            category: entry.category,
            notes: entry.notes || '',
            created: new Date(entry.createdAt).toISOString(),
            updated: new Date(entry.updatedAt).toISOString(),
          });
        } catch (error) {
          console.error('Failed to decrypt entry:', entry.id, error);
        }
      }

      // Create CSV content
      const headers = ['Title', 'Username', 'Password', 'URL', 'Category', 'Notes', 'Created', 'Updated'];
      const csvRows = [headers.join(',')];

      decryptedData.forEach((item) => {
        const row = [
          escapeCSV(item.title),
          escapeCSV(item.username),
          escapeCSV(item.password),
          escapeCSV(item.url),
          escapeCSV(item.category),
          escapeCSV(item.notes),
          escapeCSV(item.created),
          escapeCSV(item.updated),
        ];
        csvRows.push(row.join(','));
      });

      const csvContent = csvRows.join('\n');

      // Download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `hackvault-backup-${Date.now()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast('Passwords exported successfully', 'success');
    } catch (error) {
      showToast('Failed to export passwords', 'error');
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      showToast('Please select a file to import', 'error');
      return;
    }

    if (!encryptionKey) {
      showToast('Encryption key not available', 'error');
      return;
    }

    setIsImporting(true);

    try {
      const text = await importFile.text();
      const lines = text.split('\n');
      
      if (lines.length < 2) {
        showToast('Invalid CSV file', 'error');
        return;
      }

      let imported = 0;
      const errors = [];

      // Skip header row, process data rows
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        try {
          const values = parseCSVLine(line);
          
          if (values.length >= 5) {
            const iv = generateIV();
            const encryptedPassword = await encryptData(values[2], encryptionKey, iv);

            await addPassword({
              title: values[0] || 'Imported Password',
              username: values[1] || '',
              password: encryptedPassword,
              url: values[3] || undefined,
              category: values[4] || 'General',
              notes: values[5] || undefined,
              createdAt: Date.now(),
              updatedAt: Date.now(),
              iv: uint8ArrayToBase64(iv),
            });

            imported++;
          }
        } catch (error) {
          errors.push(`Line ${i + 1}: ${error}`);
          console.error(`Error importing line ${i + 1}:`, error);
        }
      }

      if (imported > 0) {
        showToast(`Successfully imported ${imported} password${imported !== 1 ? 's' : ''}`, 'success');
        onImportComplete();
        onClose();
      } else {
        showToast('No passwords were imported', 'error');
      }

      if (errors.length > 0) {
        console.error('Import errors:', errors);
      }
    } catch (error) {
      showToast('Failed to import passwords', 'error');
      console.error(error);
    } finally {
      setIsImporting(false);
    }
  };

  const escapeCSV = (value: string): string => {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  const parseCSVLine = (line: string): string[] => {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    values.push(current);
    return values;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md border-2 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <DialogHeader className="border-b-2 border-black dark:border-white pb-4">
          <DialogTitle className="text-2xl font-black">Export / Import</DialogTitle>
          <DialogDescription className="sr-only">Export or import your passwords</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="export" className="pt-4">
          <TabsList className="grid w-full grid-cols-2 border-2 border-black dark:border-white">
            <TabsTrigger value="export" className="font-bold">Export</TabsTrigger>
            <TabsTrigger value="import" className="font-bold">Import</TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="space-y-4 mt-4">
            <div className="p-4 border-2 border-black dark:border-white bg-gray-50 dark:bg-[#2a2a2a]">
              <div className="flex gap-2 items-start">
                <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-bold mb-1">Security Warning</p>
                  <p className="text-black/70 dark:text-white/70">
                    Exported CSV files contain your passwords in plain text. 
                    Store them securely and delete after use.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-black/70 dark:text-white/70">
                Export all your passwords to a CSV file for backup or migration.
              </p>
            </div>

            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 border-2 border-black dark:border-white font-bold py-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? 'Exporting...' : 'Export to CSV'}
            </Button>
          </TabsContent>

          <TabsContent value="import" className="space-y-4 mt-4">
            <div className="p-4 border-2 border-black dark:border-white bg-gray-50 dark:bg-[#2a2a2a]">
              <div className="flex gap-2 items-start">
                <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-bold mb-1">Import Format</p>
                  <p className="text-black/70 dark:text-white/70">
                    CSV file must have columns: Title, Username, Password, URL, Category, Notes
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-bold block mb-2">Select CSV File</label>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                className="w-full border-2 border-black dark:border-white p-2 font-medium"
              />
            </div>

            {importFile && (
              <div className="text-sm p-3 border-2 border-black dark:border-white bg-gray-50 dark:bg-[#2a2a2a]">
                <p className="font-bold">Selected: {importFile.name}</p>
                <p className="text-black/60 dark:text-white/60">Size: {(importFile.size / 1024).toFixed(2)} KB</p>
              </div>
            )}

            <Button
              onClick={handleImport}
              disabled={!importFile || isImporting}
              className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 border-2 border-black dark:border-white font-bold py-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isImporting ? 'Importing...' : 'Import from CSV'}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
