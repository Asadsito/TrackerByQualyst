import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Avatar, AvatarFallback } from "../components/ui/avatar"
import { 
    User, Mail, CreditCard, LogOut, ArrowLeft, 
    Check, Sparkles, Zap, Crown, Loader2, AlertCircle
} from 'lucide-react'

const planIcons = {
    free: Sparkles,
    starter: Zap,
    pro: Crown
}

const planLimits = {
    free: 3,
    starter: 25,
    pro: Infinity
}

export default function Settings({ session }) {
    const [searchParams] = useSearchParams()
    const [profile, setProfile] = useState(null)
    const [itemCount, setItemCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState('')

    useEffect(() => {
        // Check for Stripe redirect
        if (searchParams.get('success') === 'true') {
            setMessage('Subscription activated successfully!')
        }
        if (searchParams.get('canceled') === 'true') {
            setMessage('Checkout was canceled.')
        }
    }, [searchParams])

    useEffect(() => {
        const fetchData = async () => {
            // Fetch profile
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single()

            setProfile(profileData)

            // Count items
            const { count } = await supabase
                .from('items')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', session.user.id)

            setItemCount(count || 0)
            setLoading(false)
        }
        fetchData()
    }, [session])

    const handleLogout = async () => {
        await supabase.auth.signOut()
    }

    const handleCancelPlan = async () => {
        if (confirm('Are you sure you want to cancel your subscription?')) {
            // Call Stripe cancel API
            await fetch('/api/cancel-subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: session.user.id })
            })
            
            // Update local profile
            await supabase
                .from('profiles')
                .update({ plan: 'free' })
                .eq('id', session.user.id)
            
            setProfile({ ...profile, plan: 'free' })
            setMessage('Subscription canceled. You are now on the Free plan.')
        }
    }

    const handleManageBilling = async () => {
        // Redirect to Stripe Customer Portal
        const response = await fetch('/api/create-portal-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: session.user.id })
        })
        const { url } = await response.json()
        window.location.href = url
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        )
    }

    const PlanIcon = planIcons[profile?.plan] || Sparkles
    const limit = planLimits[profile?.plan] || 3
    const usagePercent = limit === Infinity ? 0 : (itemCount / limit) * 100

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4 md:p-8">
            <div className="max-w-2xl mx-auto">
                {/* Back Button */}
                <Button 
                    variant="ghost" 
                    onClick={() => window.location.href = '/'}
                    className="mb-6"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                </Button>

                <h1 className="text-2xl font-bold text-slate-900 mb-6">Settings</h1>

                {message && (
                    <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
                        message.includes('canceled') ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'
                    }`}>
                        {message.includes('canceled') ? <AlertCircle className="w-5 h-5" /> : <Check className="w-5 h-5" />}
                        {message}
                    </div>
                )}

                {/* Profile Card */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Profile
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarFallback className="bg-blue-100 text-blue-700 text-xl">
                                    {profile?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold text-lg">{profile?.full_name}</p>
                                <p className="text-slate-500 flex items-center gap-1">
                                    <Mail className="w-4 h-4" />
                                    {profile?.email}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Subscription Card */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5" />
                            Subscription
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                    profile?.plan === 'pro' ? 'bg-purple-100' :
                                    profile?.plan === 'starter' ? 'bg-blue-100' : 'bg-slate-100'
                                }`}>
                                    <PlanIcon className={`w-5 h-5 ${
                                        profile?.plan === 'pro' ? 'text-purple-600' :
                                        profile?.plan === 'starter' ? 'text-blue-600' : 'text-slate-600'
                                    }`} />
                                </div>
                                <div>
                                    <p className="font-semibold capitalize">{profile?.plan || 'Free'} Plan</p>
                                    <p className="text-sm text-slate-500">
                                        {profile?.plan === 'pro' ? '£25/month' :
                                         profile?.plan === 'starter' ? '£15/month' : 'Free'}
                                    </p>
                                </div>
                            </div>
                            <Badge className={
                                profile?.plan === 'pro' ? 'bg-purple-100 text-purple-700' :
                                profile?.plan === 'starter' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                            }>
                                Active
                            </Badge>
                        </div>

                        {/* Usage */}
                        <div className="pt-4 border-t">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-slate-600">Items used</span>
                                <span className="font-medium">
                                    {itemCount} / {limit === Infinity ? '∞' : limit}
                                </span>
                            </div>
                            {limit !== Infinity && (
                                <div className="w-full bg-slate-100 rounded-full h-2">
                                    <div 
                                        className={`h-2 rounded-full transition-all ${
                                            usagePercent > 90 ? 'bg-red-500' :
                                            usagePercent > 70 ? 'bg-amber-500' : 'bg-blue-500'
                                        }`}
                                        style={{ width: `${Math.min(usagePercent, 100)}%` }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4">
                            {profile?.plan !== 'free' && (
                                <>
                                    <Button variant="outline" onClick={handleManageBilling}>
                                        Manage Billing
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        onClick={handleCancelPlan}
                                    >
                                        Cancel Plan
                                    </Button>
                                </>
                            )}
                            {profile?.plan === 'free' && (
                                <Button 
                                    className="bg-blue-600 hover:bg-blue-700"
                                    onClick={() => window.location.href = '/#pricing'}
                                >
                                    Upgrade Plan
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Logout */}
                <Card>
                    <CardContent className="pt-6">
                        <Button 
                            variant="outline" 
                            className="w-full text-red-600 border-red-200 hover:bg-red-50"
                            onClick={handleLogout}
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Log Out
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
