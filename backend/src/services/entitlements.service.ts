import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type ProFeature =
    | 'paymentGateway'
    | 'customerCRM'
    | 'salesAnalytics'
    | 'campaigns'
    | 'auditLog'
    | 'customBranding'
    | 'pageEditor'
    | 'removeBranding';

export interface PlanLimits {
    maxAdmins: number;
    maxSchedules: number;
    maxAppointmentsPerMonth: number;
}

export interface PlanFeatures {
    paymentGateway: boolean;
    customerCRM: boolean;
    salesAnalytics: boolean;
    campaigns: boolean;
    auditLog: boolean;
    customBranding: boolean;
    pageEditor: boolean;
    removeBranding: boolean;
}

export interface Entitlements {
    tier: 'free' | 'pro';
    proUntil: Date | null;
    limits: PlanLimits;
    features: PlanFeatures;
}

const FREE_LIMITS: PlanLimits = {
    maxAdmins: 1,
    maxSchedules: 1,
    maxAppointmentsPerMonth: 50,
};

const PRO_LIMITS: PlanLimits = {
    maxAdmins: 5,
    maxSchedules: -1,
    maxAppointmentsPerMonth: -1,
};

const FREE_FEATURES: PlanFeatures = {
    paymentGateway: false,
    customerCRM: false,
    salesAnalytics: false,
    campaigns: false,
    auditLog: false,
    customBranding: false,
    pageEditor: false,
    removeBranding: false,
};

const PRO_FEATURES: PlanFeatures = {
    paymentGateway: true,
    customerCRM: true,
    salesAnalytics: true,
    campaigns: true,
    auditLog: true,
    customBranding: true,
    pageEditor: true,
    removeBranding: true,
};

export const FREE_ENTITLEMENTS: Omit<Entitlements, 'proUntil'> = {
    tier: 'free',
    limits: FREE_LIMITS,
    features: FREE_FEATURES,
};

export const PRO_ENTITLEMENTS: Omit<Entitlements, 'proUntil'> = {
    tier: 'pro',
    limits: PRO_LIMITS,
    features: PRO_FEATURES,
};

/**
 * Computes the entitlements for a tenant.
 * Pro is active when proUntil > now(). Otherwise the tenant is on Free.
 */
export async function getTenantEntitlements(tenantId: string): Promise<Entitlements> {
    const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { proUntil: true },
    });

    const proUntil = tenant?.proUntil ?? null;
    const isPro = proUntil !== null && proUntil.getTime() > Date.now();

    if (isPro) {
        return { ...PRO_ENTITLEMENTS, proUntil };
    }
    return { ...FREE_ENTITLEMENTS, proUntil };
}

/**
 * Returns true if a tenant has access to a specific Pro feature.
 */
export async function tenantHasFeature(tenantId: string, feature: ProFeature): Promise<boolean> {
    const ent = await getTenantEntitlements(tenantId);
    return ent.features[feature] === true;
}
