import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate, AuthRequest } from '../../middleware/auth.middleware';
import { prisma } from '../../lib/prisma';

const router = Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../../uploads/tenant-pages');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer config
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req: any, file, cb) => {
        const tenantId = req.user?.tenantId || 'unknown';
        const ext = path.extname(file.originalname);
        const fieldName = file.fieldname; // logo, banner, gallery
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${tenantId}-${fieldName}-${uniqueSuffix}${ext}`);
    },
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only JPEG, PNG, WebP, and GIF images are allowed'));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
});

const uploadFields = upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'banner', maxCount: 1 },
    { name: 'gallery', maxCount: 6 },
]);

// Helper to build file URL from request
function getFileUrl(req: AuthRequest, filename: string): string {
    const protocol = req.protocol;
    const host = req.get('host');
    return `${protocol}://${host}/uploads/tenant-pages/${filename}`;
}

// Helper to delete old file
function deleteOldFile(fileUrl: string | null | undefined) {
    if (!fileUrl) return;
    try {
        const filename = fileUrl.split('/uploads/tenant-pages/').pop();
        if (filename) {
            const filePath = path.join(uploadsDir, filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
    } catch (err) {
        console.error('Failed to delete old file:', err);
    }
}

// GET - Get page config for authenticated tenant
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const tenantId = req.user!.tenantId;

        const config = await prisma.tenantPageConfig.findUnique({
            where: { tenantId },
        });

        res.json(config || {});
    } catch (error) {
        console.error('Get page config error:', error);
        res.status(500).json({ error: 'Failed to get page config' });
    }
});

// PUT - Create or update page config with file uploads
router.put('/', authenticate, async (req: AuthRequest, res: Response) => {
    // Run multer as a promise
    await new Promise<void>((resolve, reject) => {
        uploadFields(req, res, (err) => {
            if (err) reject(err);
            else resolve();
        });
    }).catch((uploadErr) => {
        if (uploadErr instanceof multer.MulterError) {
            res.status(400).json({ error: `Upload error: ${uploadErr.message}` });
        } else {
            res.status(400).json({ error: uploadErr.message });
        }
        return;
    });

    // If response already sent due to upload error, stop
    if (res.headersSent) return;

    try {
        const tenantId = req.user!.tenantId;
        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

        console.log('Page config update - tenantId:', tenantId);
        console.log('Page config update - body:', req.body);
        console.log('Page config update - files:', files ? Object.keys(files) : 'none');

        const {
            headline,
            description,
            aboutText,
            primaryColor,
            phone,
            address,
            socialFacebook,
            socialInstagram,
            socialWhatsapp,
        } = req.body;

        // Get existing config to clean up old files if replaced
        const existing = await prisma.tenantPageConfig.findUnique({
            where: { tenantId },
        });

        // Build update data
        const data: any = {
            headline: headline || null,
            description: description || null,
            aboutText: aboutText || null,
            primaryColor: primaryColor || '#4F46E5',
            phone: phone || null,
            address: address || null,
            socialFacebook: socialFacebook || null,
            socialInstagram: socialInstagram || null,
            socialWhatsapp: socialWhatsapp || null,
        };

        // Handle logo upload
        if (files?.logo?.[0]) {
            deleteOldFile(existing?.logoUrl);
            data.logoUrl = getFileUrl(req, files.logo[0].filename);
        }

        // Handle banner upload
        if (files?.banner?.[0]) {
            deleteOldFile(existing?.bannerUrl);
            data.bannerUrl = getFileUrl(req, files.banner[0].filename);
        }

        // Handle gallery uploads (append to existing)
        if (files?.gallery?.length) {
            const newUrls = files.gallery.map((f) => getFileUrl(req, f.filename));
            const existingGallery = existing?.galleryUrls || [];
            data.galleryUrls = [...existingGallery, ...newUrls].slice(0, 6); // Max 6
        }

        const config = await prisma.tenantPageConfig.upsert({
            where: { tenantId },
            create: { tenantId, ...data },
            update: data,
        });

        res.json(config);
    } catch (error: any) {
        console.error('Update page config error:', error?.message || error);
        console.error('Full stack:', error?.stack);
        res.status(500).json({ error: 'Failed to update page config', details: error?.message });
    }
});

// DELETE gallery image
router.delete('/gallery', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const tenantId = req.user!.tenantId;
        const { imageUrl } = req.body;

        if (!imageUrl) {
            return res.status(400).json({ error: 'imageUrl is required' });
        }

        const config = await prisma.tenantPageConfig.findUnique({
            where: { tenantId },
        });

        if (!config) {
            return res.status(404).json({ error: 'Page config not found' });
        }

        deleteOldFile(imageUrl);

        const updatedGallery = config.galleryUrls.filter((url) => url !== imageUrl);

        const updated = await prisma.tenantPageConfig.update({
            where: { tenantId },
            data: { galleryUrls: updatedGallery },
        });

        res.json(updated);
    } catch (error) {
        console.error('Delete gallery image error:', error);
        res.status(500).json({ error: 'Failed to delete gallery image' });
    }
});

// DELETE logo or banner
router.delete('/:field', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const tenantId = req.user!.tenantId;
        const { field } = req.params;

        if (!['logo', 'banner'].includes(field)) {
            return res.status(400).json({ error: 'Field must be logo or banner' });
        }

        const config = await prisma.tenantPageConfig.findUnique({
            where: { tenantId },
        });

        if (!config) {
            return res.status(404).json({ error: 'Page config not found' });
        }

        const fieldKey = field === 'logo' ? 'logoUrl' : 'bannerUrl';
        deleteOldFile(config[fieldKey]);

        const updated = await prisma.tenantPageConfig.update({
            where: { tenantId },
            data: { [fieldKey]: null },
        });

        res.json(updated);
    } catch (error) {
        console.error('Delete image error:', error);
        res.status(500).json({ error: 'Failed to delete image' });
    }
});

export default router;
