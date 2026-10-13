import React from 'react';
import { PageHeader } from '../../components/navigation/PageHeader';
import { Card, CardContent } from '../../components/ui/Card';
import { EmptyState } from '../../components/feedback/EmptyState';
import { LucideIcon, Layers } from 'lucide-react';

export interface ModulePlaceholderProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  emptyTitle?: string;
  emptyDescription?: string;
}

export const ModulePlaceholder: React.FC<ModulePlaceholderProps> = ({
  title,
  description,
  icon: Icon = Layers,
  emptyTitle = 'Module Ready for Data Ingestion',
  emptyDescription = 'This academic management module is wired to the backend database schema and will populate as records are submitted.',
}) => {
  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title={title}
        description={description}
      />

      <Card>
        <CardContent className="p-8">
          <EmptyState
            icon={<Icon className="w-6 h-6 text-slate-400" />}
            title={emptyTitle}
            description={emptyDescription}
          />
        </CardContent>
      </Card>
    </div>
  );
};
