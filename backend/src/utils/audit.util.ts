import { prisma } from '../lib/prisma';

interface AuditLogEntry {
    tenantId: string;
    userId: string;
    userEmail?: string | null;
    userRole: string;
    action: 'create' | 'cancel' | 'update' | 'delete';
    resourceType: 'appointment' | 'schedule' | 'payment' | 'admin' | 'settings';
    resourceId: string;
    details?: Record<string, any>;
}

export async function createAuditLog(entry: AuditLogEntry) {
    try {
        await prisma.auditLog.create({
            data: {
                tenantId: entry.tenantId,
                userId: entry.userId,
                userEmail: entry.userEmail,
                userRole: entry.userRole,
                action: entry.action,
                resourceType: entry.resourceType,
                resourceId: entry.resourceId,
                details: entry.details || {},
            },
        });
    } catch (error) {
        // Audit logging should never break the main flow
        console.error('Failed to create audit log:', error);
    }
}
