import React from 'react';
import { PageHeader } from '../components/PageHeader';
import { DatabaseManager } from '../components/DatabaseManager';
import { Database } from 'lucide-react';

export const DatabaseSettingsPage: React.FC = () => {
    return (
        <div className="space-y-6">
            <PageHeader 
                title="قاعدة البيانات" 
                subtitle="التحكم الكامل والسيادة المطلقة على بيانات الفندق"
                icon={Database}
            />
            <div className="max-w-7xl mx-auto">
                <DatabaseManager />
            </div>
        </div>
    );
};
