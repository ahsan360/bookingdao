'use client';

import { useState, useEffect, useRef } from 'react';
import {
    Upload, X, Image as ImageIcon, Type, FileText, Phone, MapPin,
    Facebook, Instagram, MessageCircle, Palette, Save, Loader2, Trash2, Eye
} from 'lucide-react';
import { useToast } from '@/components/useToast';
import api from '@/lib/api';
import type { PageConfig } from '@/types';

export default function PageConfigForm() {
    const [config, setConfig] = useState<PageConfig>({
        primaryColor: '#4F46E5',
        galleryUrls: [],
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
    const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
    const logoRef = useRef<HTMLInputElement>(null);
    const bannerRef = useRef<HTMLInputElement>(null);
    const galleryRef = useRef<HTMLInputElement>(null);
    const { addToast, ToastContainer } = useToast();

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const response = await api.get('/admin/page-config');
            if (response.data && response.data.id) {
                setConfig(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch page config:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (
        e: React.ChangeEvent<HTMLInputElement>,
        type: 'logo' | 'banner' | 'gallery'
    ) => {
        const files = e.target.files;
        if (!files) return;

        if (type === 'logo') {
            const file = files[0];
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        } else if (type === 'banner') {
            const file = files[0];
            setBannerFile(file);
            setBannerPreview(URL.createObjectURL(file));
        } else {
            const newFiles = Array.from(files);
            const totalGallery = (config.galleryUrls?.length || 0) + galleryFiles.length + newFiles.length;
            if (totalGallery > 6) {
                addToast('Maximum 6 gallery images allowed', 'error');
                return;
            }
            setGalleryFiles((prev) => [...prev, ...newFiles]);
            setGalleryPreviews((prev) => [...prev, ...newFiles.map((f) => URL.createObjectURL(f))]);
        }

        // Reset input
        e.target.value = '';
    };

    const removeGalleryPreview = (index: number) => {
        setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
        setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const removeExistingGalleryImage = async (imageUrl: string) => {
        try {
            await api.delete('/admin/page-config/gallery', {
                data: { imageUrl },
            });
            setConfig((prev) => ({
                ...prev,
                galleryUrls: prev.galleryUrls?.filter((url) => url !== imageUrl) || [],
            }));
            addToast('Gallery image removed', 'success');
        } catch (error) {
            addToast('Failed to remove image', 'error');
        }
    };

    const removeImage = async (field: 'logo' | 'banner') => {
        if (field === 'logo' && logoFile) {
            setLogoFile(null);
            setLogoPreview(null);
            return;
        }
        if (field === 'banner' && bannerFile) {
            setBannerFile(null);
            setBannerPreview(null);
            return;
        }

        // Remove from server
        try {
            await api.delete(`/admin/page-config/${field}`);
            setConfig((prev) => ({
                ...prev,
                [field === 'logo' ? 'logoUrl' : 'bannerUrl']: null,
            }));
            if (field === 'logo') setLogoPreview(null);
            else setBannerPreview(null);
            addToast(`${field} removed`, 'success');
        } catch (error) {
            addToast(`Failed to remove ${field}`, 'error');
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const formData = new FormData();

            // Text fields
            if (config.headline) formData.append('headline', config.headline);
            if (config.description) formData.append('description', config.description);
            if (config.aboutText) formData.append('aboutText', config.aboutText);
            if (config.primaryColor) formData.append('primaryColor', config.primaryColor);
            if (config.phone) formData.append('phone', config.phone);
            if (config.address) formData.append('address', config.address);
            if (config.socialFacebook) formData.append('socialFacebook', config.socialFacebook);
            if (config.socialInstagram) formData.append('socialInstagram', config.socialInstagram);
            if (config.socialWhatsapp) formData.append('socialWhatsapp', config.socialWhatsapp);

            // Files
            if (logoFile) formData.append('logo', logoFile);
            if (bannerFile) formData.append('banner', bannerFile);
            galleryFiles.forEach((file) => formData.append('gallery', file));

            const response = await api.put('/admin/page-config', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setConfig(response.data);
            setLogoFile(null);
            setBannerFile(null);
            setGalleryFiles([]);
            setLogoPreview(null);
            setBannerPreview(null);
            setGalleryPreviews([]);
            addToast('Page settings saved successfully!', 'success');
        } catch (error: any) {
            console.error('Save page config error:', error);
            addToast(error.response?.data?.error || 'Failed to save settings', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handlePreview = () => {
        const tenant = localStorage.getItem('tenant');
        if (tenant) {
            const t = JSON.parse(tenant);
            window.open(`http://${t.subdomain}.localhost:3000`, '_blank');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <ToastContainer />

            {/* Preview Button */}
            <div className="flex justify-end">
                <button onClick={handlePreview} className="btn-secondary flex items-center space-x-2">
                    <Eye className="w-4 h-4" />
                    <span>Preview Booking Page</span>
                </button>
            </div>

            {/* Logo & Banner Section */}
            <div className="card">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center space-x-2">
                    <ImageIcon className="w-5 h-5 text-primary-600" />
                    <span>Images</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Logo */}
                    <div>
                        <label className="label text-sm">Business Logo</label>
                        <div className="relative">
                            {(logoPreview || config.logoUrl) ? (
                                <div className="relative group">
                                    <img
                                        src={logoPreview || config.logoUrl!}
                                        alt="Logo"
                                        className="w-32 h-32 object-contain rounded-xl border-2 border-slate-200 bg-white p-2"
                                    />
                                    <button
                                        onClick={() => removeImage('logo')}
                                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => logoRef.current?.click()}
                                    className="w-32 h-32 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:border-primary-400 hover:text-primary-500 transition-colors"
                                >
                                    <Upload className="w-6 h-6 mb-1" />
                                    <span className="text-xs">Upload Logo</span>
                                </button>
                            )}
                            <input
                                ref={logoRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleFileSelect(e, 'logo')}
                            />
                            {(logoPreview || config.logoUrl) && (
                                <button
                                    onClick={() => logoRef.current?.click()}
                                    className="mt-2 text-xs text-primary-600 hover:underline"
                                >
                                    Change logo
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Banner */}
                    <div>
                        <label className="label text-sm">Banner Image</label>
                        <div className="relative">
                            {(bannerPreview || config.bannerUrl) ? (
                                <div className="relative group">
                                    <img
                                        src={bannerPreview || config.bannerUrl!}
                                        alt="Banner"
                                        className="w-full h-32 object-cover rounded-xl border-2 border-slate-200"
                                    />
                                    <button
                                        onClick={() => removeImage('banner')}
                                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => bannerRef.current?.click()}
                                    className="w-full h-32 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:border-primary-400 hover:text-primary-500 transition-colors"
                                >
                                    <Upload className="w-6 h-6 mb-1" />
                                    <span className="text-xs">Upload Banner</span>
                                </button>
                            )}
                            <input
                                ref={bannerRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleFileSelect(e, 'banner')}
                            />
                            {(bannerPreview || config.bannerUrl) && (
                                <button
                                    onClick={() => bannerRef.current?.click()}
                                    className="mt-2 text-xs text-primary-600 hover:underline"
                                >
                                    Change banner
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Gallery */}
                <div className="mt-6">
                    <label className="label text-sm">Gallery Images (max 6)</label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                        {/* Existing gallery images */}
                        {config.galleryUrls?.map((url, i) => (
                            <div key={url} className="relative group">
                                <img
                                    src={url}
                                    alt={`Gallery ${i + 1}`}
                                    className="w-full h-24 object-cover rounded-lg border-2 border-slate-200"
                                />
                                <button
                                    onClick={() => removeExistingGalleryImage(url)}
                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}

                        {/* New gallery previews */}
                        {galleryPreviews.map((preview, i) => (
                            <div key={preview} className="relative group">
                                <img
                                    src={preview}
                                    alt={`New ${i + 1}`}
                                    className="w-full h-24 object-cover rounded-lg border-2 border-primary-300"
                                />
                                <button
                                    onClick={() => removeGalleryPreview(i)}
                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}

                        {/* Add button */}
                        {((config.galleryUrls?.length || 0) + galleryFiles.length) < 6 && (
                            <button
                                onClick={() => galleryRef.current?.click()}
                                className="w-full h-24 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:border-primary-400 hover:text-primary-500 transition-colors"
                            >
                                <Upload className="w-5 h-5 mb-1" />
                                <span className="text-xs">Add</span>
                            </button>
                        )}
                    </div>
                    <input
                        ref={galleryRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => handleFileSelect(e, 'gallery')}
                    />
                </div>
            </div>

            {/* Text Content Section */}
            <div className="card">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center space-x-2">
                    <Type className="w-5 h-5 text-primary-600" />
                    <span>Page Content</span>
                </h3>

                <div className="space-y-4">
                    <div>
                        <label className="label text-sm">Headline</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="e.g. Welcome to My Salon"
                            value={config.headline || ''}
                            onChange={(e) => setConfig({ ...config, headline: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="label text-sm">Short Description</label>
                        <textarea
                            className="input-field"
                            rows={2}
                            placeholder="A brief tagline for your business..."
                            value={config.description || ''}
                            onChange={(e) => setConfig({ ...config, description: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="label text-sm">About Your Business</label>
                        <textarea
                            className="input-field"
                            rows={4}
                            placeholder="Tell your customers about your services, experience, and what makes you special..."
                            value={config.aboutText || ''}
                            onChange={(e) => setConfig({ ...config, aboutText: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            {/* Contact & Social Section */}
            <div className="card">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center space-x-2">
                    <Phone className="w-5 h-5 text-primary-600" />
                    <span>Contact & Social</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="label text-sm flex items-center space-x-1">
                            <Phone className="w-4 h-4" />
                            <span>Phone Number</span>
                        </label>
                        <input
                            type="tel"
                            className="input-field"
                            placeholder="+880 1XXX-XXXXXX"
                            value={config.phone || ''}
                            onChange={(e) => setConfig({ ...config, phone: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="label text-sm flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>Address</span>
                        </label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Your business address"
                            value={config.address || ''}
                            onChange={(e) => setConfig({ ...config, address: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="label text-sm flex items-center space-x-1">
                            <Facebook className="w-4 h-4" />
                            <span>Facebook URL</span>
                        </label>
                        <input
                            type="url"
                            className="input-field"
                            placeholder="https://facebook.com/yourbusiness"
                            value={config.socialFacebook || ''}
                            onChange={(e) => setConfig({ ...config, socialFacebook: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="label text-sm flex items-center space-x-1">
                            <Instagram className="w-4 h-4" />
                            <span>Instagram URL</span>
                        </label>
                        <input
                            type="url"
                            className="input-field"
                            placeholder="https://instagram.com/yourbusiness"
                            value={config.socialInstagram || ''}
                            onChange={(e) => setConfig({ ...config, socialInstagram: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="label text-sm flex items-center space-x-1">
                            <MessageCircle className="w-4 h-4" />
                            <span>WhatsApp Number</span>
                        </label>
                        <input
                            type="tel"
                            className="input-field"
                            placeholder="+880 1XXX-XXXXXX"
                            value={config.socialWhatsapp || ''}
                            onChange={(e) => setConfig({ ...config, socialWhatsapp: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="label text-sm flex items-center space-x-1">
                            <Palette className="w-4 h-4" />
                            <span>Theme Color</span>
                        </label>
                        <div className="flex items-center space-x-3">
                            <input
                                type="color"
                                className="w-10 h-10 rounded-lg cursor-pointer border-2 border-slate-200"
                                value={config.primaryColor || '#4F46E5'}
                                onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                            />
                            <input
                                type="text"
                                className="input-field flex-1"
                                value={config.primaryColor || '#4F46E5'}
                                onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary flex items-center space-x-2 px-8 disabled:opacity-50"
                >
                    {saving ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Saving...</span>
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            <span>Save Changes</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
