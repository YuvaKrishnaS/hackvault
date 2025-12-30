'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DecryptedPasswordEntry } from '@/lib/types';
import { generateHealthReport, getHealthColor, getHealthGrade } from '@/lib/password-health';
import { Shield, AlertTriangle, Info, TrendingUp } from 'lucide-react';

interface HealthDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  passwords: DecryptedPasswordEntry[];
  onFixPassword: (id: number) => void;
}

export function HealthDashboard({ isOpen, onClose, passwords, onFixPassword }: HealthDashboardProps) {
  const report = generateHealthReport(passwords);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto border-2 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <DialogHeader className="border-b-2 border-black dark:border-white pb-4">
          <DialogTitle className="text-2xl font-black">Password Health</DialogTitle>
          <DialogDescription className="sr-only">Password health analysis</DialogDescription>

        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Score Card */}
          <div className="border-2 border-black dark:border-white p-6 bg-gray-50 dark:bg-[#2a2a2a]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-black/60 dark:text-white/60 mb-1">
                  OVERALL HEALTH SCORE
                </h3>
                <div className={`text-5xl font-black ${getHealthColor(report.score)}`}>
                  {report.score}
                  <span className="text-2xl">/100</span>
                </div>
                <p className="text-lg font-black mt-1">Grade: {getHealthGrade(report.score)}</p>
              </div>
              <div className="text-right">
                <Shield className={`h-20 w-20 ${getHealthColor(report.score)}`} />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center p-3 border-2 border-black dark:border-white bg-white dark:bg-[#1a1a1a]">
                <div className="text-2xl font-black">{report.total}</div>
                <div className="text-xs font-bold text-black/60 dark:text-white/60">Total</div>
              </div>
              <div className="text-center p-3 border-2 border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20">
                <div className="text-2xl font-black text-yellow-600">{report.weak}</div>
                <div className="text-xs font-bold text-yellow-600">Weak</div>
              </div>
              <div className="text-center p-3 border-2 border-red-600 bg-red-50 dark:bg-red-900/20">
                <div className="text-2xl font-black text-red-600">{report.reused}</div>
                <div className="text-xs font-bold text-red-600">Reused</div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {report.score < 80 && (
            <div className="border-2 border-black dark:border-white p-4 bg-blue-50 dark:bg-blue-900/10">
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-black mb-2">How to Improve</h4>
                  <ul className="space-y-1 text-sm">
                    {report.weak > 0 && (
                      <li>• Strengthen {report.weak} weak password{report.weak > 1 ? 's' : ''}</li>
                    )}
                    {report.reused > 0 && (
                      <li>• Replace {report.reused} reused password{report.reused > 1 ? 's' : ''}</li>
                    )}
                    <li>• Use the password generator for strong, unique passwords</li>
                    <li>• Enable two-factor authentication where possible</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Issues List */}
          {report.issues.length > 0 ? (
            <div>
              <h3 className="text-lg font-black mb-3">
                Security Issues ({report.issues.length})
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {report.issues.map((issue, index) => (
                  <div
                    key={`${issue.id}-${index}`}
                    className={`p-4 border-2 ${
                      issue.severity === 'critical'
                        ? 'border-red-600 bg-red-50 dark:bg-red-900/10'
                        : issue.severity === 'warning'
                        ? 'border-yellow-600 bg-yellow-50 dark:bg-yellow-900/10'
                        : 'border-blue-600 bg-blue-50 dark:bg-blue-900/10'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {issue.severity === 'critical' ? (
                            <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
                          ) : issue.severity === 'warning' ? (
                            <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                          ) : (
                            <Info className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          )}
                          <h4 className="font-black truncate">{issue.title}</h4>
                          <Badge
                            className={`text-xs font-bold ${
                              issue.severity === 'critical'
                                ? 'bg-red-600 text-white'
                                : issue.severity === 'warning'
                                ? 'bg-yellow-600 text-white'
                                : 'bg-blue-600 text-white'
                            }`}
                          >
                            {issue.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm mb-2">{issue.issue}</p>
                        <p className="text-xs text-black/60 dark:text-white/60">
                          💡 {issue.recommendation}
                        </p>
                      </div>
                      <Button
                        onClick={() => {
                          onFixPassword(issue.id);
                          onClose();
                        }}
                        size="sm"
                        className="bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white font-bold flex-shrink-0"
                      >
                        Fix
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 border-2 border-green-600 bg-green-50 dark:bg-green-900/10">
              <Shield className="h-16 w-16 mx-auto mb-3 text-green-600" />
              <h3 className="text-xl font-black text-green-600 mb-2">All Clear!</h3>
              <p className="text-sm text-green-600">
                Your passwords are in excellent shape. Keep up the good work!
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
