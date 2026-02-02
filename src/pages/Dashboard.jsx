import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { 
    Truck, Search, Settings, Bell, Menu, X, 
    LogOut, ChevronDown, UserPlus, Filter, Loader2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "../components/ui/avatar"

import ClosestReminders from '../components/dashboard/ClosestReminders'
import ItemGrid from '../components/dashboard/ItemGrid'
import ItemModal from '../components/dashboard/ItemModal'
import PricingPlans from '../components/dashboard/PricingPlans'
import AddMemberDialog from '../components/dashboard/AddMemberDialog'

export default function Dashboard({ session }) {
    const [items, setItems] = useState([])
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedItem, setSelectedItem] = useState(null)
    const [isNewItem, setIsNewItem] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [showAddMember, setShowAddMember] = useState(false)
    const [categoryFilter, setCategoryFilter] = useState('All')
    const [customCategories, setCustomCategories] = useState([])

    const defaultCategories = ['Vehicle', 'Equipment', 'Electronics', 'Tools', 'Heavy Equipment']
    const allCategories = [...new Set([...defaultCategories, ...customCategories, ...items.map(i => i.category).filter(Boolean)])]

    // Fetch profile
    useEffect(() => {
        const fetchProfile = async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single()

            if (error && error.code === 'PGRST116') {
                // Profile doesn't exist, create it
                const { data: newProfile } = await supabase
                    .from('profiles')
                    .insert({
                        id: session.user.id,
                        email: session.user.email,
                        full_name: session.user.user_metadata?.full_name || 'User',
                        plan: 'free'
                    })
                    .select()
                    .single()
                setProfile(newProfile)
            } else {
                setProfile(data)
            }
        }
        fetchProfile()
    }, [session])

    // Fetch items with reminders
    useEffect(() => {
        const fetchItems = async () => {
            const { data: itemsData, error } = await supabase
                .from('items')
                .select(`
                    *,
                    reminders (*),
                    documents (*)
                `)
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false })

            if (!error) {
                setItems(itemsData || [])
            }
            setLoading(false)
        }
        fetchItems()
    }, [session])

    // Collect all reminders from all items
    const allReminders = items.flatMap(item => 
        (item.reminders || []).map(r => ({
            ...r,
            itemId: item.id,
            itemName: item.name
        }))
    )

    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.category?.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter
        return matchesSearch && matchesCategory
    })

    const handleSaveItem = async (itemData) => {
        if (isNewItem) {
            // Insert new item
            const { data: newItem, error } = await supabase
                .from('items')
                .insert({
                    user_id: session.user.id,
                    name: itemData.name,
                    category: itemData.category,
                    description: itemData.description,
                    icon: itemData.icon,
                    color: itemData.color,
                    custom_image: itemData.customImage,
                    assigned_to: itemData.assignedTo,
                    assigned_from: itemData.assignedFrom,
                    assigned_until: itemData.assignedUntil
                })
                .select()
                .single()

            if (!error && newItem) {
                // Insert reminders
                if (itemData.reminders?.length > 0) {
                    await supabase.from('reminders').insert(
                        itemData.reminders.map(r => ({
                            item_id: newItem.id,
                            user_id: session.user.id,
                            title: r.title,
                            date: r.date
                        }))
                    )
                }
                // Refresh items
                const { data: refreshedItem } = await supabase
                    .from('items')
                    .select(`*, reminders (*), documents (*)`)
                    .eq('id', newItem.id)
                    .single()
                
                setItems([refreshedItem, ...items])
            }
        } else {
            // Update existing item
            const { error } = await supabase
                .from('items')
                .update({
                    name: itemData.name,
                    category: itemData.category,
                    description: itemData.description,
                    icon: itemData.icon,
                    color: itemData.color,
                    custom_image: itemData.customImage,
                    assigned_to: itemData.assignedTo,
                    assigned_from: itemData.assignedFrom,
                    assigned_until: itemData.assignedUntil,
                    updated_at: new Date().toISOString()
                })
                .eq('id', itemData.id)

            if (!error) {
                // Handle reminders - delete old ones, insert new ones
                await supabase.from('reminders').delete().eq('item_id', itemData.id)
                if (itemData.reminders?.length > 0) {
                    await supabase.from('reminders').insert(
                        itemData.reminders.map(r => ({
                            item_id: itemData.id,
                            user_id: session.user.id,
                            title: r.title,
                            date: r.date
                        }))
                    )
                }

                // Refresh the specific item
                const { data: refreshedItem } = await supabase
                    .from('items')
                    .select(`*, reminders (*), documents (*)`)
                    .eq('id', itemData.id)
                    .single()

                setItems(items.map(i => i.id === itemData.id ? refreshedItem : i))
            }
        }
        setSelectedItem(null)
        setIsNewItem(false)
    }

    const handleDeleteItem = async (item) => {
        if (confirm('Are you sure you want to delete this item?')) {
            const { error } = await supabase
                .from('items')
                .delete()
                .eq('id', item.id)

            if (!error) {
                setItems(items.filter(i => i.id !== item.id))
                setSelectedItem(null)
            }
        }
    }

    const handleAddItem = () => {
        setIsNewItem(true)
        setSelectedItem({
            name: '',
            category: '',
            description: '',
            icon: 'package',
            color: 'from-blue-500 to-blue-600',
            documents: [],
            reminders: []
        })
    }

    const handleReminderClick = (reminder) => {
        const item = items.find(i => i.id === reminder.itemId)
        if (item) setSelectedItem(item)
    }

    const handleSelectPlan = async (plan) => {
        // Call Stripe checkout API
        const response = await fetch('/api/create-checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                priceId: plan.stripePriceId,
                userId: session.user.id,
                email: session.user.email
            })
        })
        const { url } = await response.json()
        window.location.href = url
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
    }

    const handleAddMember = async (email) => {
        const { error } = await supabase
            .from('team_members')
            .insert({
                owner_id: session.user.id,
                member_email: email
            })
        
        if (error) throw error
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                                <Truck className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-slate-900 hidden sm:block">RentalHub</span>
                        </div>

                        {/* Search Bar - Desktop */}
                        <div className="hidden md:flex flex-1 max-w-md mx-8">
                            <div className="relative w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    type="text"
                                    placeholder="Search items..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 bg-slate-50 border-slate-200 focus:bg-white"
                                />
                            </div>
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-2">
                            <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setShowAddMember(true)}
                                className="hidden sm:flex items-center gap-2 text-slate-600 hover:text-blue-600"
                            >
                                <UserPlus className="w-4 h-4" />
                                <span className="text-sm">Add Member</span>
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => setShowAddMember(true)}
                                className="sm:hidden"
                            >
                                <UserPlus className="w-5 h-5 text-slate-600" />
                            </Button>
                            <Button variant="ghost" size="icon" className="relative">
                                <Bell className="w-5 h-5 text-slate-600" />
                                {allReminders.length > 0 && (
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                                )}
                            </Button>

                            {/* User Menu */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="flex items-center gap-2 pl-2 pr-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="bg-blue-100 text-blue-700 text-sm">
                                                {profile?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="hidden sm:block text-sm font-medium text-slate-700">
                                            {profile?.full_name || 'User'}
                                        </span>
                                        <ChevronDown className="w-4 h-4 text-slate-400" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <div className="px-3 py-2">
                                        <p className="text-sm font-medium text-slate-900">{profile?.full_name}</p>
                                        <p className="text-xs text-slate-500">{profile?.email}</p>
                                    </div>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => window.location.href = '/settings'}>
                                        <Settings className="w-4 h-4 mr-2" />
                                        Settings
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Log out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Mobile Menu Button */}
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="md:hidden"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </Button>
                        </div>
                    </div>

                    {/* Mobile Search */}
                    <AnimatePresence>
                        {mobileMenuOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="md:hidden pb-4 overflow-hidden"
                            >
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        type="text"
                                        placeholder="Search items..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 bg-slate-50"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Reminders Section */}
                <section className="mb-8">
                    <ClosestReminders 
                        reminders={allReminders} 
                        onReminderClick={handleReminderClick}
                    />
                </section>

                {/* Items Grid Section */}
                <section className="mb-16">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-slate-900">Your Items</h2>
                        <p className="text-sm text-slate-500">
                            {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
                        </p>
                    </div>
                    
                    {/* Category Filter */}
                    <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                        <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                        <button
                            onClick={() => setCategoryFilter('All')}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                                categoryFilter === 'All'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            All
                        </button>
                        {allCategories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setCategoryFilter(cat)}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                                    categoryFilter === cat
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <ItemGrid 
                        items={filteredItems}
                        onItemClick={(item) => {
                            setIsNewItem(false)
                            setSelectedItem(item)
                        }}
                        onAddItem={handleAddItem}
                    />
                </section>

                {/* Pricing Plans Section */}
                <section className="border-t border-slate-200 pt-8">
                    <PricingPlans 
                        currentPlan={profile?.plan || 'free'}
                        onSelectPlan={handleSelectPlan}
                        onManagePlan={() => window.location.href = '/settings'}
                    />
                </section>
            </main>

            {/* Item Modal */}
            <ItemModal
                item={selectedItem}
                isOpen={!!selectedItem}
                onClose={() => {
                    setSelectedItem(null)
                    setIsNewItem(false)
                }}
                onSave={handleSaveItem}
                onDelete={handleDeleteItem}
                isNew={isNewItem}
                categories={allCategories}
                onAddCategory={(cat) => setCustomCategories([...customCategories, cat])}
                userId={session.user.id}
            />

            {/* Add Member Dialog */}
            <AddMemberDialog
                isOpen={showAddMember}
                onClose={() => setShowAddMember(false)}
                userPlan={profile?.plan || 'free'}
                onAddMember={handleAddMember}
            />
        </div>
    )
}
