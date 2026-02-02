import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Badge } from "../ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { 
    Car, Truck, Wrench, Package, Bike, Sailboat, 
    Plane, Tractor, Forklift, HardHat, Camera, Laptop,
    FileText, Bell, Plus, Trash2, Calendar, Download,
    Edit2, Save, X, ExternalLink, ImagePlus, Loader2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import moment from 'moment'

const iconOptions = [
    { id: 'car', icon: Car, label: 'Car' },
    { id: 'truck', icon: Truck, label: 'Truck' },
    { id: 'wrench', icon: Wrench, label: 'Tool' },
    { id: 'package', icon: Package, label: 'Package' },
    { id: 'bike', icon: Bike, label: 'Bike' },
    { id: 'boat', icon: Sailboat, label: 'Boat' },
    { id: 'plane', icon: Plane, label: 'Plane' },
    { id: 'tractor', icon: Tractor, label: 'Tractor' },
    { id: 'forklift', icon: Forklift, label: 'Forklift' },
    { id: 'hardhat', icon: HardHat, label: 'Equipment' },
    { id: 'camera', icon: Camera, label: 'Camera' },
    { id: 'laptop', icon: Laptop, label: 'Tech' },
]

const colorOptions = [
    { id: 'from-blue-500 to-blue-600', label: 'Blue' },
    { id: 'from-emerald-500 to-emerald-600', label: 'Green' },
    { id: 'from-amber-500 to-amber-600', label: 'Amber' },
    { id: 'from-red-500 to-red-600', label: 'Red' },
    { id: 'from-purple-500 to-purple-600', label: 'Purple' },
    { id: 'from-pink-500 to-pink-600', label: 'Pink' },
    { id: 'from-slate-600 to-slate-700', label: 'Slate' },
    { id: 'from-cyan-500 to-cyan-600', label: 'Cyan' },
]

export default function ItemModal({ 
    item, 
    isOpen, 
    onClose, 
    onSave, 
    onDelete,
    isNew = false,
    categories = [],
    onAddCategory,
    userId
}) {
    const [editMode, setEditMode] = useState(isNew)
    const [formData, setFormData] = useState(null)
    const [newReminder, setNewReminder] = useState({ title: '', date: '' })
    const [customCategoryInput, setCustomCategoryInput] = useState('')
    const [uploading, setUploading] = useState(false)

    // Reset form data when item changes or modal opens
    React.useEffect(() => {
        if (isOpen && item) {
            setFormData({
                ...item,
                customImage: item.custom_image,
                assignedTo: item.assigned_to,
                assignedFrom: item.assigned_from,
                assignedUntil: item.assigned_until,
                documents: item.documents ? [...item.documents] : [],
                reminders: item.reminders ? [...item.reminders] : []
            })
            setEditMode(isNew)
        } else if (isOpen && !item) {
            setFormData({
                name: '',
                category: '',
                description: '',
                icon: 'package',
                color: 'from-blue-500 to-blue-600',
                documents: [],
                reminders: []
            })
            setEditMode(true)
        }
    }, [item, isOpen, isNew])

    const handleSave = () => {
        onSave?.(formData)
        setEditMode(false)
    }

    const addReminder = () => {
        if (!newReminder.title || !newReminder.date) return
        setFormData({
            ...formData,
            reminders: [...(formData.reminders || []), { 
                id: Date.now(), 
                ...newReminder 
            }]
        })
        setNewReminder({ title: '', date: '' })
    }

    const removeReminder = (id) => {
        setFormData({
            ...formData,
            reminders: formData.reminders.filter(r => r.id !== id)
        })
    }

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files)
        setUploading(true)

        for (const file of files) {
            const fileExt = file.name.split('.').pop()
            const fileName = `${userId}/${Date.now()}.${fileExt}`

            const { data, error } = await supabase.storage
                .from('documents')
                .upload(fileName, file)

            if (!error) {
                const { data: { publicUrl } } = supabase.storage
                    .from('documents')
                    .getPublicUrl(fileName)

                const newDoc = {
                    id: Date.now() + Math.random(),
                    name: file.name,
                    url: publicUrl,
                    type: file.type,
                    uploadedAt: new Date().toISOString()
                }

                setFormData(prev => ({
                    ...prev,
                    documents: [...(prev.documents || []), newDoc]
                }))
            }
        }
        setUploading(false)
    }

    const removeDocument = (id) => {
        setFormData({
            ...formData,
            documents: formData.documents.filter(d => d.id !== id)
        })
    }

    if (!formData) return null

    const SelectedIcon = iconOptions.find(i => i.id === formData.icon)?.icon || Package
    const hasCustomImage = formData.customImage

    return (
        <Dialog open={isOpen} onOpenChange={editMode && !isNew ? () => setEditMode(false) : onClose}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0 gap-0 [&>button]:hidden">
                {/* Header with Icon */}
                <div className={`bg-gradient-to-br ${formData.color} p-6 text-white`}>
                    <DialogHeader>
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center overflow-hidden">
                                    {hasCustomImage ? (
                                        <img src={formData.customImage} alt="Custom" className="w-full h-full object-cover" />
                                    ) : (
                                        <SelectedIcon className="w-8 h-8 text-white" />
                                    )}
                                </div>
                                <div>
                                    <DialogTitle className="text-xl font-bold text-white">
                                        {editMode && isNew ? 'New Item' : formData.name || 'Item Details'}
                                    </DialogTitle>
                                    <p className="text-white/70 text-sm mt-1">
                                        {formData.category || 'Asset'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                {!isNew && !editMode && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setEditMode(true)}
                                        className="text-white hover:bg-white/20 gap-1"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        <span className="text-sm">Edit</span>
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={editMode && !isNew ? () => setEditMode(false) : onClose}
                                    className="text-white hover:bg-white/20"
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    </DialogHeader>
                </div>

                <Tabs defaultValue="details" className="w-full">
                    <TabsList className="w-full justify-start rounded-none border-b bg-transparent px-4 pt-2">
                        <TabsTrigger value="details" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none">
                            Details
                        </TabsTrigger>
                        <TabsTrigger value="documents" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none">
                            Documents
                        </TabsTrigger>
                        <TabsTrigger value="reminders" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none">
                            Reminders
                        </TabsTrigger>
                    </TabsList>

                    <div className="p-4">
                        <TabsContent value="details" className="mt-0 space-y-4">
                            {editMode ? (
                                <>
                                    <div className="space-y-2">
                                        <Label>Name</Label>
                                        <Input
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            placeholder="e.g., Toyota Camry 2022"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Assigned To</Label>
                                        <Input
                                            value={formData.assignedTo || ''}
                                            onChange={(e) => setFormData({...formData, assignedTo: e.target.value})}
                                            placeholder="e.g., John Smith"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <Label>From Date</Label>
                                            <Input
                                                type="date"
                                                value={formData.assignedFrom || ''}
                                                onChange={(e) => setFormData({...formData, assignedFrom: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>To Date</Label>
                                            <Input
                                                type="date"
                                                value={formData.assignedUntil || ''}
                                                onChange={(e) => setFormData({...formData, assignedUntil: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Category</Label>
                                        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1">
                                            {categories.map(cat => (
                                                <button
                                                    key={cat}
                                                    type="button"
                                                    onClick={() => setFormData({...formData, category: cat})}
                                                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                                                        formData.category === cat
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                    }`}
                                                >
                                                    {cat}
                                                </button>
                                            ))}
                                            <div className="flex items-center gap-1">
                                                <Input
                                                    value={customCategoryInput}
                                                    onChange={(e) => setCustomCategoryInput(e.target.value)}
                                                    placeholder="Other..."
                                                    className="h-8 w-28 text-sm"
                                                />
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 px-2"
                                                    disabled={!customCategoryInput.trim()}
                                                    onClick={() => {
                                                        if (customCategoryInput.trim()) {
                                                            onAddCategory?.(customCategoryInput.trim())
                                                            setFormData({...formData, category: customCategoryInput.trim()})
                                                            setCustomCategoryInput('')
                                                        }
                                                    }}
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Description</Label>
                                        <Textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                                            placeholder="Add notes about this item..."
                                            rows={3}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Icon or Custom Image</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {iconOptions.map(({ id, icon: Icon, label }) => (
                                                <button
                                                    key={id}
                                                    onClick={() => setFormData({...formData, icon: id, customImage: null})}
                                                    className={`
                                                        p-2 rounded-lg border-2 transition-all
                                                        ${formData.icon === id && !formData.customImage
                                                            ? 'border-blue-600 bg-blue-50' 
                                                            : 'border-slate-200 hover:border-slate-300'}
                                                    `}
                                                    title={label}
                                                >
                                                    <Icon className="w-5 h-5 text-slate-600" />
                                                </button>
                                            ))}
                                            <label
                                                className={`
                                                    p-2 rounded-lg border-2 transition-all cursor-pointer
                                                    ${formData.customImage
                                                        ? 'border-blue-600 bg-blue-50' 
                                                        : 'border-dashed border-slate-300 hover:border-slate-400'}
                                                `}
                                                title="Upload custom image"
                                            >
                                                {formData.customImage ? (
                                                    <img 
                                                        src={formData.customImage} 
                                                        alt="Custom" 
                                                        className="w-5 h-5 object-cover rounded"
                                                    />
                                                ) : (
                                                    <ImagePlus className="w-5 h-5 text-slate-400" />
                                                )}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files[0]
                                                        if (file) {
                                                            const url = URL.createObjectURL(file)
                                                            setFormData({...formData, customImage: url, icon: null})
                                                        }
                                                    }}
                                                />
                                            </label>
                                        </div>
                                        {formData.customImage && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setFormData({...formData, customImage: null, icon: 'package'})}
                                                className="text-xs text-slate-500"
                                            >
                                                Remove custom image
                                            </Button>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Color</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {colorOptions.map(({ id, label }) => (
                                                <button
                                                    key={id}
                                                    onClick={() => setFormData({...formData, color: id})}
                                                    className={`
                                                        w-8 h-8 rounded-full bg-gradient-to-br ${id}
                                                        transition-all
                                                        ${formData.color === id 
                                                            ? 'ring-2 ring-offset-2 ring-blue-600' 
                                                            : 'hover:scale-110'}
                                                    `}
                                                    title={label}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-4">
                                    {formData.assignedTo && (
                                        <div>
                                            <Label className="text-slate-500 text-xs">Assigned To</Label>
                                            <p className="text-slate-700 mt-1">{formData.assignedTo}</p>
                                            {(formData.assignedFrom || formData.assignedUntil) && (
                                                <p className="text-slate-500 text-sm mt-1">
                                                    {formData.assignedFrom && moment(formData.assignedFrom).format('MMM D, YYYY')}
                                                    {formData.assignedFrom && formData.assignedUntil && ' → '}
                                                    {formData.assignedUntil && moment(formData.assignedUntil).format('MMM D, YYYY')}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                    <div>
                                        <Label className="text-slate-500 text-xs">Description</Label>
                                        <p className="text-slate-700 mt-1">
                                            {formData.description || 'No description added'}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="documents" className="mt-0">
                            <div className="space-y-4">
                                {editMode && (
                                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-blue-300 transition-colors">
                                        <input
                                            type="file"
                                            multiple
                                            onChange={handleFileUpload}
                                            className="hidden"
                                            id="file-upload"
                                            disabled={uploading}
                                        />
                                        <label htmlFor="file-upload" className="cursor-pointer">
                                            {uploading ? (
                                                <Loader2 className="w-10 h-10 text-blue-500 mx-auto mb-2 animate-spin" />
                                            ) : (
                                                <FileText className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                                            )}
                                            <p className="text-sm text-slate-600 font-medium">
                                                {uploading ? 'Uploading...' : 'Click to upload documents'}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1">PDF, images, or any file type</p>
                                        </label>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    {formData.documents?.length === 0 && (
                                        <p className="text-sm text-slate-400 text-center py-4">No documents uploaded</p>
                                    )}
                                    {formData.documents?.map((doc) => (
                                        <div key={doc.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg group">
                                            <FileText className="w-5 h-5 text-slate-400 shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-700 truncate">{doc.name}</p>
                                                <p className="text-xs text-slate-400">
                                                    {moment(doc.uploadedAt || doc.uploaded_at).format('MMM D, YYYY')}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => window.open(doc.url, '_blank')}
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </Button>
                                                {editMode && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-red-500 hover:text-red-600"
                                                        onClick={() => removeDocument(doc.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="reminders" className="mt-0">
                            <div className="space-y-4">
                                {editMode && (
                                    <div className="p-4 bg-slate-50 rounded-xl space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <Label className="text-xs">Title</Label>
                                                <Input
                                                    value={newReminder.title}
                                                    onChange={(e) => setNewReminder({...newReminder, title: e.target.value})}
                                                    placeholder="e.g., Oil change"
                                                    className="h-9"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs">Date</Label>
                                                <Input
                                                    type="date"
                                                    value={newReminder.date}
                                                    onChange={(e) => setNewReminder({...newReminder, date: e.target.value})}
                                                    className="h-9"
                                                />
                                            </div>
                                        </div>
                                        <Button
                                            onClick={addReminder}
                                            className="w-full h-9"
                                            disabled={!newReminder.title || !newReminder.date}
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Reminder
                                        </Button>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    {formData.reminders?.length === 0 && (
                                        <p className="text-sm text-slate-400 text-center py-4">No reminders set</p>
                                    )}
                                    {formData.reminders?.map((reminder) => {
                                        const daysUntil = moment(reminder.date).diff(moment(), 'days')
                                        const isOverdue = daysUntil < 0
                                        const isUrgent = daysUntil >= 0 && daysUntil <= 3
                                        
                                        return (
                                            <div 
                                                key={reminder.id} 
                                                className={`
                                                    flex items-center gap-3 p-3 rounded-lg border
                                                    ${isOverdue ? 'bg-red-50 border-red-200' : 
                                                      isUrgent ? 'bg-amber-50 border-amber-200' : 
                                                      'bg-slate-50 border-slate-200'}
                                                `}
                                            >
                                                <Bell className={`w-5 h-5 shrink-0 ${
                                                    isOverdue ? 'text-red-500' :
                                                    isUrgent ? 'text-amber-500' :
                                                    'text-slate-400'
                                                }`} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-slate-700 truncate">
                                                        {reminder.title}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {moment(reminder.date).format('MMM D, YYYY')}
                                                    </p>
                                                </div>
                                                <Badge className={`shrink-0 ${
                                                    isOverdue ? 'bg-red-100 text-red-700' :
                                                    isUrgent ? 'bg-amber-100 text-amber-700' :
                                                    'bg-slate-100 text-slate-700'
                                                }`}>
                                                    {isOverdue ? 'Overdue' :
                                                     daysUntil === 0 ? 'Today' :
                                                     daysUntil === 1 ? 'Tomorrow' :
                                                     `${daysUntil}d`}
                                                </Badge>
                                                {editMode && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-red-500 hover:text-red-600"
                                                        onClick={() => removeReminder(reminder.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>

                {/* Footer Actions */}
                <div className="p-4 border-t bg-slate-50 flex justify-between">
                    {!isNew && (
                        <Button
                            variant="ghost"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => onDelete?.(item)}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                        </Button>
                    )}
                    {editMode && (
                        <Button
                            onClick={handleSave}
                            className="bg-blue-600 hover:bg-blue-700 ml-auto"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
